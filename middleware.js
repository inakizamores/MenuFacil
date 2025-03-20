import { NextResponse } from 'next/server';

/**
 * This middleware handles route redirects and security
 */
export function middleware(request) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Handle marketing routes more specifically to avoid conflicts with static generation
  if (pathname === '/' || pathname === '/about' || pathname === '/contact') {
    // These routes should be handled by the marketing pages
    return NextResponse.next();
  }

  // Only redirect problematic routes
  if (pathname.includes('(marketing)') || pathname.includes('(routes)/(marketing)')) {
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