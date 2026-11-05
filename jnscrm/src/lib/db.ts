// src/lib/db.ts
import mysql from 'mysql2/promise';

const port = Number(process.env.DB_PORT || 3306);
const sslEnabled = process.env.DB_SSL === 'true';

declare global {
  var __jnsDbPool: mysql.Pool | undefined;
}

const pool =
  globalThis.__jnsDbPool ??
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number.isInteger(port) ? port : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jnseducation-db',
    ssl: sslEnabled
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__jnsDbPool = pool;
}

export default pool;
