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
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        // Set user role
        if (session?.user) {
          const role = session.user.user_metadata?.role as SystemRole || 'restaurant_owner';
          setUserRole(role);
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
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user || null);
      
      // Update role when auth state changes
      if (session?.user) {
        const role = session.user.user_metadata?.role as SystemRole || 'restaurant_owner';
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    // Clean up subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]); // Add supabase.auth as dependency to ensure it recreates the listener if client changes

  // Helper function to determine home route based on user role
  const getHomeRoute = (): string => {
    if (!user) return '/';
    
    if (isSystemAdmin(user)) {
      return '/admin/dashboard';
    } else if (isRestaurantStaff(user)) {
      return '/staff/dashboard';
    } else {
      return '/dashboard'; // Default for restaurant owners
    }
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
        }
        
        // Determine home route based on user role
        const homeRoute = getHomeRoute();
        console.log('About to redirect to:', homeRoute);
        
        // Use navigation helper with fallback
        const navigationResult = await navigateTo(router, homeRoute, { 
          fallback: true,
          delay: 150
        });
        
        console.log('Navigation result:', navigationResult);
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Clear localStorage items
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userRole');
      }
      
      router.push('/auth/login');
    } catch (error: any) {
      setError(error.message);
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