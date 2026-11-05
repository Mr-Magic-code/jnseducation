import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { getAllowedOrigins } from './config/env.validation';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
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

  app.use(
    helmet({
      // This service only returns JSON, so a page CSP is not required.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  const allowedOrigins = getAllowedOrigins();

  // CORS with credentials support for HttpOnly cookies.
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true,
    maxAge: 600,
  });

  // Defence-in-depth against CSRF: reject state-changing requests from unknown browser origins.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!STATE_CHANGING_METHODS.has(req.method)) {
      return next();
    }

    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      return next();
    }

    res.status(403).json({
      statusCode: 403,
      message: 'Request origin is not allowed.',
    });
  });

  app.use(cookieParser());

  // Explicit body limits to prevent memory-exhaustion payloads.
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
