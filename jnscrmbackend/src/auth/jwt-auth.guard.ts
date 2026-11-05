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
      const users: any = await this.databaseService.query(
        'SELECT id, full_name, email, role, status FROM users WHERE id = ? LIMIT 1',
        [payload.sub],
      );

      if (!users.length) {
        response.clearCookie('token', { path: '/' });
        throw new UnauthorizedException('User no longer exists or has been deleted.');
      }

      const user = users[0];

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
