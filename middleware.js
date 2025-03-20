import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware handles route redirects and security
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // If the request is for a non-existent (marketing) route, redirect to the dashboard
  if (pathname.includes('(marketing)')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For root path, redirect to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Match all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 