'use server';

import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  is_available?: boolean;
  is_popular?: boolean;
  preparation_time?: number;
  nutrition_info?: string;
  image_url?: string;
  category_id?: string;
}

interface CreateMenuItemParams {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
  image?: File | null;
  is_available?: boolean;
  is_popular?: boolean;
  preparation_time?: number;
  nutrition_info?: string | null;
  image_url?: string;
  category_id?: string;
}

interface UpdateMenuItemParams {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  image?: File | null;
  shouldUpdateImage: boolean;
  is_available?: boolean;
  is_popular?: boolean;
  preparation_time?: number;
  nutrition_info?: string | null;
  image_url?: string;
  category_id?: string;
}

/**
 * Get a single menu item by ID
 */
export async function getMenuItem(id: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching menu item:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getMenuItem:', error);
    return { data: null, error: 'Failed to fetch menu item' };
  }
}

/**
 * Get all menu items for a category
 */
export async function getCategoryItems(categoryId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('categoryId', categoryId)
      .order('name');
    
    if (error) {
      console.error('Error fetching category items:', error);
      return { items: [], error: error.message };
    }
    
    return { items: data, error: null };
  } catch (error) {
    console.error('Error in getCategoryItems:', error);
    return { items: [], error: 'Failed to load menu items' };
  }
}

/**
 * Create a new menu item
 */
export async function createMenuItem(params: CreateMenuItemParams) {
  try {
    const supabase = await createServerClient();
    
    // Map from form field names to database field names if needed
    const categoryId = params.category_id || params.categoryId;
    const isAvailable = params.is_available !== undefined ? params.is_available : params.isAvailable;
    
    // Prepare the menu item data
    const menuItemData: any = {
      id: uuidv4(),
      name: params.name,
      description: params.description,
      price: params.price,
      is_available: isAvailable,
      is_popular: params.is_popular || false,
      preparation_time: params.preparation_time,
      nutrition_info: params.nutrition_info,
      category_id: categoryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // If image_url is provided directly, use it
    if (params.image_url) {
      menuItemData.image_url = params.image_url;
    }
    // Otherwise upload image if provided
    else if (params.image) {
      // Convert File to ArrayBuffer for the Supabase storage API
      const arrayBuffer = await params.image.arrayBuffer();
      
      // Generate a unique filename
      const fileExt = params.image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `menu-items/${menuItemData.id}/${fileName}`;
      
      // Upload the image
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, arrayBuffer, {
          contentType: params.image.type,
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { error: 'Failed to upload image' };
      }
      
      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);
      
      // Add the image URL to the menu item data
      menuItemData.image_url = publicUrl;
    }
    
    // Insert the menu item into the database
    const { error } = await supabase
      .from('menu_items')
      .insert([menuItemData]);
    
    if (error) {
      console.error('Error creating menu item:', error);
      return { error: error.message };
    }
    
    return { id: menuItemData.id, error: null };
  } catch (error) {
    console.error('Error in createMenuItem:', error);
    return { error: 'Failed to create menu item' };
  }
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(params: UpdateMenuItemParams) {
  try {
    const supabase = await createServerClient();
    
    // Map from form field names to database field names if needed
    const categoryId = params.category_id;
    const isAvailable = params.is_available !== undefined ? params.is_available : params.isAvailable;
    
    // Prepare the menu item data
    const menuItemData: any = {
      name: params.name,
      description: params.description,
      price: params.price,
      is_available: isAvailable,
      is_popular: params.is_popular || false,
      preparation_time: params.preparation_time,
      nutrition_info: params.nutrition_info,
      updated_at: new Date().toISOString()
    };
    
    // Only set category_id if it was provided
    if (categoryId) {
      menuItemData.category_id = categoryId;
    }
    
    // If image_url is provided directly, use it
    if (params.image_url) {
      menuItemData.image_url = params.image_url;
    }
    // Otherwise upload new image if provided and requested
    else if (params.shouldUpdateImage && params.image) {
      // Convert File to ArrayBuffer for the Supabase storage API
      const arrayBuffer = await params.image.arrayBuffer();
      
      // Generate a unique filename
      const fileExt = params.image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `menu-items/${params.id}/${fileName}`;
      
      // Upload the image
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, arrayBuffer, {
          contentType: params.image.type,
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { error: 'Failed to upload image' };
      }
      
      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);
      
      // Add the image URL to the menu item data
      menuItemData.image_url = publicUrl;
    }
    
    // Update the menu item in the database
    const { error } = await supabase
      .from('menu_items')
      .update(menuItemData)
      .eq('id', params.id);
    
    if (error) {
      console.error('Error updating menu item:', error);
      return { error: error.message };
    }
    
    return { id: params.id, error: null };
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    return { error: 'Failed to update menu item' };
  }
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string) {
  try {
    const supabase = await createServerClient();
    
    // First, delete any associated images from storage
    // Get the menu item to check if it has an image
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('image_url')
      .eq('id', id)
      .single();
    
    if (menuItem?.image_url) {
      // Extract the path from the URL
      const storageUrl = new URL(menuItem.image_url);
      const pathParts = storageUrl.pathname.split('/');
      const storagePath = pathParts.slice(2).join('/'); // Remove the first two parts
      
      // Delete the image from storage
      await supabase.storage
        .from('menu-images')
        .remove([storagePath]);
    }
    
    // Delete the menu item from the database
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting menu item:', error);
      return { error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    return { error: 'Failed to delete menu item' };
  }
}

/**
 * Update the category of multiple items
 */
export async function updateItemCategories(itemUpdates: { itemId: string; categoryId: string }[]) {
  try {
    const supabase = await createServerClient();
    
    // Use a transaction to update all items at once
    const updates = [];
    
    for (const update of itemUpdates) {
      updates.push({
        id: update.itemId,
        category_id: update.categoryId,
        updated_at: new Date().toISOString()
      });
    }
    
    const { error } = await supabase
      .from('menu_items')
      .upsert(updates);
    
    if (error) {
      console.error('Error updating item categories:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateItemCategories:', error);
    return { success: false, error: 'Failed to update item categories' };
  }
}

/**
 * Update the sort order of items within a category
 */
export async function updateItemSortOrder(categoryId: string, itemIds: string[]) {
  try {
    const supabase = await createServerClient();
    
    // Use a transaction to update all items at once
    const updates = itemIds.map((id, index) => ({
      id,
      sort_order: index * 10, // Space out the sort order for future insertions
      updated_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('menu_items')
      .upsert(updates);
    
    if (error) {
      console.error('Error updating item sort order:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateItemSortOrder:', error);
    return { success: false, error: 'Failed to update item sort order' };
  }
} 