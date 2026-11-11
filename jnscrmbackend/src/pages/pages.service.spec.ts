import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PagesService } from './pages.service.js';

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

describe('PagesService', () => {
  let service: PagesService;
  const db = { query: vi.fn() };
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITHUB_OWNER = 'owner';
    process.env.GITHUB_REPO = 'repo';
    process.env.GITHUB_TOKEN = 'token';
    service = new PagesService(db as any);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('scans with one SELECT and one batched INSERT for new pages', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ default_branch: 'main' }))
      .mockResolvedValueOnce(
        jsonResponse({
          tree: [
            { path: 'jnscrm/src/app', type: 'tree' },
            { path: 'jnscrm/src/app/about-us', type: 'tree' },
            { path: 'jnscrm/src/app/about-us/page.tsx', type: 'blob' },
            { path: 'jnscrm/src/app/new-page', type: 'tree' },
            { path: 'jnscrm/src/app/new-page/page.tsx', type: 'blob' },
          ],
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    db.query
      .mockResolvedValueOnce([
        {
          id: 1,
          page_title: 'About Us',
          slug: 'about-us',
          parent_page: null,
          status: 'PUBLISHED',
        },
      ])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const result = await service.scanGitHubPages('sync', false);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(result.wouldInsert).toBe(1);
    expect(result.wouldUpdate).toBe(0);

    const insertCall = db.query.mock.calls[1];
    expect(insertCall[0]).toContain('INSERT INTO pages');
    expect(insertCall[1]).toEqual(['New Page', 'new-page', null]);
  });

  it('previews without writing to the database', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ default_branch: 'main' }))
        .mockResolvedValueOnce(
          jsonResponse({
            tree: [{ path: 'jnscrm/src/app/new-page', type: 'tree' }],
          }),
        ),
    );

    db.query.mockResolvedValueOnce([]);

    const result = await service.scanGitHubPages('preview', false);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(result.wouldInsert).toBe(1);
    expect(result.message).toContain('Preview');
  });

  it('saves pages with one SELECT and one batched INSERT', async () => {
    db.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ affectedRows: 2 });

    const result = await service.savePagesToDb([
      { name: 'Parent', path: 'parent' },
      { name: 'Child', path: 'parent/child' },
    ]);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.message).toContain('2 page(s)');

    const insertCall = db.query.mock.calls[1];
    expect(insertCall[0]).toContain('INSERT INTO pages');
    expect(insertCall[1]).toEqual([
      'Parent',
      'parent',
      null,
      'Child',
      'parent/child',
      'parent',
    ]);
  });
});
