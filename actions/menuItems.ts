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
}

interface CreateMenuItemParams {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
  image?: File | null;
}

interface UpdateMenuItemParams {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  image?: File | null;
  shouldUpdateImage: boolean;
}

/**
 * Get a single menu item by ID
 */
export async function getMenuItem(id: string) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getMenuItem:', error);
    return null;
  }
}

/**
 * Get all menu items for a category
 */
export async function getCategoryItems(categoryId: string) {
  try {
    const supabase = createServerClient();
    
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
export async function createMenuItem({
  name,
  description,
  price,
  isAvailable,
  categoryId,
  image
}: CreateMenuItemParams) {
  try {
    const supabase = createServerClient();
    
    // Prepare the menu item data
    const menuItemData: any = {
      id: uuidv4(),
      name,
      description,
      price,
      isAvailable,
      categoryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Upload image if provided
    if (image) {
      // Convert File to ArrayBuffer for the Supabase storage API
      const arrayBuffer = await image.arrayBuffer();
      
      // Generate a unique filename
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `menu-items/${menuItemData.id}/${fileName}`;
      
      // Upload the image
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, arrayBuffer, {
          contentType: image.type,
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
      menuItemData.imageUrl = publicUrl;
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
export async function updateMenuItem({
  id,
  name,
  description,
  price,
  isAvailable,
  image,
  shouldUpdateImage
}: UpdateMenuItemParams) {
  try {
    const supabase = createServerClient();
    
    // Prepare the menu item data
    const menuItemData: any = {
      name,
      description,
      price,
      isAvailable,
      updatedAt: new Date().toISOString()
    };
    
    // Upload new image if provided
    if (shouldUpdateImage && image) {
      // Convert File to ArrayBuffer for the Supabase storage API
      const arrayBuffer = await image.arrayBuffer();
      
      // Generate a unique filename
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `menu-items/${id}/${fileName}`;
      
      // Upload the image
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, arrayBuffer, {
          contentType: image.type,
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
      menuItemData.imageUrl = publicUrl;
    }
    
    // Update the menu item in the database
    const { error } = await supabase
      .from('menu_items')
      .update(menuItemData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating menu item:', error);
      return { error: error.message };
    }
    
    return { id, error: null };
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
    const supabase = createServerClient();
    
    // First, delete any associated images from storage
    // Get the menu item to check if it has an image
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('imageUrl')
      .eq('id', id)
      .single();
    
    if (menuItem?.imageUrl) {
      // Extract the path from the URL
      const storageUrl = new URL(menuItem.imageUrl);
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