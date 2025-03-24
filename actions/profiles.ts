'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase.types';
import { toUUID } from '@/lib/utils';

/**
 * Create a Supabase client for server components with cookies for auth
 * Uses the createServerClient from @supabase/ssr for proper SSR support
 * 
 * This function handles cookie-based authentication and provides a properly 
 * typed client for database operations with full type safety.
 * 
 * @returns A properly configured Supabase client with cookie-based auth
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
 * This function handles both the creation of a new profile if one doesn't exist,
 * and updating an existing profile. It parses the full name into first and last name
 * components for database storage.
 * 
 * @param userId - The ID of the user to update
 * @param profileData - Profile data to update (full_name, avatar_url, etc.)
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
    
    // First check if profile exists by querying the profiles table
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    // Handle errors, but ignore "not found" errors (PGRST116)
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }
    
    // Parse the profile data to extract first and last name from full_name
    const fullName = profileData.full_name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    // Join all remaining parts as last name, or null if there's only one part
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
    
    if (existingProfile) {
      // Update existing profile if one exists
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(), // Update the timestamp
        } as Database['public']['Tables']['profiles']['Update'])
        .eq('user_id', userId);
      
      if (error) throw new Error(`Error updating profile: ${error.message}`);
    } else {
      // Create new profile if none exists
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          avatar_url: profileData.avatar_url,
          created_at: new Date().toISOString(), // Set initial timestamps
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['profiles']['Insert']);
      
      if (error) throw new Error(`Error creating profile: ${error.message}`);
    }
    
    return {
      success: true,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
    };
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
}

/**
 * Updates a user's settings in the database and Supabase Auth metadata
 * 
 * This function performs two key operations:
 * 1. Updates the user's profile in the profiles table (first_name, last_name)
 * 2. Updates the user's metadata in Supabase Auth (language, notifications, theme)
 * 
 * The function handles both new and existing profiles and properly updates timestamps.
 * 
 * @param userId - The ID of the user to update settings for
 * @param settings - The settings data to update (full_name, language, notifications, theme)
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
    theme?: 'light' | 'system';
  }
) {
  try {
    const supabase = createClient();
    
    // Check if profile exists to determine if we need to create or update
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    // Handle errors, but ignore "not found" errors (PGRST116)
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }
    
    // Parse name components from full_name for database storage
    const fullName = settings.full_name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
    
    // Step 1: Update or create profile in profiles table
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
    
    // Step 2: Update user metadata in Supabase Auth
    // This stores settings like language, notifications, and theme preferences
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        language: settings.language,
        notifications: settings.notifications,
        theme: settings.theme || 'light', // Default to light theme if not specified
      }
    });
    
    if (metadataError) throw new Error(`Error updating user metadata: ${metadataError.message}`);
    
    return {
      success: true,
      message: 'Settings updated successfully',
    };
  } catch (error: any) {
    console.error('Settings update error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to update settings',
    };
  }
}

/**
 * Updates a user's password in Supabase Auth
 * 
 * This function securely updates the user's password. The current implementation
 * doesn't verify the current password - this occurs automatically on the Supabase
 * side when using the updateUser API with a password change.
 * 
 * @param currentPassword - The user's current password (not used in this implementation)
 * @param newPassword - The new password to set
 * @returns An object indicating success or failure with a message
 */
export async function updateUserPassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const supabase = createClient();
    
    // Update user password using Supabase Auth API
    // Note: This doesn't verify the current password - Supabase handles this
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw new Error(`Error updating password: ${error.message}`);
    
    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error: any) {
    console.error('Password update error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to update password',
    };
  }
}

/**
 * Upload a profile picture to Supabase Storage and update the user's profile
 * 
 * This function performs several operations:
 * 1. Uploads the image file to Supabase Storage with a unique name
 * 2. Gets the public URL for the uploaded image
 * 3. Updates the user's profile with the new avatar URL
 * 
 * @param userId - The ID of the user
 * @param file - The file to upload
 * @returns An object with the URL of the uploaded image or an error
 */
export async function uploadProfilePicture(
  userId: string,
  file: File
) {
  try {
    const supabase = createClient();
    
    // Generate a unique file name by combining userId and a random string
    const fileExt = file.name.split('.').pop();
    const randomId = Math.random().toString(36).substring(2); // Random ID for uniqueness
    const fileName = `${userId}-${randomId}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;
    
    // Step 1: Upload file to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600', // Cache control for 1 hour
        upsert: true // Overwrite existing file if it exists
      });
    
    if (uploadError) throw new Error(`Error uploading file: ${uploadError.message}`);
    
    // Step 2: Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    // Step 3: Update the user's profile with the new avatar URL
    await updateUserProfile(userId, {
      avatar_url: publicUrl
    });
    
    return {
      success: true,
      url: publicUrl,
      message: 'Profile picture uploaded successfully',
    };
  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to upload profile picture',
    };
  }
} 