import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client for auth using the new ssr package
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.pathname;

  // Check if it's a public route or a next.js asset
  const isPublicRoute = publicRoutes.some(route => url === route || url.startsWith(route + '/'));
  const isNextAsset = url.includes('/_next/') || url.includes('/favicon.ico');
  const isAPIRoute = url.includes('/api/');

  // If the route requires auth and there's no session, redirect to login
  if (!isPublicRoute && !isNextAsset && !isAPIRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If on an auth page and already logged in, redirect to dashboard
  if (url.includes('/auth/') && !url.includes('/auth/logout') && session) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/restaurants/:path*',
    '/admin/:path*',
    // Auth routes for redirection logic
    '/auth/:path*',
    // Don't match api routes or Next.js static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 