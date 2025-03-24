'use client';

import React from 'react';
import { Fallback } from '@/components/ui/Fallback';
import { logError } from '@/lib/errorHandling';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error page for handling errors at the route level
 * This component is used by Next.js when an error occurs in a route
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  // Log the error when the component mounts
  React.useEffect(() => {
    logError(error, { 
      component: 'GlobalError',
      digest: error.digest
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Fallback
            variant="error"
            title="Something went wrong!"
            message={
              process.env.NODE_ENV === 'development'
                ? `${error.message || 'An unexpected error occurred'}`
                : "We're sorry, but something went wrong. Our team has been notified and is working to fix the issue."
            }
            action={
              <div className="space-y-2">
                <button
                  onClick={reset}
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
                {process.env.NODE_ENV === 'development' && error.digest && (
                  <div className="mt-3 text-xs text-gray-500">
                    <code>Error Digest: {error.digest}</code>
                  </div>
                )}
              </div>
            }
            className="max-w-md w-full"
            fullPage={false}
          />
        </div>
      </body>
    </html>
  );
} 