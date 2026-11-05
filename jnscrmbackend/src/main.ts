import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, type NextFunction, type Request, type Response } from 'express';
import { randomBytes } from 'crypto';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { getAllowedOrigins } from './config/env.validation';

  const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  const CSRF_EXEMPT_PATHS = new Set(['/leads']);

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function generateCsrfToken(): string {
  return Buffer.from(randomBytes(32)).toString('base64url');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');

  const trustProxy = process.env.TRUST_PROXY;
  expressApp.set(
    'trust proxy',
    trustProxy === 'false'
      ? false
      : trustProxy === 'true'
        ? true
        : parsePositiveInt(trustProxy, 1),
  );

  const isProduction = process.env.NODE_ENV === 'production';

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      referrerPolicy: { policy: 'no-referrer' },
      strictTransportSecurity: isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error('Request origin is not allowed.'));
      }
      return callback(null, origin);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Accept', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 600,
  });

  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && req.path === '/csrf-token') {
      const token = generateCsrfToken();
      res.cookie('csrf_token', token, {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ csrfToken: token });
    }

    if (STATE_CHANGING_METHODS.has(req.method)) {
      const path = req.route?.path ?? req.path;
      if (CSRF_EXEMPT_PATHS.has(path)) {
        return next();
      }

      const cookieToken = req.cookies?.csrf_token;
      const headerToken = req.headers['x-csrf-token'] as string | undefined;

      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({
          statusCode: 403,
          message: 'CSRF token validation failed.',
        });
      }
    }

    return next();
  });

  const bodyLimit = process.env.BODY_LIMIT ?? '1mb';
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false, value: false },
    }),
  );

  app.enableShutdownHooks();

  const port = parsePositiveInt(process.env.PORT, 4000);
  const server = await app.listen(port);

  server.requestTimeout = parsePositiveInt(
    process.env.REQUEST_TIMEOUT_MS,
    30_000,
  );
  server.headersTimeout = parsePositiveInt(
    process.env.HEADERS_TIMEOUT_MS,
    35_000,
  );
  server.keepAliveTimeout = parsePositiveInt(
    process.env.KEEP_ALIVE_TIMEOUT_MS,
    5_000,
  );
}
void bootstrap();
