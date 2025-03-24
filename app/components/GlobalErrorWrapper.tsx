'use client';

import React, { ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Fallback } from '@/components/ui/Fallback';
import { logError } from '@/lib/errorHandling';

interface GlobalErrorWrapperProps {
  children: ReactNode;
  isPageWrapper?: boolean;
}

/**
 * Global error wrapper for the application routes
 * Catches unhandled errors and provides a user-friendly error page
 */
export default function GlobalErrorWrapper({
  children,
  isPageWrapper = false,
}: GlobalErrorWrapperProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to the error handling service
    logError(error, { 
      component: 'GlobalErrorWrapper',
      isPageWrapper,
      info: errorInfo
    });
  };
  
  // Custom fallback UI for the error state
  const errorFallback = (error: Error, resetError: () => void) => (
    <div className={isPageWrapper ? 'min-h-screen flex items-center justify-center p-4' : ''}>
      <Fallback
        variant="error"
        title="Oops! Something went wrong"
        message={
          process.env.NODE_ENV === 'development'
            ? error.message || 'An unexpected error occurred'
            : "We're sorry, but something went wrong. Our team has been notified."
        }
        action={
          <div className="space-y-2">
            <button
              onClick={resetError}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to homepage
            </button>
          </div>
        }
        className={isPageWrapper ? 'max-w-md w-full' : ''}
      />
    </div>
  );
  
  return (
    <ErrorBoundary 
      fallback={errorFallback} 
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
} 