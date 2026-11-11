import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = [
  '/protection/login',
  '/protection/admin',
  '/protection/flash-admin',
];

const isProduction = process.env.NODE_ENV === 'production';

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return true;
    }
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.exp === 'number' && decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function buildCsp(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
  ].join('; ');
}

function withCsp(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', buildCsp());
  return response;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isDashboard = pathname.startsWith('/protection/dashboard');

  // Protect the dashboard: a session cookie is required. The API verifies the
  // JWT signature, user existence and approval status on every request.
  if (isDashboard && (!token || isTokenExpired(token))) {
    return withCsp(
      NextResponse.redirect(new URL('/protection/login', request.url)),
    );
  }

  // Authenticated users should not see login/registration pages again.
  if (token && isAuthPage) {
    return withCsp(
      NextResponse.redirect(new URL('/protection/dashboard', request.url)),
    );
  }

  // Unauthenticated users hitting the admin/flash-admin entry pages go to login.
  if (
    !token &&
    (pathname === '/protection/admin' || pathname === '/protection/flash-admin')
  ) {
    return withCsp(
      NextResponse.redirect(new URL('/protection/login', request.url)),
    );
  }

  return withCsp(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|backend|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
