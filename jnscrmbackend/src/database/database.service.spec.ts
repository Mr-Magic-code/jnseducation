import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseService } from './database.service.js';

const { execute, end } = vi.hoisted(() => ({
  execute: vi.fn(),
  end: vi.fn(),
}));

vi.mock('mysql2/promise', () => ({
  createPool: vi.fn(() => ({ execute, end })),
}));

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_USER = 'root';
    process.env.DATABASE_NAME = 'test';
    service = new DatabaseService();
  });

  it('initializes a pool and executes queries', async () => {
    execute.mockResolvedValueOnce([[{ id: 1 }], []]);
    await service.onModuleInit();

    await expect(service.query('SELECT 1')).resolves.toEqual([{ id: 1 }]);
    expect(execute).toHaveBeenCalledWith('SELECT 1', undefined);
  });

  it('rejects queries before initialization', async () => {
    await expect(service.query('SELECT 1')).rejects.toThrow(
      'Database pool has not been initialized.',
    );
  });

  it('closes the pool on destroy', async () => {
    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(end).toHaveBeenCalled();
  });
});
