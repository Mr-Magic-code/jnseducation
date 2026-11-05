import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = ['/protection/login', '/protection/admin', '/protection/flash-admin'];

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return true;
    }
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return typeof decoded.exp === 'number' && decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isDashboard = pathname.startsWith('/protection/dashboard');

  // Protect the dashboard: a session cookie is required. The API still verifies
  // the JWT signature, user existence and approval status on every request.
  if (isDashboard) {
    if (!token || isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/protection/login', request.url));
    }
  }

  // Authenticated users should not see login/registration pages again.
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/protection/dashboard', request.url));
  }

  // Unauthenticated users hitting the admin/flash-admin entry pages go to login.
  if (!token && (pathname === '/protection/admin' || pathname === '/protection/flash-admin')) {
    return NextResponse.redirect(new URL('/protection/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|backend|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
