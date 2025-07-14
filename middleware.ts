import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/favicon.ico', '/_next', '/public', '/api/v1/track'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session token (NextAuth uses 'next-auth.session-token' in cookies)
  const token = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
  if (!token) {
    // Not authenticated, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Optionally, configure matcher to only run on certain paths
export const config = {
  matcher: [
    /*
      Match all routes except:
      - /login
      - /register
      - /api/auth
      - /favicon.ico
      - /_next
      - /public
    */
    '/((?!login|register|api/auth|favicon.ico|_next|public).*)',
  ],
};