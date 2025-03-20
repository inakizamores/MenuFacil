/**
 * Next.js Middleware
 * 
 * This middleware handles route redirects and navigation security.
 * It specifically resolves issues with the Vercel deployment by:
 * 1. Properly handling marketing routes at the root level
 * 2. Redirecting problematic routes with naming patterns that caused deployment issues
 * 3. Using proper TypeScript typing for NextRequest
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle marketing routes more specifically to avoid conflicts with static generation
  // These need special handling to avoid client-reference-manifest errors
  if (pathname === '/' || pathname === '/about' || pathname === '/contact') {
    // These routes should be handled by the marketing pages
    return NextResponse.next()
  }
  
  // Redirect problematic routes that use special naming conventions
  // This prevents build errors when Vercel tries to generate client reference manifests
  if (pathname.includes('(marketing)') || pathname.includes('(routes)/(marketing)')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Continue with the request
  return NextResponse.next()
}

// Match all routes except static files, images, and API routes
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
} 