'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Fallback } from '@/components/ui/Fallback';
import { logError } from '@/lib/errorHandling';
import { useRouter } from 'next/navigation';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  redirectOnCritical?: boolean;
  redirectPath?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isCritical: boolean;
}

/**
 * Specialized error boundary for authentication-related components
 * Provides contextual error handling for auth flows with appropriate user actions
 */
class AuthErrorBoundaryClass extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isCritical: false
    };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    // Determine if this is a critical auth error that should trigger a redirect
    const isCritical = error.message.includes('session expired') || 
                      error.message.includes('not authenticated') ||
                      error.message.includes('access token is invalid');
    
    return {
      hasError: true,
      error,
      isCritical
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error with additional auth context
    logError(error, { 
      component: 'AuthErrorBoundary',
      errorInfo,
      authContext: true
    }, 'error');
  }
  
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isCritical: false
    });
  };

  render(): ReactNode {
    const { hasError, error, isCritical } = this.state;
    const { children, redirectOnCritical = true, redirectPath = '/login' } = this.props;

    if (hasError && error) {
      // For critical auth errors that should redirect
      if (isCritical && redirectOnCritical) {
        return (
          <AuthErrorRedirect 
            error={error} 
            redirectPath={redirectPath} 
          />
        );
      }
      
      // For non-critical auth errors, show a styled error message with contextual actions
      return (
        <Fallback
          variant="error"
          title="Authentication Error"
          message={this.getErrorMessage(error)}
          action={this.getErrorAction(error)}
        />
      );
    }

    return children;
  }
  
  // Get user-friendly error message based on error type
  private getErrorMessage(error: Error): string {
    // Authentication-specific error messages
    if (error.message.includes('incorrect password')) {
      return "The password you entered is incorrect. Please try again.";
    } else if (error.message.includes('user not found')) {
      return "We couldn't find an account with that email. Please check your email or create a new account.";
    } else if (error.message.includes('email not confirmed')) {
      return "Your email address hasn't been verified. Please check your inbox for a verification email.";
    } else if (error.message.includes('too many requests')) {
      return "Too many login attempts. Please try again later.";
    } else if (error.message.includes('network')) {
      return "Network connection error. Please check your internet connection and try again.";
    }
    
    // Default error message
    return process.env.NODE_ENV === 'development' 
      ? error.message
      : "We encountered an error while processing your authentication request.";
  }
  
  // Get appropriate actions based on error type
  private getErrorAction(error: Error): ReactNode {
    // For common auth errors, provide helpful action buttons
    if (error.message.includes('incorrect password') || error.message.includes('user not found')) {
      return (
        <div className="space-y-2 w-full">
          <button
            onClick={this.resetError}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try again
          </button>
          <a
            href="/forgot-password"
            className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Forgot password?
          </a>
        </div>
      );
    } else if (error.message.includes('email not confirmed')) {
      return (
        <div className="space-y-2 w-full">
          <button
            onClick={this.resetError}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try again
          </button>
          <button
            onClick={() => {
              // Logic to resend verification email would be added here
              alert('Verification email sent!');
              this.resetError();
            }}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resend verification email
          </button>
        </div>
      );
    }
    
    // Default action is just a retry button
    return (
      <button
        onClick={this.resetError}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Try again
      </button>
    );
  }
}

// Wrapper component for handling redirects
function AuthErrorRedirect({ error, redirectPath }: { error: Error, redirectPath: string }) {
  const router = useRouter();
  
  React.useEffect(() => {
    // Log the critical error before redirecting
    logError(error, { 
      component: 'AuthErrorRedirect',
      redirecting: true,
      redirectPath
    });
    
    // Add a small delay to ensure logging completes
    const timer = setTimeout(() => {
      router.push(`${redirectPath}?error=${encodeURIComponent('Your session has expired. Please log in again.')}`);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [error, redirectPath, router]);
  
  // Show a loading message while redirecting
  return (
    <Fallback
      variant="loading"
      title="Redirecting..."
      message="You'll be redirected to the login page momentarily."
    />
  );
}

// Wrapper to provide router context to the class component
export default function AuthErrorBoundary(props: AuthErrorBoundaryProps) {
  return <AuthErrorBoundaryClass {...props} />;
} 