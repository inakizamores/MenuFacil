'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FallbackProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'error' | 'loading' | 'empty' | 'info';
  className?: string;
  fullPage?: boolean;
}

/**
 * Fallback component for displaying various states like errors, loading, or empty states
 * Used by error boundaries, suspense boundaries, and for empty state UIs
 */
export const Fallback: React.FC<FallbackProps> = ({
  title,
  message,
  icon,
  action,
  variant = 'info',
  className,
  fullPage = false,
}) => {
  // Default settings based on variant
  const defaultSettings = {
    error: {
      title: 'Something went wrong',
      message: 'We encountered an unexpected error. Please try again.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      containerClass: 'bg-red-50 border-red-100 text-red-800',
    },
    loading: {
      title: 'Loading...',
      message: 'Please wait while we load the content.',
      icon: (
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      ),
      containerClass: 'bg-blue-50 border-blue-100 text-blue-800',
    },
    empty: {
      title: 'No data found',
      message: 'There is no data to display at the moment.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      containerClass: 'bg-gray-50 border-gray-100 text-gray-800',
    },
    info: {
      title: 'Information',
      message: 'Here is some information for you.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      containerClass: 'bg-blue-50 border-blue-100 text-blue-800',
    },
  };

  // Get the settings for the current variant
  const settings = defaultSettings[variant];

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center p-6 rounded-lg border text-center',
        settings.containerClass,
        fullPage && 'fixed inset-0 z-50',
        className
      )}
      role={variant === 'error' ? 'alert' : variant === 'loading' ? 'status' : 'region'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div className="mb-4">
        {icon || settings.icon}
      </div>
      <h3 className="text-lg font-medium mb-2">
        {title || settings.title}
      </h3>
      <p className="text-sm mb-4">
        {message || settings.message}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}; 