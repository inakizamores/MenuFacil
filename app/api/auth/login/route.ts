import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimitHandler } from '@/lib/middleware/rateLimitMiddleware';
import { createApiErrorResponse, handleApiError, parseRequestBody } from '@/lib/api/errorHandler';
import { AUTH_RATE_LIMITER } from '@/lib/rateLimit';
import { z } from 'zod';

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Rate limit configuration for login attempts
const loginRateLimitOptions = {
  limiter: AUTH_RATE_LIMITER,
  skipFailedRequests: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
};

// Login handler function with enhanced security
async function loginHandler(req: NextRequest): Promise<NextResponse> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return createApiErrorResponse(
      405,
      'Method not allowed',
      'method_not_allowed',
      { allowedMethods: ['POST'] }
    );
  }

  try {
    // Parse and validate the request body
    const parsedBody = await parseRequestBody<z.infer<typeof loginSchema>>(req);
    
    // Handle parsing error response from parseRequestBody
    if (parsedBody instanceof NextResponse) {
      return parsedBody;
    }
    
    // Validate against schema
    const result = loginSchema.safeParse(parsedBody);
    if (!result.success) {
      return createApiErrorResponse(
        400,
        'Invalid login data',
        'validation_error',
        result.error.format()
      );
    }
    
    const { email, password } = result.data;
    
    try {
      // Initialize Supabase client
      const supabase = await createClient();
      
      // Attempt sign in with provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Handle authentication error
      if (error) {
        // Generic error to avoid leaking information about existence of accounts
        return createApiErrorResponse(
          401,
          'Invalid login credentials',
          'auth_failed'
        );
      }
      
      // Return user data on successful login
      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.app_metadata?.role || 'user',
        }
      });
    } catch (supabaseError) {
      // Handle Supabase client errors
      console.error('Supabase authentication error:', supabaseError);
      return createApiErrorResponse(
        500,
        'Authentication service unavailable',
        'auth_service_error'
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// Export the handler with rate limiting middleware applied
export const POST = withRateLimitHandler(loginRateLimitOptions, loginHandler); 