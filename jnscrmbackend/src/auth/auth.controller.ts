import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import { ManagerRequestDto } from './dto/manager-request.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { Roles } from './roles.decorator.js';

type AuthenticatedRequest = Request & {
  user: { id: number; email: string; role: string; status: string };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'strict' | 'none',
      path: '/',
    };

    res.cookie('token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: result.message,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const result = await this.authService.refresh(refreshToken);
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'strict' | 'none',
      path: '/',
    };

    res.cookie('token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true, message: 'Token refreshed successfully' };
  }

  @Post('register-super-admin')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async registerSuperAdmin(@Body() dto: SignupDto) {
    return this.authService.register(dto, 'super-admin');
  }

  @Post('register-manager')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async registerManager(@Body() dto: SignupDto) {
    return this.authService.register(dto, 'manager');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const refreshToken = req.cookies?.refresh_token;

    await this.authService.logout(refreshToken);

    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'strict' | 'none',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'strict' | 'none',
      path: '/',
    });

    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user.id);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin')
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('pending-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin')
  @HttpCode(HttpStatus.OK)
  async getPendingRequests() {
    return this.authService.getPendingRequests();
  }

  @Patch('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin')
  @HttpCode(HttpStatus.OK)
  async handleManagerRequest(@Body() body: ManagerRequestDto) {
    return this.authService.handleManagerRequest(body.id, body.action);
  }

  @Delete('delete-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Query('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.authService.deleteUser(Number(id), req.user.id);
  }
}
