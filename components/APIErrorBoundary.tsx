'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface APIErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryAction?: () => Promise<void>;
}

interface APIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

/**
 * APIErrorBoundary component specifically designed for handling API-related errors
 * Provides retry functionality and better error messages for API failures
 */
class APIErrorBoundary extends Component<APIErrorBoundaryProps, APIErrorBoundaryState> {
  constructor(props: APIErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<APIErrorBoundaryState> {
    return {
      hasError: true,
      error,
      isRetrying: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error to an error reporting service
    console.error('APIErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = async (): Promise<void> => {
    this.setState({ isRetrying: true });
    
    try {
      if (this.props.retryAction) {
        await this.props.retryAction();
      }
      
      // Reset the error state after successful retry
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false
      });
    } catch (retryError) {
      // If retry fails, update the error and show error state again
      this.setState({
        hasError: true,
        error: retryError instanceof Error ? retryError : new Error(String(retryError)),
        isRetrying: false
      });
    }
  };

  getErrorMessage(): string {
    const { error } = this.state;
    
    if (!error) return 'An unknown error occurred';
    
    // Extract more meaningful messages from common API errors
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return 'Request timed out. Please try again later.';
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Authentication failed. Please log in again.';
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'You don\'t have permission to access this resource.';
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'The requested resource was not found.';
    }
    
    if (error.message.includes('500') || error.message.includes('Server Error')) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || 'An unexpected error occurred';
  }

  render(): ReactNode {
    const { hasError, error, isRetrying } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // If fallback is a function, call it with the error and retry function
      if (typeof fallback === 'function') {
        return fallback(error, this.handleRetry);
      }
      
      // If fallback is a React element, render it
      if (fallback) {
        return fallback;
      }
      
      // Default API error fallback UI
      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <h2 className="text-lg font-medium text-red-800">API Error</h2>
          <p className="mt-1 text-sm text-red-700">{this.getErrorMessage()}</p>
          <button
            onClick={this.handleRetry}
            disabled={isRetrying}
            className="mt-3 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      );
    }

    return children;
  }
}

export default APIErrorBoundary; 