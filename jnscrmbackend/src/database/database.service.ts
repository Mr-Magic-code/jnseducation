import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: mysql.Pool;

  async onModuleInit() {
    const requiredVariables = [
      'DATABASE_HOST',
      'DATABASE_USER',
      'DATABASE_NAME',
    ];
    const missingVariables = requiredVariables.filter(
      (variable) => !process.env[variable],
    );

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing required database environment variables: ${missingVariables.join(', ')}`,
      );
    }

    const port = Number(process.env.DATABASE_PORT ?? 3306);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DATABASE_PORT must be a valid port number.');
    }

    const sslEnabled = process.env.DATABASE_SSL !== 'false';

    this.pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      port,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: sslEnabled
        ? {
            rejectUnauthorized:
              process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
          }
        : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T = unknown>(sql: string, params?: any[]): Promise<T> {
    if (!this.pool) {
      throw new Error('Database pool has not been initialized.');
    }

    const [results] = await this.pool.execute(sql, params);
    return results as T;
  }
}
