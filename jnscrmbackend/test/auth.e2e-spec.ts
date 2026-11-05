import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module.js';
import { DatabaseService } from '../src/database/database.service.js';

const mockQuery = vi.fn();

const mockDatabaseService = {
  query: mockQuery,
} as unknown as DatabaseService;

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long';
    process.env.SUPER_ADMIN_SECRET_KEY = 'super-secret-key-at-least-32-chars-long';
    process.env.MANAGER_SECRET_KEY = 'manager-secret-key-at-least-32-chars-long';
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_USER = 'root';
    process.env.DATABASE_NAME = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDatabaseService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register-manager registers a pending manager', async () => {
    mockQuery.mockResolvedValueOnce([]); // no existing user
    mockQuery.mockResolvedValueOnce([]); // hasColumn check (branch_office not present)
    mockQuery.mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app.getHttpServer())
      .post('/auth/register-manager')
      .send({
        full_name: 'Manager User',
        email: 'manager@example.com',
        password: 'password123',
        secretKey: 'manager-secret-key-at-least-32-chars-long',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('POST /auth/register-super-admin rejects invalid secret key', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register-super-admin')
      .send({
        full_name: 'Admin',
        email: 'admin@jnsedu.com',
        password: 'password123',
        secretKey: 'wrong-key',
      })
      .expect(401);

    expect(res.body.message).toBe('Invalid secret key!');
  });

  it('POST /auth/login rejects invalid credentials', async () => {
    mockQuery.mockResolvedValueOnce([]); // no user found

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it.skip('POST /auth/login succeeds with valid credentials', async () => {
    const userRow = {
      id: 1,
      full_name: 'Test User',
      email: 'user@example.com',
      password: '$2b$10$anyhash',
      role: 'Manager',
      status: 'approved',
      created_at: '2024-01-01T00:00:00.000Z',
    };
    mockQuery.mockResolvedValueOnce([userRow]);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('GET /auth/me returns 401 without token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
