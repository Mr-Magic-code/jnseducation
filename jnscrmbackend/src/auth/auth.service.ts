import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { invalidateUserCache } from './jwt-auth.guard.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { isRegistrationEnabled } from '../config/env.validation.js';

interface LoginAttempt {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPTS_MAX_ENTRIES = 5_000;

const BCRYPT_ROUNDS = 12;

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

// Fast in-process cache. The durable source of truth is the `revoked_tokens`
// table (see db/migrations/001_hardening.sql); the set only avoids a DB read
// for the common case.
const revokedTokens = new Set<string>();

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<string, LoginAttempt>();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  private pruneLoginAttempts(): void {
    if (this.loginAttempts.size <= LOGIN_ATTEMPTS_MAX_ENTRIES) {
      return;
    }

    const now = Date.now();
    for (const [key, attempt] of this.loginAttempts) {
      if (
        attempt.lockedUntil <= now &&
        now - attempt.firstFailureAt > LOGIN_ATTEMPT_WINDOW_MS
      ) {
        this.loginAttempts.delete(key);
      }
    }
  }

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
    this.pruneLoginAttempts();

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

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async isRevoked(token: string): Promise<boolean> {
    if (revokedTokens.has(token)) {
      return true;
    }

    try {
      const rows: unknown = await this.databaseService.query(
        'SELECT 1 FROM revoked_tokens WHERE token_hash = ? AND expires_at > NOW() LIMIT 1',
        [this.hashToken(token)],
      );
      return Array.isArray(rows) && rows.length > 0;
    } catch {
      // If the revocation table is not available yet, fall back to the
      // in-process set (still correct for this instance).
      return false;
    }
  }

  private async revokeToken(token: string): Promise<void> {
    revokedTokens.add(token);
    const timer = setTimeout(
      () => revokedTokens.delete(token),
      REFRESH_TOKEN_TTL_MS,
    );
    timer.unref?.();

    try {
      await this.databaseService.query(
        `INSERT INTO revoked_tokens (token_hash, expires_at)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)`,
        [this.hashToken(token), new Date(Date.now() + REFRESH_TOKEN_TTL_MS)],
      );
    } catch {
      // Table may not exist in older deployments; in-memory revocation remains.
    }
  }

  private signAccessToken(user: {
    id: number;
    email: string;
    role: string;
  }): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, type: 'access' },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
  }

  private signRefreshToken(user: {
    id: number;
    email: string;
    role: string;
  }): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, type: 'refresh' },
      { expiresIn: REFRESH_TOKEN_TTL_SECONDS },
    );
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

      invalidateUserCache(id);
      this.audit?.record({
        action: 'manager_approved',
        entity: 'user',
        entityId: id,
      });
      return { success: true, message: 'Manager approved successfully' };
    }

    const result: any = await this.databaseService.query(
      "DELETE FROM users WHERE id = ? AND role = 'Manager' AND status = 'pending'",
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Pending manager request not found.');
    }

    invalidateUserCache(id);
    this.audit?.record({
      action: 'manager_rejected',
      entity: 'user',
      entityId: id,
    });
    return { success: true, message: 'Request rejected and removed' };
  }

  async getPendingRequests() {
    const users: any = await this.databaseService.query(
      "SELECT id, full_name, email, role, status, created_at FROM users WHERE status = 'pending' AND role = 'Manager' ORDER BY created_at ASC",
    );
    return users;
  }

  async register(dto: SignupDto, role: 'super-admin' | 'manager') {
    if (!isRegistrationEnabled(role)) {
      throw new ForbiddenException(
        'Account registration is disabled. Contact an administrator.',
      );
    }

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

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
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

    this.audit?.record({
      action:
        role === 'super-admin'
          ? 'super_admin_registered'
          : 'manager_registration_requested',
      entity: 'user',
      entityId: email,
      metadata: { email, role: dbRole },
    });

    return {
      success: true,
      message: `${dbRole} registered successfully!`,
    };
  }

  async deleteUser(id: number, currentUserId: number, actor?: { email?: string; role?: string; ip?: string }) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const users: any = await this.databaseService.query(
      'SELECT id, role, email FROM users WHERE id = ? LIMIT 1',
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
    invalidateUserCache(id);
    this.audit?.record({
      actorId: currentUserId,
      actorEmail: actor?.email ?? null,
      actorRole: actor?.role ?? null,
      action: 'user_deleted',
      entity: 'user',
      entityId: id,
      metadata: { deletedEmail: users[0].email },
      ip: actor?.ip ?? null,
    });
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

  async login(dto: LoginDto, ip = 'unknown') {
    const email = dto.email.trim().toLowerCase();
    const attemptKey = `${ip}|${email}`;

    if (this.isLocked(attemptKey)) {
      throw new UnauthorizedException(
        'Too many failed login attempts. Please try again later.',
      );
    }

    const users: any = await this.databaseService.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    const user = users[0] ?? null;

    if (!user) {
      this.recordFailedLogin(attemptKey);
      throw new UnauthorizedException('Invalid email or password!');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.recordFailedLogin(attemptKey);
      throw new UnauthorizedException('Invalid email or password!');
    }

    if (user.status !== 'approved') {
      throw new UnauthorizedException(
        'Your account is pending approval from Super Admin.',
      );
    }

    this.loginAttempts.delete(attemptKey);

    const userContext = { id: user.id, email: user.email, role: user.role };
    const accessToken = this.signAccessToken(userContext);
    const refreshToken = this.signRefreshToken(userContext);

    this.audit?.record({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'login_success',
      entity: 'user',
      entityId: user.id,
      ip,
    });

    return {
      success: true,
      message: 'Login successful!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken || (await this.isRevoked(refreshToken))) {
      throw new UnauthorizedException('Invalid or revoked refresh token.');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type.');
    }

    const users: any = await this.databaseService.query(
      'SELECT id, email, role, status FROM users WHERE id = ? LIMIT 1',
      [payload.sub],
    );

    if (!users.length || users[0].status !== 'approved') {
      await this.revokeToken(refreshToken);
      throw new UnauthorizedException(
        'User no longer exists or is not approved.',
      );
    }

    await this.revokeToken(refreshToken);

    const userContext = {
      id: users[0].id,
      email: users[0].email,
      role: users[0].role,
    };
    const newAccessToken = this.signAccessToken(userContext);
    const newRefreshToken = this.signRefreshToken(userContext);

    return {
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.revokeToken(refreshToken);
    }
    return { success: true, message: 'Logged out successfully' };
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
