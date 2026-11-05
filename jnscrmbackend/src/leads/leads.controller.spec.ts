import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadsController } from './leads.controller.js';
import { LeadsService } from './leads.service.js';

describe('LeadsController', () => {
  let controller: LeadsController;
  const service = {
    create: vi.fn(),
    getFormTypes: vi.fn(),
    findAll: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new LeadsController(service as unknown as LeadsService);
  });

  it('creates a lead through the service', async () => {
    const dto = { form_type: 'Contact', form_data: { name: 'Test' } };
    service.create.mockResolvedValueOnce({ success: true, leadId: 1 });

    await expect(controller.create(dto)).resolves.toEqual({
      success: true,
      leadId: 1,
    });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('returns form types through the service', async () => {
    service.getFormTypes.mockResolvedValueOnce(['Contact']);

    await expect(controller.getFormTypes()).resolves.toEqual(['Contact']);
  });

  it('updates a lead status through the service', async () => {
    service.updateStatus.mockResolvedValueOnce({ success: true });

    await controller.updateStatus(5, { status: 'Read' });

    expect(service.updateStatus).toHaveBeenCalledWith(5, 'Read');
  });
});
