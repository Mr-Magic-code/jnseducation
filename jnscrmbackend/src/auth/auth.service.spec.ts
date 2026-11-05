import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const db = { query: vi.fn() };
  const jwt = { sign: vi.fn(() => 'signed-token') };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPER_ADMIN_SECRET_KEY = 'super-secret';
    process.env.MANAGER_SECRET_KEY = 'manager-secret';
    service = new AuthService(db as any, jwt as any);
  });

  it('rejects a manager registration with an invalid secret key', async () => {
    await expect(
      service.register(
        {
          full_name: 'Manager',
          email: 'manager@example.com',
          password: 'password123',
          secretKey: 'wrong',
        },
        'manager',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('registers a manager as pending', async () => {
    db.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const result = await service.register(
      {
        full_name: 'Manager',
        email: 'manager@example.com',
        password: 'password123',
        secretKey: 'manager-secret',
      },
      'manager',
    );

    expect(result.success).toBe(true);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.arrayContaining(['Manager', 'manager@example.com', 'Manager', 'pending']),
    );
  });

  it('deletes a pending manager request', async () => {
    db.query.mockResolvedValueOnce({ affectedRows: 1 });

    const result = await service.handleManagerRequest(2, 'reject');

    expect(result.success).toBe(true);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM users'),
      [2],
    );
  });

  it('prevents a user from deleting their own account', async () => {
    await expect(service.deleteUser(1, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
