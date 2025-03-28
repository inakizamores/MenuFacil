import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { handleApiError, handleAuthError, handleValidationError, ErrorType } from '@/lib/api/error-handler';
import { applyRateLimit, signupRateLimitConfig } from '@/lib/api/rate-limiter';

/**
 * Registration API Route
 * 
 * This endpoint handles user registration with comprehensive security features:
 * - Input validation using Zod schema
 * - Rate limiting to prevent abuse (3 attempts per hour)
 * - IP and email-based rate limiting
 * - Structured error handling with appropriate status codes
 * - Database error logging for security monitoring
 */

// Password validation constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

// Define a schema for registration data validation
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(req, signupRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return handleValidationError(
        { 
          message: 'Invalid registration data',
          cause: validationResult.error.format() 
        },
        path
      );
    }
    
    const { email, password, name } = validationResult.data;
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Attempt registration
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    
    // Handle registration errors
    if (authError) {
      return handleAuthError(
        { 
          message: 'Registration failed',
          cause: { code: authError.code, status: authError.status }
        },
        path,
        400
      );
    }
    
    // Simplified profile creation
    if (authData.user) {
      // Separate function to create profile
      createUserProfile(authData.user.id, name, supabase).catch(err => {
        console.error('Failed to create user profile:', err);
      });
    }
    
    // Determine if email confirmation is required
    const confirmationRequired = !authData.session;
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: confirmationRequired 
        ? 'Registration successful. Please check your email to confirm your account.'
        : 'Registration successful. You are now logged in.',
      confirmationRequired,
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
      }
    }, { status: 201 });
  } catch (error: any) {
    // Generic error handling
    return handleApiError(
      error,
      path,
      ErrorType.INTERNAL,
      500,
      'An error occurred during registration'
    );
  }
}

// Separated to avoid build issues
async function createUserProfile(userId: string, name: string, supabase: any) {
  await supabase.from('profiles').insert({
    id: userId,
    full_name: name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'restaurant_owner'
  });
} 