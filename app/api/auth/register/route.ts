import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimitHandler } from '@/lib/middleware/rateLimitMiddleware';
import { createApiErrorResponse, handleApiError, parseRequestBody } from '@/lib/api/errorHandler';
import { AUTH_RATE_LIMITER } from '@/lib/rateLimit';
import { z } from 'zod';

// Schema for registration validation
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters').max(100, 'Restaurant name is too long'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
});

// Rate limit configuration for registration attempts
const registerRateLimitOptions = {
  limiter: AUTH_RATE_LIMITER,
  skipFailedRequests: false,
  skipSuccessfulRequests: true, // Don't count successful registrations against the limit
};

// Registration handler function with enhanced security
async function registerHandler(req: NextRequest): Promise<NextResponse> {
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
    const parsedBody = await parseRequestBody<z.infer<typeof registerSchema>>(req);
    
    // Handle parsing error response from parseRequestBody
    if (parsedBody instanceof NextResponse) {
      return parsedBody;
    }
    
    // Validate against schema
    const result = registerSchema.safeParse(parsedBody);
    if (!result.success) {
      return createApiErrorResponse(
        400,
        'Invalid registration data',
        'validation_error',
        result.error.format()
      );
    }
    
    const { email, password, name, restaurantName } = result.data;
    
    try {
      // Initialize Supabase client
      const supabase = await createClient();
      
      // Register the new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            restaurant_name: restaurantName,
            role: 'owner' // Default role for new registrations
          }
        }
      });
      
      // Handle registration error
      if (error) {
        return createApiErrorResponse(
          400,
          'Registration failed',
          'registration_error',
          { message: error.message }
        );
      }
      
      // User should never be null on successful signup, but check just in case
      if (!data?.user) {
        return createApiErrorResponse(
          500,
          'Registration failed - user not created',
          'registration_error'
        );
      }
      
      // Create initial restaurant record
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          { 
            name: restaurantName,
            owner_id: data.user.id,
            created_at: new Date().toISOString(),
            is_active: true
          }
        ]);
      
      if (restaurantError) {
        console.error('Error creating restaurant:', restaurantError);
        // Continue anyway, we can link the restaurant later
      }
      
      // Return success response
      return NextResponse.json({
        message: 'Registration successful. Please check your email to confirm your account.',
        user: {
          id: data.user.id,
          email: data.user.email
        }
      }, { status: 201 });
      
    } catch (supabaseError) {
      // Handle Supabase client errors
      console.error('Supabase registration error:', supabaseError);
      return createApiErrorResponse(
        500,
        'Registration service unavailable',
        'registration_service_error'
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// Export the handler with rate limiting middleware applied
export const POST = withRateLimitHandler(registerRateLimitOptions, registerHandler); 