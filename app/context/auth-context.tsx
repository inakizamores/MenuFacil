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
import { 
  generateCSRFToken, 
  validateCSRFToken, 
  checkRateLimit, 
  resetRateLimit,
  sanitizeAuthInput,
  generateSessionId
} from '@/lib/authSecurity';
import { 
  createDetailedError, 
  logError,
  handleApiError
} from '@/lib/errorHandling';
import type { Database } from '@/types/database.types';

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
        const sessionId = generateSessionId();
        console.log(`Initializing auth (session ${sessionId})`);
        
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Handle session retrieval errors
        if (sessionError) {
          logError(sessionError, { component: 'AuthProvider.initAuth', sessionId });
          setError('Failed to retrieve authentication session. Please refresh the page.');
          setIsLoading(false);
          return;
        }
        
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
            localStorage.setItem('sessionId', sessionId);
          }
        } else {
          console.log('No authenticated user found');
          // Clear any previous user data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userRole');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('staffRestaurantName');
            localStorage.removeItem('staffRestaurantId');
            localStorage.removeItem('sessionId');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logError(error, { component: 'AuthProvider.initAuth' });
        setError('Authentication system initialization error. Please refresh the page.');
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
          localStorage.removeItem('sessionId');
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
            localStorage.setItem('sessionId', generateSessionId());
          }
        }
      } else if (event === 'USER_UPDATED') {
        // Handle user data updates
        if (session?.user) {
          setUser(session.user);
          const role = session.user.user_metadata?.role as SystemRole || 'restaurant_owner';
          setUserRole(role);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', role);
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
    
    // Always send admin users to the admin dashboard
    if (isSystemAdmin(user)) {
      console.log('User is admin, home route is /admindashboard');
      return '/admindashboard';
    }
    
    // For all other authenticated users, use the regular dashboard
    console.log('User is not admin, home route is /dashboard');
    return '/dashboard';
  };

  const login = async (credentials: SignInCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt started');
      
      // Input validation and sanitization
      const email = sanitizeAuthInput(credentials.email);
      if (!email) {
        throw createDetailedError('Email is required', 'auth', { code: 'invalid_input' });
      }
      
      // Check for rate limiting
      const rateCheck = checkRateLimit(email);
      if (!rateCheck.valid && rateCheck.error) {
        throw rateCheck.error;
      }
      
      // Attempt login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: credentials.password,
      });
      
      console.log('Login response received:', { 
        success: !error, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error ? error.message : null
      });
      
      if (error) {
        // Track failed login attempt for rate limiting
        throw createDetailedError(error.message, 'auth', { 
          code: error.name, 
          originalError: error 
        });
      }
      
      // Reset rate limit on successful login
      resetRateLimit(email);
      
      // Important: Update state first before redirecting
      setUser(data.user);
      setSession(data.session);
      console.log('User and session set in context');
      
      // Get additional profile data including role from profiles table
      let role: SystemRole | null = null;
      
      if (data.user) {
        try {
          // First check user_metadata for role
          role = data.user.user_metadata?.role as SystemRole;
          console.log('Role from user_metadata:', role);
          
          // Also check profile table for the most accurate role information
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            console.warn('Error fetching profile:', profileError);
            logError(profileError, { component: 'login', userId: data.user.id });
          } else if (profileData && profileData.role) {
            console.log('Role from profiles table:', profileData.role);
            // If profile has a role and it differs from metadata, use the profile role as source of truth
            if (profileData.role !== role) {
              console.log(`Role mismatch - metadata: ${role}, profile: ${profileData.role}. Using profile role.`);
              role = profileData.role as SystemRole;
              
              // Update user_metadata to match the profile role
              const { error: updateError } = await supabase.auth.updateUser({
                data: { role: profileData.role }
              });
              
              if (updateError) {
                console.warn('Error updating user_metadata with profile role:', updateError);
                logError(updateError, { 
                  component: 'login.updateUserMetadata', 
                  userId: data.user.id,
                  metadataRole: role,
                  profileRole: profileData.role
                });
              } else {
                console.log('Updated user_metadata to match profile role');
                // Update our local user state with the corrected metadata
                if (data.user.user_metadata) {
                  data.user.user_metadata.role = profileData.role;
                } else {
                  data.user.user_metadata = { role: profileData.role };
                }
                setUser(data.user);
              }
            }
          }
        } catch (profileCheckError) {
          console.error('Error during profile role check:', profileCheckError);
          logError(profileCheckError, { component: 'login.profileCheck', userId: data.user.id });
        }
        
        // If no role is found, default to restaurant_owner
        if (!role) {
          console.log('No role found, defaulting to restaurant_owner');
          role = 'restaurant_owner';
        }
        
        // Set role in context
        setUserRole(role);
        console.log('Final role set:', role);
        
        // Store role in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', role);
          localStorage.setItem('currentUserEmail', data.user.email || '');
          localStorage.setItem('sessionId', generateSessionId());
        }
        
        // Navigate to appropriate route
        const homeRoute = getHomeRoute();
        console.log(`Redirecting to ${homeRoute}`);
        navigateTo(homeRoute);
      }
    } catch (error) {
      // Structured error handling
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email not verified. Please check your inbox for a verification email.';
        } else if (process.env.NODE_ENV === 'development') {
          // More detailed errors in development
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      logError(error, { component: 'login', email: credentials.email });
    } finally {
      setIsLoading(false);
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