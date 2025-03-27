'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { redirect, useRouter } from 'next/navigation';
import { captureException } from '@/lib/sentry';

// Role type for auth system
export type UserRole = 'system_admin' | 'restaurant_owner' | 'restaurant_staff' | 'customer';

// Profile type that includes all profile fields
export interface UserProfile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  website: string | null;
  company: string | null;
  position: string | null;
  location: string | null;
  timezone: string | null;
  language: string | null;
  preferences: Record<string, any> | null;
  social_accounts: Record<string, string> | null;
  billing_address: Record<string, any> | null;
  verified: boolean | null;
  onboarding_completed: boolean | null;
  last_login: string | null;
  parent_user_id: string | null;
  linked_restaurant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Auth state interface - consolidated user information
export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface - contains state and methods
export interface AuthContextInterface extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  getProfileById: (userId: string) => Promise<UserProfile | null>;
  updateUserMetadata: (metadata: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: () => Promise<{ success: boolean; error?: string }>;
  verifyEmail: () => Promise<{ success: boolean; error?: string }>;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

// Provider component that wraps the app and provides auth context
export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  // Create the Supabase client
  const supabase = createClient();
  const router = useRouter();

  // State for user auth and profile data
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: initialSession,
    profile: null,
    role: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state - get the user session
  useEffect(() => {
    async function initializeAuthState() {
      try {
        // Set loading state
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // If we have a session and user, get their profile and role
        if (session?.user) {
          await loadUserProfile(session.user, session);
        } else {
          // No session, clear state
          setAuthState({
            user: null,
            session: null,
            profile: null,
            role: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        captureException(error);
        
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        }));
      }
    }

    // Load the user profile and set state
    async function loadUserProfile(user: User, session: Session) {
      try {
        // First try to get role from user metadata (fastest)
        let role: UserRole | null = null;
        if (user.user_metadata?.role) {
          role = user.user_metadata.role as UserRole;
        }

        // Then fetch the full profile from the database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // Log error but don't throw - we might still have basic user data
          console.error('Error fetching user profile:', profileError);
          captureException(profileError);
        }

        // If profile exists in DB, use its role (more authoritative)
        if (profile?.role) {
          role = profile.role as UserRole;
        }

        // Update auth state with all the info
        setAuthState({
          user,
          session,
          profile: profile as UserProfile,
          role,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        captureException(error);
        
        setAuthState({
          user,
          session,
          profile: null,
          role: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Profile loading error',
        });
      }
    }

    // Load initial auth state
    initializeAuthState();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user, session);
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            role: null,
            isLoading: false,
            error: null,
          });
        } else if (event === 'USER_UPDATED' && session?.user) {
          await loadUserProfile(session.user, session);
        }
      }
    );

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign in'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sign in' 
      };
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            // Default role if not provided
            role: metadata?.role || 'restaurant_owner',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user?.identities?.length === 0) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return { 
          success: true, 
          error: 'Please check your email to confirm your account' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign up'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sign up' 
      };
    }
  };

  // Sign out the user
  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        session: null,
        profile: null,
        role: null,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign out'
      }));
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password' 
      };
    }
  };

  // Update user's password
  const updatePassword = async (password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // Validation
      if (password.length < 8) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Password must be at least 8 characters long' 
        }));
        return { 
          success: false, 
          error: 'Password must be at least 8 characters long' 
        };
      }
      
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update password'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update password' 
      };
    }
  };

  // Update user profile
  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!authState.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', authState.user.id)
        .select();

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      // Update local state with new profile data
      setAuthState((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...profile } as UserProfile,
        isLoading: false,
      }));

      // If role was updated, sync it to the local state
      if (profile.role && profile.role !== authState.role) {
        setAuthState((prev) => ({
          ...prev,
          role: profile.role as UserRole,
        }));
        
        // Also update the user metadata for consistency
        await supabase.auth.updateUser({
          data: { role: profile.role },
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  };

  // Refresh the user session
  const refreshSession = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        throw error;
      }
      
      if (session?.user) {
        // Get the latest profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // Update the state with fresh data
        setAuthState((prev) => ({
          ...prev,
          user: session.user,
          session,
          profile: profileError ? prev.profile : (profile as UserProfile),
          role: profile?.role as UserRole || prev.role,
          isLoading: false,
          error: null,
        }));
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh session'
      }));
    }
  };

  // Get a user profile by ID
  const getProfileById = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get profile error:', error);
        captureException(error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Get profile error:', error);
      captureException(error);
      return null;
    }
  };

  // Update user metadata
  const updateUserMetadata = async (metadata: Record<string, any>) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      // If role is being updated, also update the profile and local state
      if (metadata.role && authState.user?.id) {
        await supabase
          .from('profiles')
          .update({ role: metadata.role })
          .eq('id', authState.user.id);
        
        setAuthState((prev) => ({
          ...prev,
          role: metadata.role as UserRole,
        }));
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Update metadata error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update user metadata'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user metadata' 
      };
    }
  };

  // Mark user onboarding as completed
  const completeOnboarding = async () => {
    if (!authState.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', authState.user.id);

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      // Update local state
      setAuthState((prev) => ({
        ...prev,
        profile: { ...prev.profile, onboarding_completed: true } as UserProfile,
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      console.error('Complete onboarding error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete onboarding'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
      };
    }
  };

  // Mark email as verified (mainly for admin use)
  const verifyEmail = async () => {
    if (!authState.user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('id', authState.user.id);

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      // Update local state
      setAuthState((prev) => ({
        ...prev,
        profile: { ...prev.profile, verified: true } as UserProfile,
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      console.error('Verify email error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to verify email'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to verify email' 
      };
    }
  };

  // Send email verification link to the user
  const sendVerificationEmail = async () => {
    if (!authState.user?.id || !authState.user?.email) {
      return { success: false, error: 'User not authenticated or missing email' };
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // Use Supabase's built-in email verification
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: authState.user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Send verification email error:', error);
      captureException(error);
      
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to send verification email'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send verification email' 
      };
    }
  };

  // Provide the auth context value
  const authContextValue: AuthContextInterface = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    getProfileById,
    updateUserMetadata,
    completeOnboarding,
    verifyEmail,
    sendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component to require authentication
export function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const { user, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !user) {
        redirect('/login');
      }
    }, [user, isLoading]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null; // Will redirect via the useEffect
    }

    return <Component {...props} />;
  };
}

// HOC to require a specific role
export function withRole(Component: React.ComponentType, allowedRoles: UserRole[]) {
  return function RoleProtectedComponent(props: any) {
    const { user, role, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          redirect('/login');
        } else if (role && !allowedRoles.includes(role)) {
          redirect('/unauthorized');
        }
      }
    }, [user, role, isLoading]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user || (role && !allowedRoles.includes(role))) {
      return null; // Will redirect via the useEffect
    }

    return <Component {...props} />;
  };
}

// HOC to require onboarding completion
export function withOnboarding(Component: React.ComponentType) {
  return function OnboardingRequiredComponent(props: any) {
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          redirect('/login');
        } else if (profile && !profile.onboarding_completed) {
          redirect('/onboarding');
        }
      }
    }, [user, profile, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user || (profile && !profile.onboarding_completed)) {
      return null; // Will redirect via the useEffect
    }

    return <Component {...props} />;
  };
} 