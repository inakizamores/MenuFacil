'use server';

import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { ensureUUID, safeUUID } from '@/lib/utils';

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
      .eq('id', ensureUUID(id))
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
      .eq('category_id', ensureUUID(categoryId))
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
    
    // Generate a new UUID for the menu item
    const itemId = uuidv4();
    
    // Map from form field names to database field names if needed
    const categoryId = params.category_id || params.categoryId;
    // Ensure the category ID is a valid UUID
    const safeCategoryId = ensureUUID(categoryId);
    const isAvailable = params.is_available !== undefined ? params.is_available : params.isAvailable;
    
    // Prepare the menu item data
    const menuItemData: any = {
      id: itemId,
      name: params.name,
      description: params.description,
      price: params.price,
      is_available: isAvailable,
      is_popular: params.is_popular || false,
      preparation_time: params.preparation_time,
      nutrition_info: params.nutrition_info,
      category_id: safeCategoryId,
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
      const filePath = `menu-items/${itemId}/${fileName}`;
      
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
      .insert(menuItemData);
    
    if (error) {
      console.error('Error creating menu item:', error);
      return { error: error.message };
    }
    
    return { id: itemId, error: null };
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
    
    // Ensure the item ID is a valid UUID
    const itemId = ensureUUID(params.id);
    
    // Map from form field names to database field names if needed
    const categoryId = params.category_id;
    // If category ID is provided, ensure it's a valid UUID
    const safeCategoryId = categoryId ? ensureUUID(categoryId) : undefined;
    const isAvailable = params.is_available !== undefined ? params.is_available : params.isAvailable;
    
    // Prepare the menu item data
    const menuItemData: any = {
      name: params.name,
      description: params.description,
      price: params.price,
      is_available: isAvailable,
      updated_at: new Date().toISOString()
    };
    
    // Only include optional fields if they're provided
    if (params.is_popular !== undefined) menuItemData.is_popular = params.is_popular;
    if (params.preparation_time !== undefined) menuItemData.preparation_time = params.preparation_time;
    if (params.nutrition_info !== undefined) menuItemData.nutrition_info = params.nutrition_info;
    if (safeCategoryId) menuItemData.category_id = safeCategoryId;
    
    // Handle image updates if needed
    if (params.shouldUpdateImage) {
      if (params.image_url) {
        // If direct image URL is provided, use it
        menuItemData.image_url = params.image_url;
      } else if (params.image) {
        // Upload new image if provided
        const arrayBuffer = await params.image.arrayBuffer();
        
        // Generate a unique filename
        const fileExt = params.image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `menu-items/${itemId}/${fileName}`;
        
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
      } else {
        // If shouldUpdateImage is true but no image is provided, set to null (remove image)
        menuItemData.image_url = null;
      }
    }
    
    // Update the menu item in the database
    const { error } = await supabase
      .from('menu_items')
      .update(menuItemData)
      .eq('id', itemId);
    
    if (error) {
      console.error('Error updating menu item:', error);
      return { error: error.message };
    }
    
    return { id: itemId, error: null };
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
    
    // Ensure the item ID is a valid UUID
    const itemId = ensureUUID(id);
    
    // Delete the menu item from the database
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Error deleting menu item:', error);
      return { error: error.message };
    }
    
    // Clean up associated images
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('menu-images')
        .list(`menu-items/${itemId}`);
      
      if (!listError && files && files.length > 0) {
        // Delete all files in the item's directory
        const filePaths = files.map(file => `menu-items/${itemId}/${file.name}`);
        await supabase.storage
          .from('menu-images')
          .remove(filePaths);
      }
    } catch (storageError) {
      console.error('Error cleaning up item images:', storageError);
      // Continue even if image cleanup fails
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    return { error: 'Failed to delete menu item' };
  }
}

/**
 * Update the category for multiple menu items
 */
export async function updateItemCategories(itemUpdates: { itemId: string; categoryId: string }[]) {
  try {
    const supabase = await createServerClient();
    
    // Convert updates to use valid UUIDs
    const safeUpdates = itemUpdates.map(update => ({
      itemId: ensureUUID(update.itemId),
      categoryId: ensureUUID(update.categoryId)
    }));
    
    // Process each update
    const results = await Promise.all(
      safeUpdates.map(async ({ itemId, categoryId }) => {
        const { error } = await supabase
          .from('menu_items')
          .update({ category_id: categoryId, updated_at: new Date().toISOString() })
          .eq('id', itemId);
        
        return { itemId, success: !error, error: error?.message };
      })
    );
    
    // Check if any updates failed
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      return { 
        success: false, 
        error: `Failed to update ${failures.length} items`,
        failureDetails: failures
      };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateItemCategories:', error);
    return { success: false, error: 'Failed to update menu item categories' };
  }
}

/**
 * Update the sort order of items within a category
 */
export async function updateItemSortOrder(categoryId: string, itemIds: string[]) {
  try {
    const supabase = await createServerClient();
    
    // Ensure the category ID is a valid UUID
    const safeCategoryId = ensureUUID(categoryId);
    
    // Convert item IDs to safe UUIDs
    const safeItemIds = itemIds.map(id => ensureUUID(id));
    
    // Create updates with the new sort order
    const updates = safeItemIds.map((itemId, index) => ({
      id: itemId,
      sort_order: index * 10,
      updated_at: new Date().toISOString()
    }));
    
    // Update all items at once
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
    return { success: false, error: 'Failed to update menu item sort order' };
  }
} 