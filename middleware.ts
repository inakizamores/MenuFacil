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
import { isSystemAdmin } from './types/user-roles'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`Middleware processing: ${pathname}`)
  
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
  const publicRoutes = ['/', '/about', '/contact', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/menus', '/debug']
  const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith('/menus/') || pathname.includes('/api/')
  
  // Check if this is a dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard')
  
  // Check if this is an admin dashboard route
  const isAdminDashboardRoute = pathname.startsWith('/admindashboard')
  
  // If attempting to access admin dashboard, check if user has admin role
  if (isAdminDashboardRoute) {
    if (!session) {
      console.log('Admin access denied: No session found')
      // Not logged in, redirect to login
      const redirectUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Use the isSystemAdmin utility function to check all possible role locations
    const isAdmin = isSystemAdmin(session.user)
    
    // Enhanced logging for admin access
    if (!isAdmin) {
      console.log('Admin access denied details:')
      console.log(`- Email: ${session.user.email}`)
      console.log(`- user_metadata:`, session.user.user_metadata)
      console.log(`- app_metadata:`, session.user.app_metadata)
      
      // Not an admin, redirect to regular dashboard
      const redirectUrl = new URL('/dashboard', request.url)
      console.log(`Redirecting non-admin user to: ${redirectUrl.toString()}`)
      return NextResponse.redirect(redirectUrl)
    }
    
    console.log(`Admin access granted for ${session.user.email}`)
  }
  
  // Handle redirects for legacy dashboard routes
  if (pathname.startsWith('/owner/dashboard') || pathname.startsWith('/staff/dashboard')) {
    // Extract the path after the legacy route prefix
    const subPath = pathname.replace(/^\/(owner|staff)\/dashboard/, '');
    
    // Redirect to the corresponding path under /dashboard
    const newPath = subPath ? `/dashboard${subPath}` : '/dashboard';
    const redirectUrl = new URL(newPath, request.url);
    
    console.log(`Redirecting legacy route ${pathname} to ${newPath}`);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect to login if trying to access dashboard without authentication
  if (isDashboardRoute && !session) {
    const redirectUrl = new URL('/auth/login', request.url)
    console.log(`Redirecting unauthenticated user to login: ${redirectUrl.toString()}`)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect admin users trying to access regular dashboard to admin dashboard
  if (isDashboardRoute && session && isSystemAdmin(session.user)) {
    console.log(`Admin user detected at regular dashboard path: ${pathname}`)
    console.log(`Redirecting admin user ${session.user.email} to admin dashboard`)
    const redirectUrl = new URL('/admindashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect authenticated users trying to access auth pages back to the dashboard
  if (pathname.startsWith('/auth/') && session) {
    // Use the appropriate dashboard based on user role
    const dashboardPath = isSystemAdmin(session.user) ? '/admindashboard' : '/dashboard'
    const redirectUrl = new URL(dashboardPath, request.url)
    console.log(`Redirecting authenticated user from auth page to: ${redirectUrl.toString()}`)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect root path for authenticated users to the appropriate dashboard
  if (pathname === '/' && session) {
    // Determine which dashboard to use based on role
    const dashboardPath = isSystemAdmin(session.user) ? '/admindashboard' : '/dashboard'
    const redirectUrl = new URL(dashboardPath, request.url)
    console.log(`Redirecting authenticated user from root to: ${redirectUrl.toString()}`)
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