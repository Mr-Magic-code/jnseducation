const BACKEND_URL =
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://jnscrmbackend.vercel.app'
    : 'http://localhost:4000');

/**
 * Build an absolute URL for server-side (React Server Component) calls to the
 * NestJS backend. Browser code should keep using the `/backend/*` rewrite.
 */
export function backendUrl(path: string): string {
  const base = BACKEND_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
