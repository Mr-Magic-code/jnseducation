import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { DatabaseService } from '../database/database.service.js';
import { GetPagesQueryDto } from './dto/get-pages-query.dto.js';
import { PageItemDto } from './dto/page-item.dto.js';

interface PageRow {
  id: number;
  page_title: string | null;
  slug: string | null;
  parent_page: string | null;
  is_indexed: number | boolean | null;
  status: string | null;
  created_at: string | null;
}

interface WriteResult {
  affectedRows?: number;
}

interface GitHubTreeItem {
  path: string;
  type: string;
}

interface GitHubRepo {
  default_branch?: string;
}

interface GitHubTree {
  tree?: GitHubTreeItem[];
}

@Injectable()
export class PagesService {
  constructor(private readonly dbService: DatabaseService) {}

  private formatTitle(str: string): string {
    return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private sanitizePageTitle(str: string): string {
    return sanitizeHtml(String(str || ''), {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  async getPagesFromDb(query: GetPagesQueryDto = {}) {
    try {
      const pageNum = Math.max(query.page ?? 1, 1);
      const limitNum = Math.min(Math.max(query.limit ?? 50, 1), 200);
      const searchQuery = query.search ? `%${query.search.trim()}%` : null;
      const isEventFilter = query.filter === 'events';

      let dataQuery = 'SELECT * FROM pages';
      const queryParams: string[] = [];
      const conditions: string[] = [];

      if (isEventFilter) {
        conditions.push(
          "(slug = 'events' OR slug LIKE 'events/%' OR parent_page = 'events' OR slug LIKE 'events-%' OR slug LIKE '%/events/%')",
        );
      }

      if (searchQuery) {
        conditions.push('(page_title LIKE ? OR slug LIKE ?)');
        queryParams.push(searchQuery, searchQuery);
      }

      if (conditions.length > 0) {
        dataQuery += ' WHERE ' + conditions.join(' AND ');
      }

      const rows = await this.dbService.query<PageRow[]>(dataQuery, queryParams);
      const allPages = Array.isArray(rows) ? rows : [];

      const sortPagesRecursively = (parentSlug: string | null): PageRow[] => {
        const result: PageRow[] = [];
        const children = allPages.filter(
          (p) => (p.parent_page || null) === parentSlug,
        );
        for (const child of children) {
          result.push(child, ...sortPagesRecursively(child.slug));
        }
        return result;
      };

      const topLevelPages = allPages.filter((p) => !p.parent_page);
      const sortedList: PageRow[] = [];

      for (const parent of topLevelPages) {
        sortedList.push(parent, ...sortPagesRecursively(parent.slug));
      }

      const remaining = allPages.filter((p) => !sortedList.includes(p));
      sortedList.push(...remaining);

      const total = sortedList.length;
      const offset = (pageNum - 1) * limitNum;
      const paginatedPages = sortedList.slice(offset, offset + limitNum);

      const formattedPages = paginatedPages.map((p) => ({
        name: p.page_title || 'Untitled Page',
        path: p.slug || '',
        parentPage: p.parent_page || 'None',
        isIndexed:
          p.is_indexed === 0 || p.is_indexed === false
            ? false
            : Boolean(p.is_indexed ?? true),
        status: p.status || 'PUBLISHED',
        created_at: p.created_at || null,
      }));

      return {
        success: true,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        pages: formattedPages,
      };
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw new InternalServerErrorException('Failed to fetch pages.');
    }
  }

  async scanGitHubPages(
    mode: 'preview' | 'sync' = 'preview',
    removeMissing = false,
    confirmDestructive = false,
  ) {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      throw new InternalServerErrorException(
        'GitHub credentials are not set in environment variables.',
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'JnS-CRM-Backend',
    };

    try {
      const repoResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        { headers },
      );
      if (!repoResponse.ok) {
        throw new Error(`GitHub repo request failed with ${repoResponse.status}`);
      }
      const repoData = (await repoResponse.json()) as GitHubRepo;
      const defaultBranch = repoData.default_branch || 'main';

      const treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers },
      );
      if (!treeResponse.ok) {
        throw new Error(
          `GitHub tree request failed with ${treeResponse.status}`,
        );
      }
      const data = (await treeResponse.json()) as GitHubTree;

      if (!data.tree) {
        return { success: true, scanned: 0, wouldRemove: 0, removed: 0, message: 'No tree structure found.' };
      }

      const appDirs = data.tree.filter(
        (item) =>
          item.type === 'tree' && item.path.startsWith('jnscrm/src/app/'),
      );

      const scannedSlugs = new Set<string>();
      const desiredPages = new Map<
        string,
        { slug: string; parent: string | null; title: string }
      >();

      const queuePage = (
        slug: string,
        parent: string | null,
        title: string,
      ) => {
        const key = `${parent ?? ''}|${slug}`;
        if (!desiredPages.has(key)) {
          desiredPages.set(key, { slug, parent, title });
        }
      };

      for (const dir of appDirs) {
        const relativeSlug = dir.path.replace('jnscrm/src/app/', '');
        if (
          !relativeSlug ||
          relativeSlug.startsWith('_') ||
          relativeSlug.includes('api')
        ) {
          continue;
        }

        scannedSlugs.add(relativeSlug);
        const pathSegments = relativeSlug.split('/');

        if (pathSegments.length > 1) {
          const parentSlug = pathSegments.slice(0, -1).join('/');
          scannedSlugs.add(parentSlug);
          const parentTitle = this.sanitizePageTitle(
            this.formatTitle(pathSegments[pathSegments.length - 2]),
          );
          const grandParentSlug =
            pathSegments.length > 2
              ? pathSegments.slice(0, -2).join('/')
              : null;

          queuePage(parentSlug, grandParentSlug, parentTitle);
        }

        const pageTitle = this.sanitizePageTitle(
          this.formatTitle(pathSegments[pathSegments.length - 1]),
        );
        const parentSlug =
          pathSegments.length > 1
            ? pathSegments.slice(0, -1).join('/')
            : null;

        queuePage(relativeSlug, parentSlug, pageTitle);
      }

      // Single read instead of two existence checks per directory.
      const existingRows = await this.dbService.query<PageRow[]>(
        'SELECT id, page_title, slug, parent_page FROM pages',
      );
      const existingByKey = new Map<string, PageRow>();
      for (const row of Array.isArray(existingRows) ? existingRows : []) {
        existingByKey.set(`${row.parent_page ?? ''}|${row.slug ?? ''}`, row);
      }

      const toInsert: { slug: string; parent: string | null; title: string }[] = [];
      const toUpdate: { id: number; title: string }[] = [];

      for (const [key, page] of desiredPages) {
        const existing = existingByKey.get(key);
        if (!existing) {
          toInsert.push(page);
        } else if ((existing.page_title ?? '') !== page.title) {
          toUpdate.push({ id: existing.id, title: page.title });
        }
      }

      const wouldInsert = toInsert.length;
      const wouldUpdate = toUpdate.length;

      let removedCount = 0;
      if (mode === 'sync') {
        const INSERT_CHUNK_SIZE = 200;
        for (let i = 0; i < toInsert.length; i += INSERT_CHUNK_SIZE) {
          const chunk = toInsert.slice(i, i + INSERT_CHUNK_SIZE);
          const placeholders = chunk
            .map(() => `(?, ?, ?, 'PUBLISHED', NOW(), NOW())`)
            .join(', ');
          const params = chunk.flatMap((page) => [
            page.title,
            page.slug,
            page.parent,
          ]);

          await this.dbService.query(
            `INSERT INTO pages (page_title, slug, parent_page, status, publish_date, created_at) VALUES ${placeholders}`,
            params,
          );
        }

        for (const page of toUpdate) {
          await this.dbService.query(
            'UPDATE pages SET page_title = ? WHERE id = ?',
            [page.title, page.id],
          );
        }

        if (removeMissing && confirmDestructive && scannedSlugs.size > 0) {
          const slugsArray = Array.from(scannedSlugs);
          const placeholders = slugsArray.map(() => '?').join(',');
          const deleteResult = await this.dbService.query<WriteResult>(
            `DELETE FROM pages WHERE slug NOT IN (${placeholders})`,
            slugsArray,
          );
          removedCount = Number(deleteResult?.affectedRows) || 0;
        }
      }

      return {
        success: true,
        scanned: scannedSlugs.size,
        wouldInsert,
        wouldUpdate,
        removed: removedCount,
        message:
          mode === 'sync'
            ? `GitHub repository synchronized. Inserted ${wouldInsert}, updated ${wouldUpdate}, removed ${removedCount} page(s).`
            : `Preview: ${scannedSlugs.size} page(s) found. Would insert ${wouldInsert}, update ${wouldUpdate}. Use mode=sync to apply.`,
      };
    } catch (error) {
      console.error('Error scanning GitHub pages:', error);
      throw new BadGatewayException('Failed to scan GitHub pages.');
    }
  }

  async savePagesToDb(pages: PageItemDto[]) {
    if (!pages?.length) {
      return { success: false, message: 'No pages provided to save.' };
    }

    try {
      const desiredPages = new Map<
        string,
        { slug: string; parent: string | null; title: string }
      >();

      const queuePage = (
        slug: string,
        parent: string | null,
        title: string,
      ) => {
        const key = `${parent ?? ''}|${slug}`;
        if (!desiredPages.has(key)) {
          desiredPages.set(key, { slug, parent, title });
        }
      };

      for (const page of pages) {
        const relativeSlug = page.path.startsWith('jnscrm/src/app/')
          ? page.path.replace('jnscrm/src/app/', '')
          : page.path;

        if (
          !relativeSlug ||
          relativeSlug.startsWith('_') ||
          relativeSlug.includes('api')
        ) {
          continue;
        }

        const pathSegments = relativeSlug.split('/');
        const parentSlug =
          pathSegments.length > 1
            ? pathSegments.slice(0, -1).join('/')
            : null;

        if (pathSegments.length > 1) {
          const parentTitle = this.sanitizePageTitle(
            this.formatTitle(pathSegments[pathSegments.length - 2]),
          );
          const grandParentSlug =
            pathSegments.length > 2
              ? pathSegments.slice(0, -2).join('/')
              : null;

          queuePage(
            pathSegments.slice(0, -1).join('/'),
            grandParentSlug,
            parentTitle,
          );
        }

        const pageTitle = this.sanitizePageTitle(
          page.name
            ? this.formatTitle(page.name)
            : this.formatTitle(pathSegments[pathSegments.length - 1]),
        );

        queuePage(relativeSlug, parentSlug, pageTitle);
      }

      const existingRows = await this.dbService.query<PageRow[]>(
        'SELECT id, page_title, slug, parent_page, status FROM pages',
      );
      const existingByKey = new Map<string, PageRow>();
      for (const row of Array.isArray(existingRows) ? existingRows : []) {
        existingByKey.set(`${row.parent_page ?? ''}|${row.slug ?? ''}`, row);
      }

      const toInsert: { slug: string; parent: string | null; title: string }[] = [];
      const toUpdate: { id: number; title: string }[] = [];

      for (const [key, page] of desiredPages) {
        const existing = existingByKey.get(key);
        if (!existing) {
          toInsert.push(page);
        } else if (
          (existing.page_title ?? '') !== page.title ||
          (existing.status ?? '').toUpperCase() !== 'PUBLISHED'
        ) {
          toUpdate.push({ id: existing.id, title: page.title });
        }
      }

      const INSERT_CHUNK_SIZE = 200;
      for (let i = 0; i < toInsert.length; i += INSERT_CHUNK_SIZE) {
        const chunk = toInsert.slice(i, i + INSERT_CHUNK_SIZE);
        const placeholders = chunk
          .map(() => `(?, ?, ?, 'PUBLISHED', NOW(), NOW())`)
          .join(', ');
        const params = chunk.flatMap((page) => [
          page.title,
          page.slug,
          page.parent,
        ]);

        await this.dbService.query(
          `INSERT INTO pages (page_title, slug, parent_page, status, publish_date, created_at) VALUES ${placeholders}`,
          params,
        );
      }

      for (const page of toUpdate) {
        await this.dbService.query(
          `UPDATE pages SET page_title = ?, status = 'PUBLISHED' WHERE id = ?`,
          [page.title, page.id],
        );
      }

      const savedCount = toInsert.length + toUpdate.length;

      return {
        success: true,
        message: `Successfully saved or updated ${savedCount} page(s).`,
      };
    } catch (error) {
      console.error('Error saving pages:', error);
      throw new InternalServerErrorException('Failed to save pages.');
    }
  }
}
