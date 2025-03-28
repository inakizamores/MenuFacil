'use client';

import React, { ReactNode } from 'react';
import AuthErrorBoundary from '@/components/AuthErrorBoundary';
import { useAuth } from '@/app/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { logError } from '@/lib/errorHandling';

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectPath?: string;
  allowedRoles?: string[];
}

/**
 * Authentication wrapper component with error handling
 * Provides automatic redirection and role-based protection with error boundary
 */
export default function AuthWrapper({
  children,
  requireAuth = true,
  redirectPath = '/login',
  allowedRoles,
}: AuthWrapperProps) {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Track errors in auth for logging
  const [authError, setAuthError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    // Handle auth requirements
    if (!isLoading && requireAuth) {
      // If no user is found when required
      if (!user) {
        const error = new Error('User not authenticated');
        setAuthError(error);
        logError(error, { 
          type: 'auth_redirect',
          requiredAuth: true,
          currentPath: pathname,
          redirectPath
        });
        
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname || '/');
        router.push(`${redirectPath}?returnUrl=${returnUrl}`);
        return;
      }
      
      // If roles are restricted and user doesn't have an allowed role
      if (allowedRoles?.length && userRole && !allowedRoles.includes(userRole)) {
        const error = new Error(`User role ${userRole} not authorized for this page`);
        setAuthError(error);
        logError(error, { 
          type: 'auth_unauthorized',
          userRole,
          allowedRoles,
          currentPath: pathname
        });
        
        // Redirect to unauthorized or dashboard based on authentication
        router.push(user ? '/dashboard' : redirectPath);
        return;
      }
    }
  }, [user, userRole, isLoading, requireAuth, allowedRoles, pathname, redirectPath, router]);
  
  // Handle authentication loading state
  if (isLoading && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error handling for authentication errors
  const handleAuthError = (error: Error, errorInfo: React.ErrorInfo) => {
    logError(error, {
      component: 'AuthWrapper',
      errorInfo,
      path: pathname,
      requireAuth,
      allowedRoles,
      userRole
    });
  };
  
  return (
    <AuthErrorBoundary 
      onError={handleAuthError}
      redirectOnCritical={true}
      redirectPath={redirectPath}
    >
      {children}
    </AuthErrorBoundary>
  );
} 