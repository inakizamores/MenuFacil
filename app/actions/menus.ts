'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

interface CreateMenuParams {
  restaurant_id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  is_default?: boolean;
  template_id?: string | null;
  custom_css?: string | null;
}

/**
 * Get a specific menu by ID
 */
export async function getMenu(menuId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .single();

    if (error) {
      console.error('Error getting menu:', error);
      throw new Error(`Failed to get menu: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error in getMenu:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Get all menus for a restaurant
 */
export async function getRestaurantMenus(restaurantId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting restaurant menus:', error);
      throw new Error(`Failed to get restaurant menus: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getRestaurantMenus:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Create a new menu
 */
export async function createMenu(data: CreateMenuParams) {
  try {
    const supabase = await createServerClient();
    
    const menu = {
      id: uuidv4(),
      restaurant_id: data.restaurant_id,
      name: data.name,
      description: data.description || null,
      is_published: false,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_default: data.is_default !== undefined ? data.is_default : false,
      template_id: data.template_id || null,
      custom_css: data.custom_css || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('menus')
      .insert(menu)
      .select()
      .single();

    if (error) {
      console.error('Error creating menu:', error);
      throw new Error(`Failed to create menu: ${error.message}`);
    }

    // Handle setting this menu as default if requested
    if (data.is_default) {
      await setDefaultMenu(data.restaurant_id, menu.id);
    }

    revalidatePath(`/dashboard/restaurants/${data.restaurant_id}/menus`);
    return result;
  } catch (error: any) {
    console.error('Error in createMenu:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Update an existing menu
 */
export async function updateMenu(
  menuId: string,
  restaurantId: string,
  updates: Partial<CreateMenuParams>
) {
  try {
    const supabase = await createServerClient();
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('menus')
      .update(updateData)
      .eq('id', menuId);

    if (error) {
      console.error('Error updating menu:', error);
      throw new Error(`Failed to update menu: ${error.message}`);
    }

    // Handle setting this menu as default if requested
    if (updates.is_default) {
      await setDefaultMenu(restaurantId, menuId);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus`);
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`);
    return true;
  } catch (error: any) {
    console.error('Error in updateMenu:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Delete a menu
 */
export async function deleteMenu(menuId: string, restaurantId: string) {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (error) {
      console.error('Error deleting menu:', error);
      throw new Error(`Failed to delete menu: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus`);
    return true;
  } catch (error: any) {
    console.error('Error in deleteMenu:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Publish a menu
 */
export async function publishMenu(menuId: string, restaurantId: string) {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('menus')
      .update({
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', menuId);

    if (error) {
      console.error('Error publishing menu:', error);
      throw new Error(`Failed to publish menu: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`);
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/publish`);
    revalidatePath(`/menus/${menuId}`);
    return true;
  } catch (error: any) {
    console.error('Error in publishMenu:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Unpublish a menu
 */
export async function unpublishMenu(menuId: string, restaurantId: string) {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('menus')
      .update({
        is_published: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', menuId);

    if (error) {
      console.error('Error unpublishing menu:', error);
      throw new Error(`Failed to unpublish menu: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`);
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/publish`);
    revalidatePath(`/menus/${menuId}`);
    return true;
  } catch (error: any) {
    console.error('Error in unpublishMenu:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Set a menu as the default for a restaurant
 */
async function setDefaultMenu(restaurantId: string, menuId: string) {
  try {
    const supabase = await createServerClient();
    
    // First, clear default flag from all menus
    await supabase
      .from('menus')
      .update({ is_default: false })
      .eq('restaurant_id', restaurantId);
    
    // Then set the specified menu as default
    await supabase
      .from('menus')
      .update({ is_default: true })
      .eq('id', menuId);
    
    return true;
  } catch (error: any) {
    console.error('Error in setDefaultMenu:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
} 