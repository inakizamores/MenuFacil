'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { logError } from '@/lib/errorHandling';
import { Fallback } from '@/components/ui/Fallback';

/**
 * Global 404 Not Found page
 */
export default function NotFound() {
  useEffect(() => {
    // Log the not found event
    logError(
      new Error(`Page not found: ${window.location.pathname}`),
      { component: 'NotFound' },
      'info'
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Fallback
        variant="info"
        title="Page Not Found"
        message="We couldn't find the page you're looking for."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        action={
          <div className="space-y-2">
            <Link 
              href="/"
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              Return to homepage
            </Link>
            <Link 
              href="/dashboard"
              className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              Go to dashboard
            </Link>
          </div>
        }
        className="max-w-md w-full"
      />
    </div>
  );
} 