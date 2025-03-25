import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Get the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create options with a unique cache key that will change on each page load
const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: `supabase-auth-token-${Date.now()}`
  }
};

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, options);

// Set up auth API helpers
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
};

export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
};

export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}; 