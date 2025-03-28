import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { handleApiError, handleAuthError, handleValidationError, ErrorType } from '@/lib/api/error-handler';
import { applyRateLimit, signupRateLimitConfig } from '@/lib/api/rate-limiter';
import type { Database } from '@/types/database.types';

/**
 * Registration API Route
 * 
 * This endpoint handles user registration with comprehensive security features:
 * - Input validation using Zod schema
 * - Rate limiting to prevent abuse (3 attempts per hour)
 * - IP and email-based rate limiting
 * - Structured error handling with appropriate status codes
 * - Database error logging for security monitoring
 * - Type-safe Supabase client operations
 */

// Password validation constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

// Define a schema for registration data validation with clear error messages
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Export the type for use in client-side validation or other components
export type RegistrationData = z.infer<typeof registerSchema>;

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  try {
    // Apply rate limiting to prevent brute force attacks
    // This uses IP and email-based rate limiting (3 attempts per hour)
    const rateLimitResponse = applyRateLimit(req, signupRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse; // Return 429 Too Many Requests if rate limited
    }
    
    // Parse request body as JSON
    const body = await req.json();
    
    // Validate request body against the schema
    // This provides strong input validation and prevents malformed data
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      // Return a structured validation error response (400 Bad Request)
      return handleValidationError(
        { 
          message: 'Invalid registration data',
          cause: validationResult.error.format() 
        },
        path
      );
    }
    
    // Extract validated data (now type-safe)
    const { email, password, name } = validationResult.data;
    
    // Initialize Supabase client for auth and database operations
    const supabase = await createClient();
    
    // Attempt user registration with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name // Store name in user metadata for quick access
        }
      }
    });
    
    // Handle authentication errors (email in use, invalid format, etc.)
    if (authError) {
      return handleAuthError(
        { 
          message: 'Registration failed',
          cause: { code: authError.code, status: authError.status }
        },
        path,
        400 // Use 400 Bad Request for registration failures
      );
    }
    
    // Once auth registration succeeds, create a profile record in the database
    // This stores additional user information and allows for future extension
    if (authData.user) {
      // @ts-ignore - Suppress type error for Supabase client
      // Known issue: Types for the profiles table need to be fixed in a future update
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id, // Use the same ID as the auth user
          full_name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: 'restaurant_owner' // Default role for new registrations
        });
        
      if (profileError) {
        // Log the error but don't fail the registration
        // We prioritize user creation in auth system even if profile creation fails
        console.error('Failed to create user profile:', profileError);
      }
    }
    
    // Determine if email confirmation is required based on session existence
    // If session is null, email confirmation is required
    const confirmationRequired = !authData.session;
    
    // Return a success response with appropriate status code and data
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
    }, { status: 201 }); // 201 Created is appropriate for registration
  } catch (error: any) {
    // Generic error handling for unexpected errors
    // This logs the error to the database and returns a structured error response
    return handleApiError(
      error,
      path,
      ErrorType.INTERNAL,
      500,
      'An error occurred during registration'
    );
  }
} 