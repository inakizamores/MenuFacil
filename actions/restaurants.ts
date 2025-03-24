'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { ensureUUID, safeUUID } from '@/lib/utils';

interface CreateRestaurantParams {
  name: string;
  description?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  owner_id: string;
  logo_url?: string | null;
  social_media?: Record<string, string> | null;
  business_hours?: Record<string, string> | null;
  is_active?: boolean;
}

/**
 * Get all restaurants for a user
 */
export async function getUserRestaurants(userId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ensureUUID(userId))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user restaurants:', error);
      throw new Error(`Failed to get restaurants: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getUserRestaurants:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Get a specific restaurant by ID
 */
export async function getRestaurant(restaurantId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', ensureUUID(restaurantId))
      .single();

    if (error) {
      console.error('Error getting restaurant:', error);
      throw new Error(`Failed to get restaurant: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error in getRestaurant:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Create a new restaurant
 */
export async function createRestaurant(data: CreateRestaurantParams) {
  try {
    const supabase = await createServerClient();
    
    // Generate a new UUID for the restaurant
    const restaurantId = uuidv4();
    
    // Ensure the owner_id is a valid UUID
    const ownerId = ensureUUID(data.owner_id);
    
    const restaurant = {
      id: restaurantId,
      name: data.name,
      description: data.description || null,
      primary_color: data.primary_color || '#4F46E5',
      secondary_color: data.secondary_color || '#818CF8',
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      postal_code: data.postal_code || null,
      country: data.country || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      owner_id: ownerId,
      logo_url: data.logo_url || null,
      social_media: data.social_media || null,
      business_hours: data.business_hours || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('restaurants')
      .insert(restaurant)
      .select()
      .single();

    if (error) {
      console.error('Error creating restaurant:', error);
      throw new Error(`Failed to create restaurant: ${error.message}`);
    }

    revalidatePath('/dashboard/restaurants');
    return result;
  } catch (error: any) {
    console.error('Error in createRestaurant:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Update an existing restaurant
 */
export async function updateRestaurant(
  restaurantId: string, 
  updates: Partial<Omit<CreateRestaurantParams, 'owner_id'>>
) {
  try {
    const supabase = await createServerClient();
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', ensureUUID(restaurantId));

    if (error) {
      console.error('Error updating restaurant:', error);
      throw new Error(`Failed to update restaurant: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}`);
    revalidatePath('/dashboard/restaurants');
    return true;
  } catch (error: any) {
    console.error('Error in updateRestaurant:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Delete a restaurant
 */
export async function deleteRestaurant(restaurantId: string) {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', ensureUUID(restaurantId));

    if (error) {
      console.error('Error deleting restaurant:', error);
      throw new Error(`Failed to delete restaurant: ${error.message}`);
    }

    revalidatePath('/dashboard/restaurants');
    return true;
  } catch (error: any) {
    console.error('Error in deleteRestaurant:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
} 