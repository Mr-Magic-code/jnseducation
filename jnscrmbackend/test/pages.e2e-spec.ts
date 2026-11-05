import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module.js';
import { PagesModule } from '../src/pages/pages.module.js';
import { DatabaseService } from '../src/database/database.service.js';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { RolesGuard } from '../src/auth/roles.guard.js';

const mockQuery = vi.fn();

const mockDatabaseService = {
  query: mockQuery,
} as unknown as DatabaseService;

describe('PagesController (e2e)', () => {
  let app: INestApplication;
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    vi.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long';
    process.env.GITHUB_OWNER = 'test-owner';
    process.env.GITHUB_REPO = 'test-repo';
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_USER = 'root';
    process.env.DATABASE_NAME = 'test';

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ default_branch: 'main' }),
      } as Response),
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, PagesModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDatabaseService)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    await app.close();
  });

  it('GET /admin/pages returns paginated pages', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 1, page_title: 'About Us', slug: 'about-us', parent_page: null, is_indexed: 1, status: 'PUBLISHED', created_at: '2024-01-01T00:00:00.000Z' },
      { id: 2, page_title: 'Contact', slug: 'contact', parent_page: null, is_indexed: 1, status: 'PUBLISHED', created_at: '2024-01-01T00:00:00.000Z' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/admin/pages?page=1&limit=10')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.pages.length).toBeGreaterThan(0);
  });

  it('POST /admin/pages/scan preview mode does not modify database', async () => {
    mockQuery.mockResolvedValueOnce([]); // no existing parent
    mockQuery.mockResolvedValueOnce([]); // no existing page

    const res = await request(app.getHttpServer())
      .post('/admin/pages/scan')
      .send({ mode: 'preview' })
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('POST /admin/pages/save saves pages', async () => {
    mockQuery.mockResolvedValueOnce([]); // no existing parent
    mockQuery.mockResolvedValueOnce([]); // no existing page
    mockQuery.mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app.getHttpServer())
      .post('/admin/pages/save')
      .send([{ name: 'Test Page', path: 'test-page' }])
      .expect(201);

    expect(res.body.success).toBe(true);
  });
});
