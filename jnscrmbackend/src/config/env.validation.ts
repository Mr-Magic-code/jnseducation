const REQUIRED_VARIABLES = [
  'JWT_SECRET',
  'CSRF_SECRET',
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_NAME',
];

const PRODUCTION_SECRET_MIN_LENGTH = 32;

// Reject obvious placeholders and sample values. This is intentionally broader
// than the previous exact-match check so values such as
// "change-me-to-a-long-random-secret-at-least-32-chars" can no longer pass.
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /change[\s_-]?me/i,
  /replace[\s_-]?with/i,
  /placeholder/i,
  /your[\s_-]?(jwt|secret|key|token)/i,
  /example[\s_-]?(secret|key|token)/i,
  /sample[\s_-]?(secret|key|token)/i,
  /^secret$/i,
  /^jwt-secret$/i,
  /^your-secret-key$/i,
  /^changeme$/i,
];

function isProduction(config: Record<string, unknown>): boolean {
  return String(config.NODE_ENV ?? '').toLowerCase() === 'production';
}

function looksLikePlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
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
  if (jwtSecret && looksLikePlaceholder(jwtSecret)) {
    errors.push('JWT_SECRET must not use a placeholder or sample value.');
  }

  const csrfSecret = String(config.CSRF_SECRET ?? '');
  if (csrfSecret && looksLikePlaceholder(csrfSecret)) {
    errors.push('CSRF_SECRET must not use a placeholder or sample value.');
  }
  if (
    isProduction(config) &&
    csrfSecret &&
    csrfSecret.length < PRODUCTION_SECRET_MIN_LENGTH
  ) {
    errors.push(
      `CSRF_SECRET must be at least ${PRODUCTION_SECRET_MIN_LENGTH} characters long in production.`,
    );
  }

  if (
    isProduction(config) &&
    jwtSecret &&
    csrfSecret &&
    jwtSecret === csrfSecret
  ) {
    errors.push('JWT_SECRET and CSRF_SECRET must be different values.');
  }

  // Registration secrets must be present in production when registration is
  // enabled; they must never be placeholder values.
  const registrationEnabled = (variable: string, defaultValue: boolean) => {
    const raw = config[variable];
    if (raw === undefined || raw === '') {
      return defaultValue;
    }
    return String(raw).toLowerCase() === 'true';
  };

  if (isProduction(config)) {
    if (registrationEnabled('ALLOW_SUPER_ADMIN_REGISTRATION', false)) {
      const secret = String(config.SUPER_ADMIN_SECRET_KEY ?? '');
      if (!secret || looksLikePlaceholder(secret)) {
        errors.push(
          'SUPER_ADMIN_SECRET_KEY must be set to a strong value when ALLOW_SUPER_ADMIN_REGISTRATION=true.',
        );
      }
    }
    if (registrationEnabled('ALLOW_MANAGER_REGISTRATION', false)) {
      const secret = String(config.MANAGER_SECRET_KEY ?? '');
      if (!secret || looksLikePlaceholder(secret)) {
        errors.push(
          'MANAGER_SECRET_KEY must be set to a strong value when ALLOW_MANAGER_REGISTRATION=true.',
        );
      }
    }
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
        if (parsed.protocol === 'http:') {
          errors.push(`FRONTEND_URLS must use https in production: ${url}`);
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

export function isRegistrationEnabled(
  role: 'super-admin' | 'manager',
): boolean {
  const variable =
    role === 'super-admin'
      ? 'ALLOW_SUPER_ADMIN_REGISTRATION'
      : 'ALLOW_MANAGER_REGISTRATION';
  const configured = process.env[variable];

  if (configured === undefined || configured === '') {
    // Secure-by-default: registration is disabled in production unless the
    // operator explicitly opts in.
    return process.env.NODE_ENV !== 'production';
  }

  return configured.toLowerCase() === 'true';
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
