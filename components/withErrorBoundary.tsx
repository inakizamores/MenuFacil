'use client';

import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import APIErrorBoundary from './APIErrorBoundary';
import { Fallback, FallbackProps } from './ui/Fallback';

export interface WithErrorBoundaryOptions {
  /**
   * Type of error boundary to use
   */
  type?: 'general' | 'api';
  
  /**
   * Custom fallback component to render when an error occurs
   */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  
  /**
   * Custom fallback props to use with the default fallback
   */
  fallbackProps?: Omit<FallbackProps, 'action'>;
  
  /**
   * Callback function when an error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /**
   * For API error boundary: custom retry action
   */
  retryAction?: () => Promise<void>;
}

/**
 * HOC that wraps a component with an error boundary
 * 
 * @param Component - The component to wrap
 * @param options - Error boundary configuration options
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.FC<P> {
  const {
    type = 'general',
    fallback,
    fallbackProps,
    onError,
    retryAction,
  } = options;

  const displayName = Component.displayName || Component.name || 'Component';

  // Create a default fallback based on fallbackProps
  const defaultFallback = (error: Error, resetError: () => void) => (
    <Fallback
      variant="error"
      title={fallbackProps?.title || 'Something went wrong'}
      message={fallbackProps?.message || error.message}
      icon={fallbackProps?.icon}
      action={
        <button
          onClick={resetError}
          className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try again
        </button>
      }
      className={fallbackProps?.className}
      fullPage={fallbackProps?.fullPage}
    />
  );

  // The wrapped component
  const WithErrorBoundary: React.FC<P> = (props) => {
    if (type === 'api') {
      return (
        <APIErrorBoundary
          fallback={fallback || defaultFallback}
          onError={onError}
          retryAction={retryAction}
        >
          <Component {...props} />
        </APIErrorBoundary>
      );
    }

    return (
      <ErrorBoundary
        fallback={fallback || defaultFallback}
        onError={onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

export default withErrorBoundary; 