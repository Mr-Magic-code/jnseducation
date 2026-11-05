import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadsService } from './leads.service.js';

describe('LeadsService', () => {
  let service: LeadsService;
  const db = { query: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LeadsService(db as any);
  });

  it('creates a lead and returns the inserted id', async () => {
    db.query.mockResolvedValueOnce({ insertId: 42 });

    const result = await service.create({
      form_type: 'Contact',
      form_data: { name: 'Test' },
      source_url: 'https://example.com',
    });

    expect(result).toEqual({
      success: true,
      message: 'Lead saved successfully',
      leadId: 42,
    });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO leads'),
      ['Contact', JSON.stringify({ name: 'Test' }), 'https://example.com'],
    );
  });

  it('clamps oversized page limits', async () => {
    db.query.mockResolvedValueOnce([]);
    db.query.mockResolvedValueOnce([{ total: 0 }]);

    await service.findAll(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      5000,
    );

    expect(db.query.mock.calls[0][1]).toContain(200);
  });

  it('updates a lead status', async () => {
    db.query.mockResolvedValueOnce({ affectedRows: 1 });

    const result = await service.updateStatus(1, 'Read');

    expect(result.success).toBe(true);
    expect(db.query).toHaveBeenCalledWith(
      'UPDATE leads SET status = ? WHERE id = ?',
      ['Read', 1],
    );
  });

  it('throws when updating a missing lead', async () => {
    db.query.mockResolvedValueOnce({ affectedRows: 0 });

    await expect(service.updateStatus(999, 'Read')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
