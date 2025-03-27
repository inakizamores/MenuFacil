/**
 * Error handling utilities for consistent error management across the application
 */

import { captureException } from './sentry';

// Define error categories for better organization
export type ErrorCategory = 
  | 'api' 
  | 'auth' 
  | 'form' 
  | 'database' 
  | 'network' 
  | 'server' 
  | 'client' 
  | 'unknown';

// Detailed error interface for consistent handling
export interface DetailedError extends Error {
  category: ErrorCategory;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  handled: boolean;
}

/**
 * Create a detailed error with additional context
 */
export function createDetailedError(
  message: string,
  category: ErrorCategory = 'unknown',
  options?: {
    code?: string;
    details?: Record<string, any>;
    originalError?: Error;
  }
): DetailedError {
  const error = new Error(message) as DetailedError;
  error.category = category;
  error.code = options?.code;
  error.details = options?.details;
  error.timestamp = new Date().toISOString();
  error.handled = false;
  
  // Preserve original stack trace if available
  if (options?.originalError) {
    error.stack = options.originalError.stack;
  }
  
  return error;
}

/**
 * Formats an error message for display to the user
 */
export function formatErrorMessage(error: Error | DetailedError | unknown): string {
  if (!error) return 'An unknown error occurred';
  
  // If it's our DetailedError type
  if (error instanceof Error && 'category' in error) {
    const detailedError = error as DetailedError;
    
    // Return user-friendly messages based on category
    switch (detailedError.category) {
      case 'auth':
        return detailedError.code === 'expired' 
          ? 'Your session has expired. Please log in again.' 
          : 'Authentication error. Please log in again.';
          
      case 'network':
        return 'Network connection issue. Please check your internet connection.';
        
      case 'server':
        return 'Server error. Our team has been notified and is working on a fix.';
        
      case 'api':
        return detailedError.message || 'API request failed. Please try again.';
        
      case 'database':
        return 'Database operation failed. Please try again later.';
        
      case 'form':
        return detailedError.message || 'Invalid form data. Please check your inputs.';
        
      default:
        return detailedError.message;
    }
  }
  
  // If it's a standard Error
  if (error instanceof Error) {
    return error.message;
  }
  
  // For any other type of error
  return String(error);
}

/**
 * Log an error with consistent formatting and send to monitoring service
 */
export function logError(
  error: Error | DetailedError | unknown,
  context?: Record<string, any>,
  level: 'error' | 'warning' | 'info' = 'error'
): void {
  // Format what we're logging
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    category: (error as DetailedError)?.category || 'unknown',
    code: (error as DetailedError)?.code,
    details: (error as DetailedError)?.details,
    context,
  };
  
  // Log to console for now (would be replaced with proper logging service in production)
  if (level === 'error') {
    console.error('ERROR:', logData);
  } else if (level === 'warning') {
    console.warn('WARNING:', logData);
  } else {
    console.info('INFO:', logData);
  }
  
  // Send error to Sentry
  if (level === 'error') {
    captureException(error, {
      ...context,
      errorCategory: (error as DetailedError)?.category || 'unknown',
      errorCode: (error as DetailedError)?.code,
      errorDetails: (error as DetailedError)?.details,
    });
  }
  
  // Mark error as handled
  if ((error as DetailedError)?.handled !== undefined) {
    (error as DetailedError).handled = true;
  }
}

/**
 * Parse and handle API error responses
 */
export function handleApiError(error: unknown): DetailedError {
  // Default error to return if parsing fails
  let detailedError = createDetailedError(
    'An unexpected API error occurred',
    'api'
  );
  
  try {
    // Handle fetch Response errors
    if (error instanceof Response) {
      detailedError = createDetailedError(
        `API error: ${error.status} ${error.statusText}`,
        'api',
        {
          code: String(error.status),
          details: { status: error.status, statusText: error.statusText }
        }
      );
    }
    // Handle standard errors
    else if (error instanceof Error) {
      detailedError = createDetailedError(
        error.message,
        'api',
        { originalError: error }
      );
    }
    // Handle string errors
    else if (typeof error === 'string') {
      detailedError = createDetailedError(error, 'api');
    }
    // Handle unknown errors
    else {
      detailedError = createDetailedError(
        'Unknown API error',
        'api',
        { details: { error } }
      );
    }
    
    // Log the error
    logError(detailedError);
    
    return detailedError;
  } catch (parsingError) {
    // If error parsing itself fails, log and return a generic error
    logError(parsingError, { originalError: error });
    return detailedError;
  }
}

/**
 * Handle form validation errors
 */
export function handleFormError(error: unknown): DetailedError {
  let formError = createDetailedError(
    'Form validation failed',
    'form'
  );
  
  try {
    if (error instanceof Error) {
      formError = createDetailedError(
        error.message,
        'form',
        { originalError: error }
      );
    } else if (typeof error === 'string') {
      formError = createDetailedError(error, 'form');
    } else {
      formError = createDetailedError(
        'Invalid form data',
        'form',
        { details: { error } }
      );
    }
    
    logError(formError, {}, 'warning');
    return formError;
  } catch (parsingError) {
    logError(parsingError, { originalError: error });
    return formError;
  }
}

/**
 * Extract useful information from an Error object
 */
export function extractErrorInfo(error: unknown): {
  message: string;
  code?: string;
  details?: Record<string, any>;
} {
  if (!error) {
    return { message: 'Unknown error' };
  }
  
  if (error instanceof Error) {
    if ('category' in error) {
      const detailedError = error as DetailedError;
      return {
        message: detailedError.message,
        code: detailedError.code,
        details: detailedError.details,
      };
    }
    
    return { message: error.message };
  }
  
  return { message: String(error) };
} 