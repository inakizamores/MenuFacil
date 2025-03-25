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
import { supabase } from '@/app/config/supabase';

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
      console.log('Logout initiated');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
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
      }
      
      console.log('Redirecting to login page');
      
      // Use the navigation helper with a full page reload
      navigateTo(router, '/auth/login', {
        fallback: true,
        delay: 100
      }).then(() => {
        // Force a full page reload to clear any React state
        if (typeof window !== 'undefined') {
          console.log('Forcing full page reload');
          window.location.href = '/auth/login';
        }
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
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