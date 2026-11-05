const REQUIRED_VARIABLES = ['JWT_SECRET', 'DATABASE_HOST', 'DATABASE_USER', 'DATABASE_NAME'];

const PRODUCTION_SECRET_MIN_LENGTH = 32;

function isProduction(config: Record<string, unknown>): boolean {
  return String(config.NODE_ENV ?? '').toLowerCase() === 'production';
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];
  const normalized: Record<string, unknown> = { ...config };

  for (const variable of REQUIRED_VARIABLES) {
    const value = config[variable];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${variable} is required.`);
    }
  }

  const jwtSecret = String(config.JWT_SECRET ?? '');
  if (jwtSecret && jwtSecret.length < PRODUCTION_SECRET_MIN_LENGTH) {
    errors.push(
      `JWT_SECRET must be at least ${PRODUCTION_SECRET_MIN_LENGTH} characters long.`,
    );
  }

  if (
    jwtSecret &&
    /^(change-me|secret|jwt-secret|your-secret-key)$/i.test(jwtSecret.trim())
  ) {
    errors.push('JWT_SECRET must not use a placeholder value.');
  }

  const nodeEnv = String(config.NODE_ENV ?? 'development').toLowerCase();
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be one of: development, test, production.');
  }

  for (const variable of ['PORT', 'DATABASE_PORT']) {
    const raw = config[variable];
    if (raw === undefined || raw === '') {
      continue;
    }

    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      errors.push(`${variable} must be a valid port number.`);
    }
  }

  if (isProduction(config)) {
    for (const variable of ['SUPER_ADMIN_SECRET_KEY', 'MANAGER_SECRET_KEY']) {
      const value = String(config[variable] ?? '');
      if (value.length < PRODUCTION_SECRET_MIN_LENGTH) {
        errors.push(
          `${variable} must be at least ${PRODUCTION_SECRET_MIN_LENGTH} characters long in production.`,
        );
      }
    }

    const frontendUrls = String(config.FRONTEND_URLS ?? '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    if (frontendUrls.length === 0) {
      errors.push('FRONTEND_URLS is required in production.');
    }

    for (const url of frontendUrls) {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.push(`FRONTEND_URLS contains an unsupported URL: ${url}`);
        }
      } catch {
        errors.push(`FRONTEND_URLS contains an invalid URL: ${url}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n- ${errors.join('\n- ')}`,
    );
  }

  if (config.DATABASE_PORT === undefined || config.DATABASE_PORT === '') {
    normalized.DATABASE_PORT = '3306';
  }

  return normalized;
}

export function getAllowedOrigins(): string[] {
  const configured = (process.env.FRONTEND_URLS ?? '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production') {
    return Array.from(new Set(configured));
  }

  return Array.from(
    new Set([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      ...configured,
    ]),
  );
}
