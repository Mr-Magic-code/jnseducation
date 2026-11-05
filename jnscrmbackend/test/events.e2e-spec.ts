import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module.js';
import { EventsModule } from '../src/events/events.module.js';
import { DatabaseService } from '../src/database/database.service.js';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { RolesGuard } from '../src/auth/roles.guard.js';

const mockQuery = vi.fn();

const mockDatabaseService = {
  query: mockQuery,
} as unknown as DatabaseService;

describe('EventsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long';
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_USER = 'root';
    process.env.DATABASE_NAME = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, EventsModule],
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
    await app.close();
  });

  it('GET /events/public returns only Live events', async () => {
    mockQuery.mockResolvedValueOnce([
      {
        id: 1,
        event_name: 'Live Event',
        day_and_date: '2024-01-15',
        event_time: '10:00',
        venue: 'Lahore',
        cover_image: null,
        target_page: '/events/live-event',
        event_status: 'Live',
        status: 'Live',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    ]);

    const res = await request(app.getHttpServer())
      .get('/events/public')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].status).toBe('Live');
  });

  it('POST /admin/events creates an event', async () => {
    mockQuery.mockResolvedValueOnce({ affectedRows: 1, insertId: 42 });

    const res = await request(app.getHttpServer())
      .post('/admin/events')
      .send({
        event_name: 'Study Abroad Expo',
        day_date: '2024-02-15',
        event_time: '10:00 AM',
        venue: 'Lahore Expo Center',
        target_page: '/events/expo-2024',
        status: 'Live',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(42);
  });

  it('DELETE /admin/events deletes an event', async () => {
    mockQuery.mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app.getHttpServer())
      .delete('/admin/events?id=1')
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
