import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { DatabaseService } from '../database/database.service.js';
import { CreateBlogDto } from './dto/create-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...new Set([
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'figure',
      'figcaption',
      'span',
    ]),
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
  },
};

@Injectable()
export class BlogsService {
  constructor(private readonly db: DatabaseService) {}

  async getAllCategories() {
    try {
      const rows = await this.db.query(
        'SELECT * FROM blog_categories ORDER BY name ASC',
      );
      return { categories: rows };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async createCategory(name: string, slug?: string) {
    try {
      const finalSlug = this.slugify(slug || name);

      if (!finalSlug) {
        throw new BadRequestException('A valid category slug is required.');
      }

      const existing: any = await this.db.query(
        'SELECT id FROM blog_categories WHERE slug = ? LIMIT 1',
        [finalSlug],
      );

      if (existing.length) {
        throw new BadRequestException('A category with this slug already exists.');
      }

      await this.db.query(
        'INSERT INTO blog_categories (name, slug) VALUES (?, ?)',
        [name.trim(), finalSlug],
      );
      return { success: true, message: 'Category created successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating category:', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async updateCategory(id: number, name: string, slug?: string) {
    try {
      const finalSlug = this.slugify(slug || name);

      if (!finalSlug) {
        throw new BadRequestException('A valid category slug is required.');
      }

      const duplicate: any = await this.db.query(
        'SELECT id FROM blog_categories WHERE slug = ? AND id <> ? LIMIT 1',
        [finalSlug, id],
      );

      if (duplicate.length) {
        throw new BadRequestException('A category with this slug already exists.');
      }

      const result: any = await this.db.query(
        'UPDATE blog_categories SET name = ?, slug = ? WHERE id = ?',
        [name.trim(), finalSlug, id],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException('Category not found.');
      }

      return { success: true, message: 'Category updated successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error updating category:', error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async deleteCategory(id: number) {
    try {
      const result: any = await this.db.query(
        'DELETE FROM blog_categories WHERE id = ?',
        [id],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException('Category not found.');
      }

      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error &&
        typeof error === 'object' &&
        (error as { code?: string }).code === 'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new BadRequestException(
          'This category is used by one or more blogs and cannot be deleted.',
        );
      }
      console.error('Error deleting category:', error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  async getAllBlogs(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = '',
  ) {
    try {
      const parsedPage = Math.max(Number(page) || 1, 1);
      const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
      const offset = (parsedPage - 1) * parsedLimit;

      let query = `
        SELECT b.*, c.name as category_name
        FROM blogs b
        LEFT JOIN blog_categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM blogs b
        LEFT JOIN blog_categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const queryParams: any[] = [];
      const countParams: any[] = [];

      if (search) {
        const term = `%${search.trim()}%`;
        query += ` AND (b.title LIKE ? OR b.slug LIKE ? OR b.content LIKE ? OR c.name LIKE ?)`;
        countQuery += ` AND (b.title LIKE ? OR b.slug LIKE ? OR b.content LIKE ? OR c.name LIKE ?)`;
        queryParams.push(term, term, term, term);
        countParams.push(term, term, term, term);
      }

      if (status && status !== 'All') {
        query += ` AND b.status = ?`;
        countQuery += ` AND b.status = ?`;
        queryParams.push(status);
        countParams.push(status);
      }

      query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(parsedLimit, offset);

      const blogs = await this.db.query(query, queryParams);
      const countRows: any = await this.db.query(countQuery, countParams);
      const total = Number(countRows[0]?.total) || 0;

      return {
        blogs,
        total,
        totalPages: Math.max(Math.ceil(total / parsedLimit), 1),
        currentPage: parsedPage,
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw new InternalServerErrorException('Failed to fetch blogs');
    }
  }

  async createBlog(data: CreateBlogDto, currentUser?: { full_name: string; role: string }) {
    try {
      const title = (data.title?.trim() || data.author_name?.trim() || 'Untitled');
      const finalSlug = await this.ensureUniqueSlug(
        this.slugify(data.slug || title),
      );
      const now = new Date();

      const result: any = await this.db.query(
        `INSERT INTO blogs (title, slug, category_id, cover_image, content, status, author_name, author_role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          finalSlug,
          data.category_id ?? null,
          data.cover_image || null,
          this.sanitizeContent(data.content ?? ''),
          data.status || 'draft',
          currentUser?.full_name ?? (data.author_name?.trim() || title),
          currentUser?.role ?? (data.author_role?.trim() || 'Admin'),
          now,
          now,
        ],
      );

      return {
        success: true,
        message: 'Blog published successfully',
        id: result.insertId,
      };
    } catch (error) {
      console.error('Error creating blog:', error);
      throw new InternalServerErrorException('Failed to create blog');
    }
  }

  async updateBlog(id: number, data: UpdateBlogDto, currentUser?: { full_name: string; role: string }) {
    try {
      const existingRows: any = await this.db.query(
        'SELECT * FROM blogs WHERE id = ? LIMIT 1',
        [id],
      );

      if (!existingRows.length) {
        throw new NotFoundException('Blog not found.');
      }

      const existing = existingRows[0];
      const title = data.title ?? existing.title;
      const slugSource = data.slug ?? existing.slug ?? title;
      const finalSlug = await this.ensureUniqueSlug(
        this.slugify(slugSource),
        id,
      );
      const now = new Date();

      await this.db.query(
        `UPDATE blogs
         SET title = ?, slug = ?, category_id = ?, cover_image = ?, content = ?, status = ?, author_name = ?, author_role = ?, updated_at = ?
         WHERE id = ?`,
        [
          title.trim(),
          finalSlug,
          data.category_id ?? existing.category_id ?? null,
          data.cover_image ?? existing.cover_image ?? null,
          this.sanitizeContent(data.content ?? existing.content),
          data.status ?? existing.status ?? 'draft',
          currentUser?.full_name ?? (data.author_name ?? existing.author_name ?? 'Admin').trim(),
          currentUser?.role ?? (data.author_role ?? existing.author_role ?? 'Admin').trim(),
          now,
          id,
        ],
      );

      return { success: true, message: 'Blog updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating blog:', error);
      throw new InternalServerErrorException('Failed to update blog');
    }
  }

  async updateBlogStatus(id: number, status: string) {
    try {
      const result: any = await this.db.query(
        'UPDATE blogs SET status = ?, updated_at = ? WHERE id = ?',
        [status, new Date(), id],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException('Blog not found.');
      }

      return { success: true, message: 'Blog status updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating blog status:', error);
      throw new InternalServerErrorException('Failed to update blog status');
    }
  }

  async deleteBlog(id: number) {
    try {
      const result: any = await this.db.query('DELETE FROM blogs WHERE id = ?', [
        id,
      ]);

      if (result.affectedRows === 0) {
        throw new NotFoundException('Blog not found.');
      }

      return { success: true, message: 'Blog deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting blog:', error);
      throw new InternalServerErrorException('Failed to delete blog');
    }
  }

  private slugify(value: string): string {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(
    requestedSlug: string,
    excludeId?: number,
  ): Promise<string> {
    const base = requestedSlug || `blog-${Date.now()}`;
    let candidate = base;
    let suffix = 2;

    while (true) {
      const rows: any = excludeId
        ? await this.db.query(
            'SELECT id FROM blogs WHERE slug = ? AND id <> ? LIMIT 1',
            [candidate, excludeId],
          )
        : await this.db.query('SELECT id FROM blogs WHERE slug = ? LIMIT 1', [
            candidate,
          ]);

      if (!rows.length) {
        return candidate;
      }

      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
  }

  private sanitizeContent(content: string): string {
    return sanitizeHtml(String(content || ''), SANITIZE_OPTIONS);
  }
}
