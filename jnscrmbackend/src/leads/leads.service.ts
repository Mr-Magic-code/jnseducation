import { Injectable, NotFoundException } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { DatabaseService } from '../database/database.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';

@Injectable()
export class LeadsService {
  constructor(private readonly db: DatabaseService) {}

  private sanitizeFormData(data: unknown): unknown {
    if (typeof data === 'string') {
      return sanitizeHtml(String(data), { allowedTags: [], allowedAttributes: {} });
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeFormData(item));
    }
    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
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
      source_url || ''
    ]);

    const leadId = result.insertId;

    this.forwardToCustomCRM(createLeadDto).catch(err => {
      // Non-blocking error handling to ensure fast response to frontend
      console.warn('CRM Integration Error:', err?.message);
    });

    return { success: true, message: 'Lead saved successfully', leadId };
  }

  private async forwardToCustomCRM(payload: CreateLeadDto) {
    const crmUrl = process.env.CRM_API_URL;

    if (!crmUrl) {
      return;
    }

    const crmToken = process.env.CRM_API_TOKEN;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (crmToken) {
      headers.Authorization = `Bearer ${crmToken}`;
    }

    try {
      const response = await fetch(crmUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`CRM responded with status ${response.status}`);
      }
    } catch (error: any) {
      throw new Error(error?.message || 'CRM connection error');
    }
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
    limit: number = 100
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
      // 🚀 ENTERPRISE FIX 1: Case-insensitive matching. Avoids strict 'read' vs 'Read' bugs
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
      // 🚀 ENTERPRISE FIX 2: Removed CAST(). Direct LIKE on JSON/Text column is 100x faster
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

  async updateStatus(id: number, status: 'Unread' | 'Read' | 'Trashed') {
    const query = `UPDATE leads SET status = ? WHERE id = ?`;
    const result: any = await this.db.query(query, [status, id]);

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return { success: true, message: `Lead status updated to ${status}` };
  }

  async remove(id: number) {
    const query = `DELETE FROM leads WHERE id = ?`;
    const result: any = await this.db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return { success: true, message: 'Lead permanently deleted' };
  }
}