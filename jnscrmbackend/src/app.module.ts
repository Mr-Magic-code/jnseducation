import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LeadsModule } from './leads/leads.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PagesModule } from './pages/pages.module.js';
import { EventsModule } from './events/events.module.js';
import { BlogsModule } from './blogs/blogs.module.js'; // 1. BlogsModule imported securely
import { validateEnvironment } from './config/env.validation.js';

const throttleTtl = Number(process.env.THROTTLE_TTL_MS ?? 60000);
const throttleLimit = Number(process.env.THROTTLE_LIMIT ?? 100);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    // Rate limiter: configurable, defaults to 100 requests per minute per IP.
    ThrottlerModule.forRoot([
      {
        ttl: Number.isFinite(throttleTtl) && throttleTtl > 0 ? throttleTtl : 60000,
        limit:
          Number.isFinite(throttleLimit) && throttleLimit > 0
            ? throttleLimit
            : 100,
      },
    ]),
    DatabaseModule,
    LeadsModule,
    AuthModule,
    PagesModule,
    EventsModule,
    BlogsModule, // 2. BlogsModule registered in imports array
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Global guard enforcing rate limits across all endpoints
    },
  ],
})
export class AppModule {}