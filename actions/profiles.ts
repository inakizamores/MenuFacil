'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase.types';
import { toUUID } from '@/lib/utils';
import { z } from 'zod';
import { createDetailedError, handleApiError, logError } from '@/lib/errorHandling';

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
 * Profile data validation schema using Zod
 */
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().optional(),
  avatar_url: z.string().url('Invalid URL').nullable().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  website: z.string().url('Invalid URL').optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  social_accounts: z.record(z.string().url('Invalid URL')).optional(),
});

/**
 * Type for profile update data with proper validation
 */
export type ProfileUpdateData = z.infer<typeof profileSchema>;

/**
 * Fetches a user's profile from the database
 * 
 * @param userId - The ID of the user to fetch profile for
 * @returns The user profile data or null if not found
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      // Don't throw for "no rows returned" as this is a valid scenario
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    const handledError = handleApiError(error);
    return { data: null, error: handledError };
  }
}

/**
 * Updates or creates a user profile with the provided data
 * 
 * This function handles both the creation of a new profile if one doesn't exist,
 * and updating an existing profile. It follows proper validation and error handling.
 * 
 * @param userId - The ID of the user to update
 * @param profileData - Profile data to update
 * @returns An object indicating success or failure with a message
 */
export async function updateUserProfile(
  userId: string,
  profileData: ProfileUpdateData
) {
  try {
    // Validate the profile data
    const validationResult = profileSchema.safeParse(profileData);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
      throw createDetailedError(
        `Invalid profile data: ${errorMessage}`,
        'form',
        { details: validationResult.error.format() }
      );
    }
    
    const supabase = createClient();
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    // Handle errors, but ignore "not found" errors
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }
    
    // Process full name into first and last names if provided and first/last not explicitly set
    let updateData: any = { ...profileData };
    
    if (profileData.full_name && (!profileData.first_name || !profileData.last_name)) {
      const nameParts = profileData.full_name.split(' ');
      if (!profileData.first_name) {
        updateData.first_name = nameParts[0] || '';
      }
      if (!profileData.last_name && nameParts.length > 1) {
        updateData.last_name = nameParts.slice(1).join(' ');
      }
    }
    
    // If first and last name are provided but full_name is not, create it
    if (profileData.first_name && !profileData.full_name) {
      const lastName = profileData.last_name || '';
      updateData.full_name = `${profileData.first_name} ${lastName}`.trim();
    }
    
    // Add timestamp
    updateData.updated_at = new Date().toISOString();
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (error) throw new Error(`Error updating profile: ${error.message}`);
    } else {
      // Create new profile with additional required fields
      updateData.id = userId;
      updateData.created_at = new Date().toISOString();
      
      // Get email from auth.users if possible
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (!userError && userData?.user) {
          updateData.email = userData.user.email;
        }
      } catch (emailError) {
        console.warn('Could not fetch user email:', emailError);
      }
      
      const { error } = await supabase
        .from('profiles')
        .insert(updateData);
      
      if (error) throw new Error(`Error creating profile: ${error.message}`);
    }
    
    return {
      success: true,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
    };
  } catch (error: any) {
    logError(error, { action: 'updateUserProfile', userId });
    
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
 * 1. Updates the user's profile in the profiles table
 * 2. Updates the user's metadata in Supabase Auth
 * 
 * @param userId - The ID of the user to update settings for
 * @param settings - The settings data to update
 * @returns An object indicating success or failure with a message
 */
export async function updateUserSettings(
  userId: string,
  settings: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    language?: string;
    timezone?: string;
    preferences?: Record<string, any>;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  }
) {
  try {
    const supabase = createClient();
    
    // Prepare profile update data
    const profileData: ProfileUpdateData = {
      full_name: settings.full_name,
      first_name: settings.first_name,
      last_name: settings.last_name,
      language: settings.language,
      timezone: settings.timezone,
    };
    
    // Add preferences if provided
    if (settings.preferences) {
      profileData.preferences = settings.preferences;
    }
    
    // Update profile in database
    const profileResult = await updateUserProfile(userId, profileData);
    if (!profileResult.success) {
      throw new Error(profileResult.error || 'Failed to update profile settings');
    }
    
    // Update user metadata in Supabase Auth
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: settings.full_name,
        first_name: settings.first_name,
        last_name: settings.last_name,
        language: settings.language,
        timezone: settings.timezone,
        notifications: settings.notifications,
        theme: settings.theme || 'light',
        preferences: settings.preferences,
      }
    });
    
    if (metadataError) throw new Error(`Error updating user metadata: ${metadataError.message}`);
    
    return {
      success: true,
      message: 'Settings updated successfully',
    };
  } catch (error: any) {
    logError(error, { action: 'updateUserSettings', userId });
    
    return {
      success: false,
      error: error.message || 'Failed to update settings',
    };
  }
}

/**
 * Updates a user's password in Supabase Auth
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
    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    const supabase = createClient();
    
    // Update user password using Supabase Auth API
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw new Error(`Error updating password: ${error.message}`);
    
    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error: any) {
    logError(error, { action: 'updateUserPassword' });
    
    return {
      success: false,
      error: error.message || 'Failed to update password',
    };
  }
}

/**
 * Uploads a profile picture for the user
 * 
 * This function handles the uploading of a profile picture to Supabase Storage
 * and updates the user's profile with the new avatar URL.
 * 
 * @param userId - The ID of the user to update
 * @param file - The profile picture file to upload
 * @returns An object indicating success or failure with a message and the new avatar URL
 */
export async function uploadProfilePicture(
  userId: string,
  file: File
) {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
    }
    
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 2MB.');
    }
    
    const supabase = createClient();
    
    // Upload the file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) throw new Error(`Error uploading file: ${uploadError.message}`);
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    // Update the user's profile with the new avatar URL
    const { success, error } = await updateUserProfile(userId, {
      avatar_url: urlData.publicUrl,
    });
    
    if (!success) {
      throw new Error(error || 'Failed to update profile with new avatar');
    }
    
    return {
      success: true,
      message: 'Profile picture uploaded successfully',
      avatarUrl: urlData.publicUrl,
    };
  } catch (error: any) {
    logError(error, { action: 'uploadProfilePicture', userId });
    
    return {
      success: false,
      error: error.message || 'Failed to upload profile picture',
      avatarUrl: null,
    };
  }
}

/**
 * Verifies a user's email address (for admin use)
 * 
 * This function allows admins to manually mark a user's email as verified.
 * 
 * @param userId - The ID of the user to verify
 * @returns An object indicating success or failure with a message
 */
export async function verifyUserEmail(userId: string) {
  try {
    const supabase = createClient();
    
    // Update the verified flag in the profile
    const { error } = await supabase
      .from('profiles')
      .update({ verified: true })
      .eq('id', userId);
    
    if (error) throw new Error(`Error verifying user: ${error.message}`);
    
    return {
      success: true,
      message: 'User verified successfully',
    };
  } catch (error: any) {
    logError(error, { action: 'verifyUserEmail', userId });
    
    return {
      success: false,
      error: error.message || 'Failed to verify user',
    };
  }
}

/**
 * Marks a user's onboarding as completed
 * 
 * @param userId - The ID of the user to mark as onboarded
 * @returns An object indicating success or failure with a message
 */
export async function completeUserOnboarding(userId: string) {
  try {
    const supabase = createClient();
    
    // Update the onboarding_completed flag in the profile
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);
    
    if (error) throw new Error(`Error completing onboarding: ${error.message}`);
    
    return {
      success: true,
      message: 'Onboarding completed successfully',
    };
  } catch (error: any) {
    logError(error, { action: 'completeUserOnboarding', userId });
    
    return {
      success: false,
      error: error.message || 'Failed to complete onboarding',
    };
  }
} 