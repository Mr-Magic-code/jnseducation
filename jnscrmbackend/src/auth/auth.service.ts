import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';

interface LoginAttempt {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
}

const DUMMY_PASSWORD_HASH =
  '$2b$10$FHBizCgntbHPGzW4iuqqw.dC6adLv0ve8bdaPQ/1gX51WCGNN3NCK';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<string, LoginAttempt>();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private isLocked(key: string): boolean {
    const attempt = this.loginAttempts.get(key);
    if (!attempt) {
      return false;
    }

    if (attempt.lockedUntil > Date.now()) {
      return true;
    }

    if (Date.now() - attempt.firstFailureAt > LOGIN_ATTEMPT_WINDOW_MS) {
      this.loginAttempts.delete(key);
    }

    return false;
  }

  private recordFailedLogin(key: string): void {
    const now = Date.now();
    const attempt = this.loginAttempts.get(key);

    if (!attempt || now - attempt.firstFailureAt > LOGIN_ATTEMPT_WINDOW_MS) {
      this.loginAttempts.set(key, {
        failures: 1,
        firstFailureAt: now,
        lockedUntil: 0,
      });
      return;
    }

    attempt.failures += 1;
    if (attempt.failures >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = now + LOGIN_LOCK_MS;
    }
  }

  private secretsMatch(provided: string, expected: string): boolean {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }

  async handleManagerRequest(id: number, action: 'approve' | 'reject') {
    if (action === 'approve') {
      const result: any = await this.databaseService.query(
        "UPDATE users SET status = 'approved' WHERE id = ? AND role = 'Manager' AND status = 'pending'",
        [id],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException('Pending manager request not found.');
      }

      return { success: true, message: 'Manager approved successfully' };
    }

    const result: any = await this.databaseService.query(
      "DELETE FROM users WHERE id = ? AND role = 'Manager' AND status = 'pending'",
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Pending manager request not found.');
    }

    return { success: true, message: 'Request rejected and removed' };
  }

  async getPendingRequests() {
    const users: any = await this.databaseService.query(
      "SELECT id, full_name, email, role, status, created_at FROM users WHERE status = 'pending' AND role = 'Manager' ORDER BY created_at ASC",
    );
    return users;
  }

  async register(dto: SignupDto, role: 'super-admin' | 'manager') {
    const email = dto.email.trim().toLowerCase();
    const secretKey = String(dto.secretKey ?? '');
    const expectedSecret =
      role === 'super-admin'
        ? process.env.SUPER_ADMIN_SECRET_KEY ?? ''
        : process.env.MANAGER_SECRET_KEY ?? '';

    if (!expectedSecret || !this.secretsMatch(secretKey, expectedSecret)) {
      throw new UnauthorizedException('Invalid secret key!');
    }

    if (role === 'super-admin') {
      const allowedDomain = process.env.SUPER_ADMIN_EMAIL_DOMAIN;
      if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
        throw new UnauthorizedException(
          'Super Admin registration is restricted to your company email domain.',
        );
      }
    }

    const existingUsers: any = await this.databaseService.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    if (existingUsers.length > 0) {
      throw new BadRequestException('User with this email already exists!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const accountStatus = role === 'super-admin' ? 'approved' : 'pending';
    const dbRole = role === 'super-admin' ? 'Super-Admin' : 'Manager';

    const columns = ['full_name', 'email', 'password', 'role', 'status'];
    const values: unknown[] = [
      dto.full_name,
      email,
      hashedPassword,
      dbRole,
      accountStatus,
    ];

    if (dto.branch_office && (await this.hasColumn('users', 'branch_office'))) {
      columns.push('branch_office');
      values.push(dto.branch_office);
    }

    await this.databaseService.query(
      `INSERT INTO users (${columns.join(', ')}) VALUES (${columns
        .map(() => '?')
        .join(', ')})`,
      values,
    );

    return {
      success: true,
      message: `${dbRole} registered successfully!`,
    };
  }

  async deleteUser(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const users: any = await this.databaseService.query(
      'SELECT id, role FROM users WHERE id = ? LIMIT 1',
      [id],
    );

    if (!users.length) {
      throw new NotFoundException('User not found.');
    }

    if (users[0].role === 'Super-Admin') {
      const countRows: any = await this.databaseService.query(
        "SELECT COUNT(*) AS total FROM users WHERE role = 'Super-Admin'",
      );
      if (Number(countRows[0]?.total) <= 1) {
        throw new BadRequestException(
          'The last Super Admin account cannot be deleted.',
        );
      }
    }

    await this.databaseService.query('DELETE FROM users WHERE id = ?', [id]);
    return { success: true, message: 'User deleted successfully' };
  }

  async getAllUsers() {
    const users = await this.databaseService.query(
      "SELECT id, full_name, email, role, status, created_at FROM users WHERE status = 'approved' ORDER BY created_at DESC",
    );
    return { users };
  }

  async getMe(id: number) {
    const users: any = await this.databaseService.query(
      'SELECT id, full_name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [id],
    );

    if (!users.length) {
      throw new NotFoundException('User not found.');
    }

    return { user: users[0] };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    if (this.isLocked(email)) {
      throw new UnauthorizedException(
        'Too many failed login attempts. Please try again later.',
      );
    }

    const users: any = await this.databaseService.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    const user = users[0] ?? null;

    const isPasswordValid = user
      ? await bcrypt.compare(dto.password, user.password)
      : await bcrypt.compare(dto.password, DUMMY_PASSWORD_HASH);

    if (!user || !isPasswordValid) {
      this.recordFailedLogin(email);
      throw new UnauthorizedException('Invalid email or password!');
    }

    if (user.status !== 'approved') {
      throw new UnauthorizedException(
        'Your account is pending approval from Super Admin.',
      );
    }

    this.loginAttempts.delete(email);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login successful!',
      accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  private async hasColumn(table: string, column: string): Promise<boolean> {
    const rows: any = await this.databaseService.query(
      `SELECT 1
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?
       LIMIT 1`,
      [table, column],
    );

    return Array.isArray(rows) && rows.length > 0;
  }
}
