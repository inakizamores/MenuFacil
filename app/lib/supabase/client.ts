import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  // Get the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Log for debugging (truncated to avoid showing the full key)
  if (typeof window !== 'undefined') {
    const truncatedUrl = supabaseUrl.substring(0, 20) + '...';
    console.log(`Creating Supabase client with URL: ${truncatedUrl}`);
  }

  // Always create a new client to ensure we don't have stale data between user sessions
  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey);
  
  return supabaseClient;
}; 