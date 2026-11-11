import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { DatabaseService } from '../database/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';

interface ActorContext {
  id?: number;
  email?: string;
  role?: string;
  ip?: string;
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly db: DatabaseService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  private sanitizeFormData(data: unknown): unknown {
    if (typeof data === 'string') {
      return sanitizeHtml(String(data), {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeFormData(item));
    }
    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(
        data as Record<string, unknown>,
      )) {
        sanitized[key] = this.sanitizeFormData(value);
      }
      return sanitized;
    }
    return data;
  }

  async create(createLeadDto: CreateLeadDto) {
    const { form_type, form_data, source_url } = createLeadDto;
    const sanitizedFormData = this.sanitizeFormData(form_data);
    const query = `
      INSERT INTO leads (form_type, form_data, source_url, status, created_at) 
      VALUES (?, ?, ?, 'Unread', NOW())
    `;

    const result: any = await this.db.query(query, [
      form_type,
      JSON.stringify(sanitizedFormData),
      source_url || '',
    ]);

    const leadId = result.insertId;
    const crmUrl = process.env.CRM_API_URL;

    if (!crmUrl) {
      return {
        success: true,
        message: 'Lead saved successfully',
        leadId,
      };
    }

    // Never block the public form on a third-party CRM. The lead is already
    // durably stored; synchronization happens out-of-band with retries.
    void this.forwardToCustomCRMWithRetry(createLeadDto, leadId)
      .then((crmResult) => {
        if (!crmResult.success) {
          console.error(
            `CRM sync failed for lead ID ${leadId}: ${crmResult.error?.message}`,
          );
        }
      })
      .catch((error: unknown) => {
        console.error(
          `CRM sync crashed for lead ID ${leadId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });

    return {
      success: true,
      message: 'Lead saved successfully; CRM sync queued.',
      leadId,
      crmSyncQueued: true,
    };
  }

  /**
   * Forward a lead to the configured CRM with bounded retries and a timeout.
   * Returns { success: false } on final failure (never throws).
   */
  private async forwardToCustomCRMWithRetry(
    payload: CreateLeadDto,
    leadId: number,
    maxRetries = 3,
  ): Promise<{ success: boolean; error?: Error }> {
    const crmUrl = process.env.CRM_API_URL;

    if (!crmUrl) {
      return { success: true };
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(crmUrl);
    } catch {
      return {
        success: false,
        error: new Error('CRM_API_URL is not a valid URL.'),
      };
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        success: false,
        error: new Error('CRM_API_URL must use http or https.'),
      };
    }

    const crmToken = process.env.CRM_API_TOKEN;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (crmToken) {
      headers.Authorization = `Bearer ${crmToken}`;
    }

    const crmPayload = this.transformForCrm(payload);
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(crmUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(crmPayload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`CRM responded with status ${response.status}`);
        }

        return { success: true };
      } catch (error: unknown) {
        lastError =
          error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          console.error(
            `CRM sync for lead ${leadId} failed after ${maxRetries} attempts.`,
          );
          return { success: false, error: lastError };
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt)),
        );
      } finally {
        clearTimeout(timeoutId);
      }
    }

    return {
      success: false,
      error: lastError || new Error('CRM sync failed with unknown error'),
    };
  }

  private transformForCrm(dto: CreateLeadDto): any {
    const { form_type, form_data, source_url } = dto;
    const sanitized = this.sanitizeFormData(form_data);

    return {
      form_type,
      form_data: JSON.stringify(sanitized),
      source_url: source_url || '',
    };
  }

  async getFormTypes(): Promise<string[]> {
    const query = `SELECT DISTINCT form_type FROM leads WHERE form_type IS NOT NULL AND form_type != '' ORDER BY form_type ASC`;
    const result: any = await this.db.query(query);
    return Array.isArray(result) ? result.map((row) => row.form_type) : [];
  }

  async findAll(
    formType?: string,
    status?: string,
    search?: string,
    dateFilter?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 100,
  ) {
    let query = `SELECT * FROM leads WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM leads WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (formType && formType !== 'All Forms') {
      query += ` AND form_type = ?`;
      countQuery += ` AND form_type = ?`;
      params.push(formType);
      countParams.push(formType);
    }

    if (status && status !== 'All Type') {
      query += ` AND LOWER(status) = LOWER(?)`;
      countQuery += ` AND LOWER(status) = LOWER(?)`;
      params.push(status);
      countParams.push(status);
    }

    if (dateFilter && dateFilter !== 'All') {
      if (dateFilter === 'Today') {
        query += ` AND DATE(created_at) = CURDATE()`;
        countQuery += ` AND DATE(created_at) = CURDATE()`;
      } else if (dateFilter === 'Yesterday') {
        query += ` AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
        countQuery += ` AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
      } else if (dateFilter === 'Last Week') {
        query += ` AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        countQuery += ` AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
      } else if (dateFilter === 'Last Month') {
        query += ` AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
        countQuery += ` AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
      } else if (dateFilter === 'Custom' && startDate && endDate) {
        query += ` AND DATE(created_at) BETWEEN ? AND ?`;
        countQuery += ` AND DATE(created_at) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
        countParams.push(startDate, endDate);
      }
    }

    if (search) {
      query += ` AND (source_url LIKE ? OR form_data LIKE ?)`;
      countQuery += ` AND (source_url LIKE ? OR form_data LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);
    const offset = (parsedPage - 1) * parsedLimit;

    query += ` LIMIT ? OFFSET ?`;
    params.push(parsedLimit, offset);

    const leads: any = await this.db.query(query, params);
    const totalResult: any = await this.db.query(countQuery, countParams);
    const total = totalResult[0]?.total || 0;

    return {
      data: leads,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  async updateStatus(
    id: number,
    status: 'Unread' | 'Read' | 'Trashed',
    actor?: ActorContext,
  ) {
    const query = `UPDATE leads SET status = ? WHERE id = ?`;
    const result: any = await this.db.query(query, [status, id]);

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    this.audit?.record({
      actorId: actor?.id ?? null,
      actorEmail: actor?.email ?? null,
      actorRole: actor?.role ?? null,
      action: 'lead_status_updated',
      entity: 'lead',
      entityId: id,
      metadata: { status },
      ip: actor?.ip ?? null,
    });

    return { success: true, message: `Lead status updated to ${status}` };
  }

  async remove(id: number, actor?: ActorContext) {
    const query = `DELETE FROM leads WHERE id = ?`;
    const result: any = await this.db.query(query, [id]);

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    this.audit?.record({
      actorId: actor?.id ?? null,
      actorEmail: actor?.email ?? null,
      actorRole: actor?.role ?? null,
      action: 'lead_deleted',
      entity: 'lead',
      entityId: id,
      ip: actor?.ip ?? null,
    });

    return { success: true, message: 'Lead permanently deleted' };
  }
}
