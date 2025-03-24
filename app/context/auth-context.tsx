'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  updatePassword, 
  getCurrentUser, 
  getSession,
  SignInCredentials,
  SignUpCredentials
} from '../utils/auth';
import { supabase } from '../config/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { 
  SystemRole, 
  isSystemAdmin, 
  isRestaurantOwner, 
  isRestaurantStaff 
} from '../../types/user-roles';

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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<SystemRole | null>(null);
  const router = useRouter();

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const session = await getSession();
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
  }, []); // Empty dependency array as this should only run once on mount

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
      const { user, session } = await signIn(credentials);
      setUser(user);
      setSession(session);
      
      // Set role and redirect to appropriate dashboard
      if (user) {
        const role = user.user_metadata?.role as SystemRole || 'restaurant_owner';
        setUserRole(role);
        router.push(getHomeRoute());
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: SignUpCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, session } = await signUp(credentials);
      setUser(user);
      setSession(session);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut();
      setUser(null);
      setSession(null);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email);
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
      await updatePassword(password);
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