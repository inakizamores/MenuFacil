import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@/lib/sentry';

/**
 * Auth callback handler for Supabase
 * Processes various authentication callbacks including:
 * - Email verification
 * - Password reset
 * - OAuth login
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';
  const type = searchParams.get('type');
  
  // No code parameter, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  try {
    const supabase = createClient();
    
    // Handle callback code exchange
    // This handles various auth events like sign up confirmation,
    // password reset, sign in with OAuth providers, etc.
    if (type === 'recovery') {
      // Password reset flow
      return NextResponse.redirect(new URL(`/auth/reset-password?code=${code}`, request.url));
    } else if (type === 'signup') {
      // Email verification flow
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        captureException(error);
        return NextResponse.redirect(new URL('/auth/verify-email?error=invalid_code', request.url));
      }
      
      return NextResponse.redirect(new URL('/auth/verify-email?success=true', request.url));
    } else {
      // Other auth flows (e.g., OAuth)
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        captureException(error);
        return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
      }
      
      // Successful auth, redirect to the next URL or dashboard
      return NextResponse.redirect(new URL(next, request.url));
    }
  } catch (error) {
    console.error('Auth callback error:', error);
    captureException(error);
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url));
  }
} 