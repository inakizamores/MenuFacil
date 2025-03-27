'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { 
  SystemRole, 
  isSystemAdmin, 
  isRestaurantOwner, 
  isRestaurantStaff 
} from '../../types/user-roles';
import { navigateTo } from '@/app/utils/navigation';

// Define the auth credentials types
export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  name?: string;
  role?: SystemRole;
};

// Define the auth context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isSystemAdmin: boolean;
  isRestaurantOwner: boolean;
  isRestaurantStaff: boolean;
  userRole: SystemRole | null;
  login: (credentials: SignInCredentials) => Promise<void>;
  register: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetUserPassword: (password: string) => Promise<void>;
  getHomeRoute: () => string;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<SystemRole | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Generate a unique ID for this session to prevent stale data
        const sessionId = `auth_session_${Date.now()}`;
        console.log(`Initializing auth (session ${sessionId})`);
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set state with the current session data
        setSession(session);
        setUser(session?.user || null);
        
        // Set user role
        if (session?.user) {
          const role = session.user.user_metadata?.role as SystemRole || 'restaurant_owner';
          setUserRole(role);
          console.log(`User authenticated: ${session.user.email} (${role})`);
          
          // Store in localStorage for recovery if needed
          if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', role);
            localStorage.setItem('currentUserEmail', session.user.email || '');
          }
        } else {
          console.log('No authenticated user found');
          // Clear any previous user data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userRole');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('staffRestaurantName');
            localStorage.removeItem('staffRestaurantId');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event} for ${session?.user?.email || 'no user'}`);
      
      // If user has changed, clear previous state first
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setUserRole(null);
        
        // Clear localStorage items on sign out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userRole');
          localStorage.removeItem('currentUserEmail');
          localStorage.removeItem('staffRestaurantName');
          localStorage.removeItem('staffRestaurantId');
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Check if this is a new user (different from the current one)
        const currentEmail = localStorage.getItem('currentUserEmail');
        const newEmail = session?.user?.email;
        
        if (currentEmail !== newEmail) {
          console.log(`User changed: ${currentEmail} -> ${newEmail}`);
          // Reset any user-specific state
          setUser(null);
          setSession(null);
          setUserRole(null);
        }
        
        // Update with new session data
        setSession(session);
        setUser(session?.user || null);
        
        // Update role when auth state changes
        if (session?.user) {
          const role = session.user.user_metadata?.role as SystemRole || 'restaurant_owner';
          setUserRole(role);
          
          // Store updated user info
          if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', role);
            localStorage.setItem('currentUserEmail', session.user.email || '');
          }
        }
      }
    });

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up auth listener');
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Helper function to determine home route based on user role
  const getHomeRoute = (): string => {
    if (!user) return '/';
    
    // Check for admin role
    if (isSystemAdmin(user)) {
      return '/admindashboard';
    }
    
    // All other users go to the unified dashboard
    return '/dashboard';
  };

  const login = async (credentials: SignInCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt started');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      console.log('Login response received:', { 
        success: !error, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error ? error.message : null
      });
      
      if (error) throw error;
      
      // Important: Update state first before redirecting
      setUser(data.user);
      setSession(data.session);
      console.log('User and session set in context');
      
      // Set role and redirect to appropriate dashboard
      if (data.user) {
        const role = data.user.user_metadata?.role as SystemRole || 'restaurant_owner';
        setUserRole(role);
        console.log('User role set:', role);
        
        // Store role in localStorage for backup navigation
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', role);
          localStorage.setItem('currentUserEmail', data.user.email || '');
          // Set a login timestamp to ensure fresh state
          localStorage.setItem('last_login_timestamp', Date.now().toString());
        }
        
        // Determine which dashboard to redirect to based on role
        const dashboardPath = role === 'system_admin' ? '/admindashboard' : '/dashboard';
        console.log(`Redirecting to ${dashboardPath}`);
        
        // Use a small delay to ensure state updates have propagated
        setTimeout(async () => {
          try {
            // First try with router navigation
            const navigationResult = await navigateTo(router, dashboardPath, { 
              fallback: true,
              delay: 300,
              forceReload: false
            });
            
            console.log('Navigation result:', navigationResult);
            
            // If we're still not at the dashboard, force a reload
            if (typeof window !== 'undefined' && 
                !window.location.pathname.endsWith(dashboardPath)) {
              console.log(`Forcing direct navigation to ${dashboardPath}`);
              window.location.href = dashboardPath;
            }
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Final fallback
            if (typeof window !== 'undefined') {
              window.location.href = dashboardPath;
            }
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Login error caught:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
      console.log('Login process completed, isLoading set to false');
    }
  };

  const register = async (credentials: SignUpCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
            role: credentials.role || 'restaurant_owner'
          },
        },
      });
      
      if (error) throw error;
      
      setUser(data.user);
      setSession(data.session);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logout initiated from auth context');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Continue with cleanup even if Supabase has an error
      } else {
        console.log('Supabase signOut successful');
      }
      
      // Clear all auth state
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Clear localStorage items
      if (typeof window !== 'undefined') {
        console.log('Clearing localStorage items');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('staffRestaurantName');
        localStorage.removeItem('staffRestaurantId');
        
        // Force clear any cached data
        sessionStorage.clear();
        
        // Also clear any Supabase-specific items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth') || 
              key.startsWith('sb-') || 
              key.includes('supabase')) {
            console.log(`Removing localStorage item: ${key}`);
            localStorage.removeItem(key);
          }
        });
      }
      
      console.log('Redirecting to home page from auth context');
      
      // Force a direct navigation rather than using the helper
      if (typeof window !== 'undefined') {
        console.log('Forcing full page reload');
        window.location.href = '/';
        return;
      }
      
      // Use the navigation helper as a fallback
      navigateTo(router, '/', {
        fallback: true,
        delay: 100,
        forceReload: true
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
      
      // Even if there's an error, try to force a logout
      if (typeof window !== 'undefined') {
        // Clear any persisted auth data
        localStorage.clear();
        sessionStorage.clear();
        
        // Force navigation to home
        window.location.href = '/';
      }
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserPassword = async (password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    isSystemAdmin: isSystemAdmin(user),
    isRestaurantOwner: isRestaurantOwner(user),
    isRestaurantStaff: isRestaurantStaff(user),
    userRole,
    login,
    register,
    logout,
    forgotPassword,
    resetUserPassword,
    getHomeRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 