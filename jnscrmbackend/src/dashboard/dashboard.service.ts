import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

export interface SummaryUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
}

interface LeadRow {
  id: number;
  form_type: string;
  form_data: string | Record<string, unknown>;
  source_url: string;
  status: string;
  created_at: string;
}

interface PageRow {
  page_title: string | null;
  slug: string | null;
  parent_page: string | null;
  is_indexed: number | boolean | null;
  status: string | null;
  created_at: string | null;
}

interface RequestRow {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface CountRow {
  leadsTotal: number | string | null;
  leadsUnreadTotal: number | string | null;
  pagesTotal: number | string | null;
  blogsTotal: number | string | null;
  usersTotal: number | string | null;
  pendingRequestsTotal: number | string | null;
}

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getSummary(user: SummaryUser) {
    const isSuperAdmin = user.role === 'Super-Admin';

    const countRows = await this.db.query<CountRow[]>(`
      SELECT
        (SELECT COUNT(*) FROM leads) AS leadsTotal,
        (SELECT COUNT(*) FROM leads WHERE LOWER(status) = 'unread') AS leadsUnreadTotal,
        (SELECT COUNT(*) FROM pages) AS pagesTotal,
        (SELECT COUNT(*) FROM blogs) AS blogsTotal,
        (SELECT COUNT(*) FROM users WHERE status = 'approved') AS usersTotal,
        (SELECT COUNT(*) FROM users WHERE status = 'pending' AND role = 'Manager') AS pendingRequestsTotal
    `);
    const counts = countRows?.[0] ?? ({} as CountRow);

    const [unreadLeads, recentPages, pendingRequests] = await Promise.all([
      this.db.query<LeadRow[]>(
        `SELECT * FROM leads WHERE LOWER(status) = 'unread' ORDER BY created_at DESC LIMIT 5`,
      ),
      this.db.query<PageRow[]>(
        `SELECT * FROM pages ORDER BY created_at DESC LIMIT 5`,
      ),
      isSuperAdmin
        ? this.db.query<RequestRow[]>(
            `SELECT id, full_name, email, role, status, created_at
             FROM users
             WHERE status = 'pending' AND role = 'Manager'
             ORDER BY created_at ASC`,
          )
        : Promise.resolve([] as RequestRow[]),
    ]);

    return {
      success: true,
      user,
      leads: {
        total: Number(counts.leadsTotal) || 0,
        unreadTotal: Number(counts.leadsUnreadTotal) || 0,
        unread: Array.isArray(unreadLeads) ? unreadLeads : [],
      },
      pages: {
        total: Number(counts.pagesTotal) || 0,
        recent: (Array.isArray(recentPages) ? recentPages : []).map((page) => ({
          name: page.page_title || 'Untitled Page',
          path: page.slug || '',
          parentPage: page.parent_page || 'None',
          isIndexed:
            page.is_indexed === 0 || page.is_indexed === false
              ? false
              : Boolean(page.is_indexed ?? true),
          status: page.status || 'PUBLISHED',
          created_at: page.created_at || null,
        })),
      },
      blogs: {
        total: Number(counts.blogsTotal) || 0,
      },
      users: {
        total: Number(counts.usersTotal) || 0,
      },
      requests: {
        total: Number(counts.pendingRequestsTotal) || 0,
        pending: Array.isArray(pendingRequests) ? pendingRequests : [],
      },
    };
  }
}
