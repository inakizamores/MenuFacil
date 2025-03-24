'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase.types';
import { toUUID } from '@/lib/utils';

/**
 * Create a Supabase client for server components with cookies for auth
 * Uses the createServerClient from @supabase/ssr for proper SSR support
 */
const createClient = () => {
  const cookieStore = cookies();
  
  // Create a properly typed client with cookie-based authentication
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

/**
 * Updates or creates a user profile with the provided data
 * 
 * @param userId - The ID of the user to update
 * @param profileData - Profile data to update
 * @returns An object indicating success or failure with a message
 */
export async function updateUserProfile(
  userId: string,
  profileData: {
    full_name?: string;
    avatar_url?: string | null;
    bio?: string;
    website?: string;
    company?: string;
    position?: string;
  }
) {
  try {
    const supabase = createClient();
    
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }
    
    // Parse the profile data to extract first and last name
    const fullName = profileData.full_name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['profiles']['Update'])
        .eq('user_id', userId);
      
      if (error) throw new Error(`Error updating profile: ${error.message}`);
    } else {
      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          avatar_url: profileData.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['profiles']['Insert']);
      
      if (error) throw new Error(`Error creating profile: ${error.message}`);
    }
    
    return {
      status: 'success',
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
    };
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    return {
      status: 'error',
      message: error.message || 'Failed to update profile',
    };
  }
}

/**
 * Updates a user's settings in the database
 * 
 * @param userId - The ID of the user to update settings for
 * @param settings - The settings data to update
 * @returns An object indicating success or failure with a message
 */
export async function updateUserSettings(
  userId: string,
  settings: {
    full_name?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  }
) {
  try {
    const supabase = createClient();
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }
    
    // Parse the settings data
    const fullName = settings.full_name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['profiles']['Update'])
        .eq('user_id', userId);
      
      if (error) throw new Error(`Error updating profile: ${error.message}`);
    } else {
      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['profiles']['Insert']);
      
      if (error) throw new Error(`Error creating profile: ${error.message}`);
    }
    
    return {
      status: 'success',
      message: 'Settings updated successfully',
    };
  } catch (error: any) {
    console.error('Settings update error:', error);
    
    return {
      status: 'error',
      message: error.message || 'Failed to update settings',
    };
  }
} 