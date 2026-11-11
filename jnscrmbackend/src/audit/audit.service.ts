import { Injectable, Logger, Optional } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

export interface AuditEvent {
  actorId?: number | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | number | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
}

/**
 * Best-effort, append-only audit trail for privileged actions.
 * Audit failures never break the primary request.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Optional() private readonly databaseService?: DatabaseService,
  ) {}

  record(event: AuditEvent): void {
    if (!this.databaseService) {
      return;
    }

    const sql = `
      INSERT INTO audit_logs
        (actor_id, actor_email, actor_role, action, entity, entity_id, metadata, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      event.actorId ?? null,
      event.actorEmail ?? null,
      event.actorRole ?? null,
      event.action,
      event.entity ?? null,
      event.entityId === undefined || event.entityId === null
        ? null
        : String(event.entityId),
      event.metadata ? JSON.stringify(event.metadata) : null,
      event.ip ?? null,
    ];

    void this.databaseService.query(sql, params).catch((error: unknown) => {
      this.logger.warn(
        `Failed to write audit event "${event.action}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });
  }
}
