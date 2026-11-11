import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  let service: DashboardService;
  const db = { query: vi.fn() };

  const superAdmin = {
    id: 1,
    full_name: 'Super Admin',
    email: 'admin@example.com',
    role: 'Super-Admin',
    status: 'approved',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService(db as any);
  });

  it('returns the aggregated summary with a single counts query', async () => {
    db.query
      .mockResolvedValueOnce([
        {
          leadsTotal: '12',
          leadsUnreadTotal: '3',
          pagesTotal: '32',
          blogsTotal: '5',
          usersTotal: '7',
          pendingRequestsTotal: '2',
        },
      ])
      .mockResolvedValueOnce([{ id: 10, status: 'Unread' }])
      .mockResolvedValueOnce([
        {
          page_title: 'About Us',
          slug: 'about-us',
          parent_page: null,
          is_indexed: 1,
          status: 'PUBLISHED',
          created_at: '2026-01-01',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 2,
          full_name: 'Manager',
          email: 'manager@example.com',
          role: 'Manager',
          status: 'pending',
          created_at: '2026-01-01',
        },
      ]);

    const result = await service.getSummary(superAdmin);

    expect(db.query).toHaveBeenCalledTimes(4);
    expect(result.leads.total).toBe(12);
    expect(result.leads.unreadTotal).toBe(3);
    expect(result.pages.total).toBe(32);
    expect(result.pages.recent[0]).toMatchObject({
      name: 'About Us',
      path: 'about-us',
      parentPage: 'None',
      isIndexed: true,
    });
    expect(result.blogs.total).toBe(5);
    expect(result.users.total).toBe(7);
    expect(result.requests.total).toBe(2);
    expect(result.requests.pending).toHaveLength(1);
    expect(result.user).toEqual(superAdmin);
  });

  it('does not query pending requests for managers', async () => {
    db.query
      .mockResolvedValueOnce([
        {
          leadsTotal: 0,
          leadsUnreadTotal: 0,
          pagesTotal: 0,
          blogsTotal: 0,
          usersTotal: 1,
          pendingRequestsTotal: 0,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await service.getSummary({
      ...superAdmin,
      role: 'Manager',
    });

    expect(db.query).toHaveBeenCalledTimes(3);
    expect(result.requests.pending).toEqual([]);
  });
});
