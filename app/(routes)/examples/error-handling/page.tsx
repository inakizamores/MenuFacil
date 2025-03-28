'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';
import APIErrorBoundary from '@/components/APIErrorBoundary';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { Fallback } from '@/components/ui/Fallback';
import { createDetailedError, handleApiError, logError } from '@/lib/errorHandling';

/**
 * Component that intentionally throws an error
 */
const ErrorComponent = () => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    throw new Error('This is a simulated error in a component');
  }
  
  return (
    <div className="p-4 border rounded-md bg-white mb-4">
      <h3 className="text-lg font-medium mb-2">Component Error Example</h3>
      <p className="mb-4">Click the button to trigger an error that will be caught by ErrorBoundary.</p>
      <button 
        onClick={() => setHasError(true)}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Trigger Component Error
      </button>
    </div>
  );
};

/**
 * Component that intentionally throws an API error
 */
const APIErrorComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFetchClick = async () => {
    setIsLoading(true);
    
    // Simulate API error after delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw createDetailedError(
      'Failed to fetch data from API',
      'api',
      { code: 'API_ERROR', details: { endpoint: '/api/example' } }
    );
  };
  
  return (
    <div className="p-4 border rounded-md bg-white mb-4">
      <h3 className="text-lg font-medium mb-2">API Error Example</h3>
      <p className="mb-4">Click the button to simulate an API error that will be caught by APIErrorBoundary.</p>
      <button 
        onClick={handleFetchClick}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Simulate API Error'}
      </button>
    </div>
  );
};

/**
 * Component to demonstrate async error handling
 */
const AsyncErrorDemo = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAsyncOperation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate async operation that fails
      await new Promise(resolve => setTimeout(resolve, 1500));
      throw new Error('Async operation failed');
    } catch (err) {
      // Log the error with our error handling system
      const handledError = handleApiError(err);
      setError(handledError);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-md bg-white mb-4">
      <h3 className="text-lg font-medium mb-2">Async Error Handling</h3>
      <p className="mb-4">Demonstrates handling errors from async operations.</p>
      
      {error && (
        <div className="mb-4">
          <Fallback
            variant="error"
            title="Error in async operation"
            message={error.message}
            action={
              <button
                onClick={() => setError(null)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Dismiss
              </button>
            }
          />
        </div>
      )}
      
      <button 
        onClick={handleAsyncOperation}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Trigger Async Error'}
      </button>
    </div>
  );
};

// Wrap the ErrorComponent with an error boundary using the HOC
const WrappedErrorComponent = withErrorBoundary(ErrorComponent, {
  fallbackProps: {
    title: 'Component Error',
    message: 'Error occurred in the wrapped component.',
    className: 'border-orange-200',
  }
});

/**
 * Main page that demonstrates various error handling approaches
 */
export default function ErrorHandlingExamplesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Handling Examples</h1>
        <p className="text-gray-600 mb-4">
          This page demonstrates various approaches to error handling in the application.
        </p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Error Boundary</h2>
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">API Error Boundary</h2>
          <APIErrorBoundary retryAction={async () => console.log('Retrying...')}>
            <APIErrorComponent />
          </APIErrorBoundary>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">HOC Error Boundary Pattern</h2>
          <WrappedErrorComponent />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Manual Error Handling</h2>
          <AsyncErrorDemo />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100">
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Error Boundaries</strong> - Used for catching component errors. Cannot catch errors in event handlers, async functions, or server-side code.
          </li>
          <li>
            <strong>API Error Boundaries</strong> - Specialized for API errors with retry functionality.
          </li>
          <li>
            <strong>HOC Pattern</strong> - <code>withErrorBoundary</code> provides a reusable way to wrap components.
          </li>
          <li>
            <strong>Manual Handling</strong> - Required for async operations, combined with <code>try/catch</code> blocks.
          </li>
          <li>
            <strong>Global Error Handling</strong> - The app uses <code>GlobalErrorWrapper</code> at the layout level for application-wide protection.
          </li>
        </ul>
      </div>
    </div>
  );
}