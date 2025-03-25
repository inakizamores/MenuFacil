import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase.types';

export function createClient() {
  // Use the new Supabase-Vercel integrated variables if available, falling back to legacy variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY as string;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // For debugging
  console.log('Creating Supabase browser client with URL:', supabaseUrl.substring(0, 15) + '...');
  
  // Create browser client with cookie persistence
  return createBrowserClient<Database>(
    supabaseUrl, 
    supabaseKey
  );
} 