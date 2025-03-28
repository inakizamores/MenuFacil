import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { applyRateLimit, authRateLimitConfig } from '@/lib/api/rate-limiter';
import { 
  handleApiError, 
  handleAuthError, 
  handleValidationError,
  ErrorType 
} from '@/lib/api/error-handler';
import { z } from 'zod';

// Validate login request schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(req, authRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return handleValidationError(
        { 
          message: 'Invalid login credentials format',
          cause: validationResult.error.format() 
        },
        path
      );
    }
    
    // Get validated data
    const { email, password } = validationResult.data;
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Handle authentication errors
    if (error) {
      return handleAuthError(
        { 
          message: 'Invalid login credentials',
          cause: { code: error.code, status: error.status }
        },
        path
      );
    }
    
    // Set any additional cookies if needed
    const cookieStore = cookies();
    cookieStore.set('session_active', 'true', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    // Return success response with user data
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user',
      },
      session: {
        expires_at: data.session?.expires_at
      }
    });
  } catch (error: any) {
    // Generic error handling
    return handleApiError(
      error,
      path,
      ErrorType.INTERNAL,
      500,
      'An error occurred during login'
    );
  }
} 