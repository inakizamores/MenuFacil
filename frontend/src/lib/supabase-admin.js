/**
 * Supabase Admin Client
 * This file should only be imported on the server side!
 * 
 * This creates an admin client with the service role key
 * that can bypass RLS policies and perform administrative actions.
 */

import { createClient } from '@supabase/supabase-js';

// Make sure this runs only on the server
if (typeof window !== 'undefined') {
  throw new Error('supabase-admin.js should only be used on the server');
}

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Function to check if required environment variables are available
function verifyEnvironment() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
}

// Verify environment before exporting
verifyEnvironment();

export { supabaseAdmin };

// Helper functions that use the admin client

/**
 * Create a new user with admin privileges
 */
export async function createUser({ email, password, metadata = {} }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Get user by ID using admin privileges
 */
export async function getUserById(userId) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * List users using admin privileges
 */
export async function listUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    throw error;
  }
  
  return data;
} 