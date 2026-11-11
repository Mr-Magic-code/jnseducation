import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import {
  json,
  urlencoded,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { getAllowedOrigins } from './config/env.validation';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_EXEMPT_PATHS = new Set([
  '/leads',
  '/auth/login',
  '/auth/register-super-admin',
  '/auth/register-manager',
]);

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseTrustProxy(value: string | undefined): number | boolean {
  if (value === undefined || value === '') {
    return 1;
  }
  if (value === 'false') {
    return false;
  }
  if (value === 'true') {
    return true;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 1;
}

function getCsrfSecret(): string {
  return process.env.CSRF_SECRET ?? '';
}

function signCsrfNonce(nonce: string): string {
  return createHmac('sha256', getCsrfSecret())
    .update(nonce)
    .digest('base64url');
}

function generateCsrfToken(): string {
  const nonce = randomBytes(32).toString('base64url');
  return `${nonce}.${signCsrfNonce(nonce)}`;
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}

function isValidCsrfToken(token: string): boolean {
  const separatorIndex = token.indexOf('.');
  if (separatorIndex <= 0) {
    return false;
  }
  const nonce = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!nonce || !signature) {
    return false;
  }
  return safeEqual(signature, signCsrfNonce(nonce));
}

function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[],
): boolean {
  if (!origin) {
    return true;
  }
  return allowedOrigins.includes(origin);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');
  expressApp.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

  const isProduction = process.env.NODE_ENV === 'production';

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'none'"],
          baseUri: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
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
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ csrfToken: token });
    }

    if (STATE_CHANGING_METHODS.has(req.method)) {
      // Modern browsers advertise cross-site requests; reject them outright.
      if (req.headers['sec-fetch-site'] === 'cross-site') {
        return res.status(403).json({
          statusCode: 403,
          message: 'Cross-site request blocked.',
        });
      }

      if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Request origin is not allowed.',
        });
      }

      const path = req.route?.path ?? req.path;
      if (!CSRF_EXEMPT_PATHS.has(path)) {
        const cookieToken = req.cookies?.csrf_token;
        const headerToken = req.headers['x-csrf-token'] as string | undefined;

        if (
          !cookieToken ||
          !headerToken ||
          !safeEqual(cookieToken, headerToken) ||
          !isValidCsrfToken(headerToken)
        ) {
          return res.status(403).json({
            statusCode: 403,
            message: 'CSRF token validation failed.',
          });
        }
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

  app.useGlobalFilters(new AllExceptionsFilter());

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
