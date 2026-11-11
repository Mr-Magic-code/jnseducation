import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
}

interface CachedUser {
  user: AuthUser;
  expiresAt: number;
}

// The guard runs on every authenticated request. A very short-lived cache keeps
// deleted/unapproved users locked out quickly while avoiding a DB round-trip on
// every single dashboard API call.
const USER_CACHE_TTL_MS = 10_000;
const USER_CACHE_MAX_ENTRIES = 500;
const userCache = new Map<number, CachedUser>();

export function invalidateUserCache(userId?: number): void {
  if (typeof userId === 'number') {
    userCache.delete(userId);
    return;
  }
  userCache.clear();
}

function pruneUserCache(): void {
  if (userCache.size <= USER_CACHE_MAX_ENTRIES) {
    return;
  }
  const now = Date.now();
  for (const [id, entry] of userCache) {
    if (entry.expiresAt <= now) {
      userCache.delete(id);
    }
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = request.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('Authentication token missing.');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const cached = userCache.get(payload.sub);
      let user: AuthUser | undefined;

      if (cached && cached.expiresAt > Date.now()) {
        user = cached.user;
      } else {
        const users: AuthUser[] = await this.databaseService.query(
          'SELECT id, full_name, email, role, status FROM users WHERE id = ? LIMIT 1',
          [payload.sub],
        );

        if (!users.length) {
          response.clearCookie('token', { path: '/' });
          throw new UnauthorizedException(
            'User no longer exists or has been deleted.',
          );
        }

        user = users[0];
        pruneUserCache();
        userCache.set(payload.sub, {
          user,
          expiresAt: Date.now() + USER_CACHE_TTL_MS,
        });
      }

      if (user.status !== 'approved') {
        response.clearCookie('token', { path: '/' });
        throw new UnauthorizedException('Your account is not approved.');
      }

      request.user = user;
      return true;
    } catch (error) {
      response.clearCookie('token', { path: '/' });

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired session.');
    }
  }
}
