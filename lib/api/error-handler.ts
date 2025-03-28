import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.types';

// Define standard error types
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL = 'internal'
}

// Standard error response interface
export interface ErrorResponse {
  error: {
    type: ErrorType;
    code: string;
    message: string;
    details?: any;
    path?: string;
    requestId?: string;
  };
}

// Helper to generate a unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Helper to log errors to the database
export async function logErrorToDatabase(
  requestId: string, 
  errorType: ErrorType, 
  message: string, 
  path: string,
  details?: any,
  userId?: string
) {
  try {
    // Create a Supabase client
    const supabasePromise = createClient();
    const supabase = await supabasePromise;
    
    // Insert error log
    await supabase
      .from('error_logs')
      .insert({
        request_id: requestId,
        error_type: errorType,
        message,
        path,
        details: details ? JSON.stringify(details) : null,
        user_id: userId
      });
  } catch (logError) {
    // Fallback to console if database logging fails
    console.error('Failed to log error to database:', logError);
    console.error('Original error:', {
      requestId,
      errorType,
      message,
      path,
      details
    });
  }
}

// Main error handler
export function handleApiError(
  error: any, 
  path: string, 
  errorType: ErrorType = ErrorType.INTERNAL,
  statusCode: number = 500,
  customMessage?: string
) {
  // Generate a request ID for tracking
  const requestId = generateRequestId();
  
  // Normalize error message
  const errorMessage = customMessage || error?.message || 'An unexpected error occurred';
  
  // Determine error code from status or default
  const errorCode = `error_${statusCode}_${errorType}`;
  
  // Prepare error details for logging (but not necessarily for response)
  const errorDetails: Record<string, any> = {};
  if (error?.stack) errorDetails.stack = error.stack;
  if (error?.cause) errorDetails.cause = error.cause;
  
  // Log error (use async but don't await to avoid blocking)
  logErrorToDatabase(requestId, errorType, errorMessage, path, errorDetails);
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${requestId}] API Error:`, {
      path,
      type: errorType,
      message: errorMessage,
      details: errorDetails
    });
  }
  
  // Create standardized error response
  const errorResponse: ErrorResponse = {
    error: {
      type: errorType,
      code: errorCode,
      message: errorMessage,
      path,
      requestId
    }
  };
  
  // Only include details in development
  if (process.env.NODE_ENV !== 'production' && error?.cause) {
    errorResponse.error.details = error.cause;
  }
  
  // Return NextResponse with appropriate status code
  return NextResponse.json(errorResponse, { status: statusCode });
}

// Specific error handlers for common cases
export function handleAuthError(error: any, path: string, statusCode = 401) {
  return handleApiError(error, path, ErrorType.AUTHENTICATION, statusCode);
}

export function handleNotFoundError(error: any, path: string) {
  return handleApiError(error, path, ErrorType.NOT_FOUND, 404);
}

export function handleValidationError(error: any, path: string) {
  return handleApiError(error, path, ErrorType.VALIDATION, 400);
}

export function handleDatabaseError(error: any, path: string) {
  return handleApiError(error, path, ErrorType.DATABASE, 500);
}

export function handleRateLimitError(path: string) {
  return handleApiError(
    new Error('Rate limit exceeded. Please try again later.'),
    path,
    ErrorType.RATE_LIMIT,
    429
  );
}

// Helper to handle Supabase errors
export function handleSupabaseError(error: any, path: string) {
  // Determine error type and status code based on Supabase error
  if (error?.code === 'PGRST301' || error?.code === '42501') {
    // Permission error
    return handleApiError(error, path, ErrorType.AUTHORIZATION, 403);
  } else if (error?.code === 'PGRST204') {
    // Not found
    return handleApiError(error, path, ErrorType.NOT_FOUND, 404);
  } else if (error?.code?.startsWith('22') || error?.code?.startsWith('23')) {
    // Data error (e.g., 22P02: invalid input syntax)
    return handleApiError(error, path, ErrorType.VALIDATION, 400);
  } else {
    // Default database error
    return handleApiError(error, path, ErrorType.DATABASE, 500);
  }
} 