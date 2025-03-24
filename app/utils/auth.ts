import { supabase } from '../config/supabase';

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  name: string;
};

export const signIn = async ({ email, password }: SignInCredentials) => {
  // First clear any potential conflicting sessions
  await supabase.auth.signOut({ scope: 'local' });
  
  // Then attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const signUp = async ({ email, password, name }: SignUpCredentials) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const signOut = async () => {
  // Call Supabase signOut
  const { error } = await supabase.auth.signOut({
    scope: 'global' // This will remove all Supabase session information
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // For a cleaner approach than manually clearing cookies, reload the page
  // This allows the browser and Supabase client to handle cookie cleanup properly
  window.location.href = '/';
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data.user;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data.session;
}; 