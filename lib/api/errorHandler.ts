/**
 * API Error Handling Utilities
 * 
 * Provides standardized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';

// Define the DetailedError class if it doesn't exist yet
export class DetailedError extends Error {
  httpCode: number;
  code: string;
  details?: any;

  constructor(message: string, httpCode = 500, code = 'internal_error', details?: any) {
    super(message);
    this.name = 'DetailedError';
    this.httpCode = httpCode;
    this.code = code;
    this.details = details;
  }
}

// Standard error response structure
export interface ApiErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  status: number;
  requestId?: string;
}

/**
 * Create a standardized error response for API routes
 * 
 * @param status HTTP status code
 * @param message Error message
 * @param code Error code (optional)
 * @param details Additional error details (optional)
 * @returns NextResponse with formatted error
 */
export function createApiErrorResponse(
  status: number,
  message: string,
  code?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  // Generate a unique request ID for error tracking
  const requestId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Construct the error object
  const errorResponse: ApiErrorResponse = {
    error: getErrorTitle(status),
    message,
    status,
    requestId,
  };
  
  // Add optional fields if provided
  if (code) errorResponse.code = code;
  if (details) errorResponse.details = details;
  
  // Log error for server debugging (excluding 400-level client errors)
  if (status >= 500) {
    console.error(`API Error [${requestId}]:`, { 
      status, 
      message, 
      code, 
      details 
    });
  }
  
  return NextResponse.json(errorResponse, { status });
}

/**
 * Handle API errors in a standardized way
 * 
 * @param error The caught error
 * @param req The Next.js request object
 * @returns NextResponse with appropriate error format
 */
export function handleApiError(error: unknown, req?: NextRequest): NextResponse {
  // Handle DetailedError from our error system
  if (error instanceof DetailedError) {
    return createApiErrorResponse(
      error.httpCode || 500,
      error.message,
      error.code,
      error.details
    );
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    const message = error.message || 'An unexpected error occurred';
    
    // Handle specific error types
    if (message.includes('not found') || message.includes('does not exist')) {
      return createApiErrorResponse(404, message);
    }
    
    if (message.includes('unauthorized') || message.includes('not authenticated')) {
      return createApiErrorResponse(401, message);
    }
    
    if (message.includes('forbidden') || message.includes('no permission')) {
      return createApiErrorResponse(403, message);
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return createApiErrorResponse(400, message);
    }
    
    // Generic server error
    return createApiErrorResponse(500, message);
  }
  
  // Handle unexpected error types
  return createApiErrorResponse(
    500,
    'An unexpected error occurred',
    'unknown_error',
    { errorType: typeof error }
  );
}

/**
 * Get a standardized error title based on HTTP status code
 * 
 * @param status HTTP status code
 * @returns Standardized error title
 */
function getErrorTitle(status: number): string {
  switch (status) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 405: return 'Method Not Allowed';
    case 409: return 'Conflict';
    case 422: return 'Unprocessable Entity';
    case 429: return 'Too Many Requests';
    case 500: return 'Internal Server Error';
    case 502: return 'Bad Gateway';
    case 503: return 'Service Unavailable';
    default: return status >= 400 && status < 500 
      ? 'Client Error' 
      : 'Server Error';
  }
}

/**
 * Safely parse JSON from request body
 * 
 * @param req Next.js request object
 * @returns Parsed JSON object or error response
 */
export async function parseRequestBody<T>(req: NextRequest): Promise<T | NextResponse> {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Handle JSON content
    if (contentType.includes('application/json')) {
      // Clone the request to avoid consuming the body
      const body = await req.clone().json();
      return body as T;
    }
    
    // Handle form data
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.clone().formData();
      const data: Record<string, any> = {};
      
      // Convert FormData to plain object
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      return data as T;
    }
    
    // Unsupported content type
    return createApiErrorResponse(
      415,
      `Unsupported content type: ${contentType}`,
      'unsupported_content_type'
    );
  } catch (error) {
    return createApiErrorResponse(
      400,
      'Failed to parse request body',
      'invalid_request_body',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
} 