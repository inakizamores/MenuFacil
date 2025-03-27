'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Something went wrong!</h1>
          <p className="text-lg mb-6">We apologize for the inconvenience. Our team has been notified about this issue.</p>
          <div className="space-x-4">
            <Button 
              onClick={() => reset()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Go to homepage
            </Button>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            Error ID: {error.digest || 'unknown'}
          </p>
        </div>
      </body>
    </html>
  );
} 