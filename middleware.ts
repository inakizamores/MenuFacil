/**
 * Next.js Middleware
 * 
 * This middleware handles route redirects, authentication, and navigation security.
 * It specifically resolves issues with the Vercel deployment by:
 * 1. Properly handling marketing routes at the root level
 * 2. Redirecting problematic routes with naming patterns that caused deployment issues
 * 3. Checking authentication for protected routes
 * 4. Using proper TypeScript typing for NextRequest
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  // Create Supabase client for authentication checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
          return response
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
          return response
        },
      },
    }
  )
  
  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Handle public routes (marketing routes, auth routes)
  const publicRoutes = ['/', '/about', '/contact', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/menus']
  const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith('/menus/') || pathname.includes('/api/')
  
  // Check if this is a dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard')
  
  // Redirect to login if trying to access dashboard without authentication
  if (isDashboardRoute && !session) {
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect authenticated users trying to access auth pages back to the dashboard
  if (pathname.startsWith('/auth/') && session) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect problematic routes that use special naming conventions
  // This prevents build errors when Vercel tries to generate client reference manifests
  if (pathname.includes('(marketing)') || pathname.includes('(routes)/(marketing)')) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Continue with the request
  return response
}

// Match all routes except static files, images, and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 