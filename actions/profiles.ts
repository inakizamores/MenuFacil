'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase.types';
// TODO: Import and use ensureUUID from @/lib/utils after fixing type compatibility issues

// Create a Supabase client configured to use cookies
const createClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { path: string; domain?: string }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

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
    
    // TODO: Add UUID validation for userId using ensureUUID(userId)
    
    // First, check if the profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }
    
    // Prepare the update data
    const nameParts = profileData.full_name?.split(' ') || [];
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
        })
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
        });
      
      if (error) throw new Error(`Error creating profile: ${error.message}`);
    }
    
    // Also update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        website: profileData.website,
        company: profileData.company,
        position: profileData.position,
      },
    });
    
    if (updateError) throw new Error(`Error updating user metadata: ${updateError.message}`);
    
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function updateUserSettings(
  userId: string,
  settings: {
    full_name?: string;
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  }
) {
  try {
    const supabase = createClient();
    
    // TODO: Add UUID validation for userId using ensureUUID(userId)
    
    // First, check if the profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }
    
    // Prepare name data if provided
    let firstName, lastName;
    if (settings.full_name) {
      const nameParts = settings.full_name.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
    }
    
    if (existingProfile) {
      // Update existing profile if name is provided
      if (settings.full_name) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        
        if (error) throw new Error(`Error updating profile: ${error.message}`);
      }
    } else if (settings.full_name) {
      // Create new profile if name is provided
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw new Error(`Error creating profile: ${error.message}`);
    }
    
    // Update user metadata with settings
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: settings.full_name,
        language: settings.language,
        theme: settings.theme,
        notifications: settings.notifications,
      },
    });
    
    if (updateError) throw new Error(`Error updating user settings: ${updateError.message}`);
    
    return { success: true };
  } catch (error) {
    console.error('Settings update error:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 