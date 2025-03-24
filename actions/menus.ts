'use server';

import { createServerClient } from '@/lib/supabase/server';
import { Menu } from '@/app/types/database';
import { revalidatePath } from 'next/cache';
import { ensureUUID, safeUUID } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMenuParams {
  restaurantId: string;
  name: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  templateId?: string;
  customCss?: string;
}

export interface UpdateMenuParams extends Partial<CreateMenuParams> {
  id: string;
}

export interface PublishMenuParams {
  id: string;
  version?: string;
  publishNotes?: string;
}

/**
 * Get a single menu by ID
 */
export async function getMenu(id: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', ensureUUID(id))
      .single();
    
    if (error) {
      console.error('Error fetching menu:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getMenu:', error);
    return { data: null, error: 'Failed to fetch menu' };
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
      .eq('restaurant_id', ensureUUID(restaurantId))
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching restaurant menus:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getRestaurantMenus:', error);
    return { data: null, error: 'Failed to fetch restaurant menus' };
  }
}

/**
 * Create a new menu
 */
export async function createMenu(params: CreateMenuParams) {
  try {
    const supabase = await createServerClient();
    
    // Generate menu ID
    const menuId = uuidv4();
    
    // Ensure restaurant ID is a valid UUID
    const restaurantId = ensureUUID(params.restaurantId);
    
    // Generate a unique slug for the menu
    const slug = `${params.name.toLowerCase().replace(/\s+/g, '-')}-${menuId.slice(0, 8)}`;
    
    const menuData = {
      id: menuId,
      restaurant_id: restaurantId,
      name: params.name,
      description: params.description || null,
      is_active: params.isActive !== undefined ? params.isActive : true,
      is_default: params.isDefault !== undefined ? params.isDefault : false,
      is_published: false,
      template_id: params.templateId || null,
      custom_css: params.customCss || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slug: slug
    };
    
    const { data, error } = await supabase
      .from('menus')
      .insert(menuData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating menu:', error);
      return { data: null, error: error.message };
    }
    
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus`);
    return { data, error: null };
  } catch (error) {
    console.error('Error in createMenu:', error);
    return { data: null, error: 'Failed to create menu' };
  }
}

/**
 * Update an existing menu
 */
export async function updateMenu(params: UpdateMenuParams) {
  try {
    const supabase = await createServerClient();
    
    // Ensure menu ID is a valid UUID
    const menuId = ensureUUID(params.id);
    
    // Get the current menu to access its restaurant_id
    const { data: currentMenu } = await supabase
      .from('menus')
      .select('restaurant_id')
      .eq('id', menuId)
      .single();
    
    if (!currentMenu) {
      return { success: false, error: 'Menu not found' };
    }
    
    const restaurantId = currentMenu.restaurant_id;
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.isActive !== undefined) updateData.is_active = params.isActive;
    if (params.isDefault !== undefined) updateData.is_default = params.isDefault;
    if (params.templateId !== undefined) updateData.template_id = params.templateId;
    if (params.customCss !== undefined) updateData.custom_css = params.customCss;
    
    const { error } = await supabase
      .from('menus')
      .update(updateData)
      .eq('id', menuId);
    
    if (error) {
      console.error('Error updating menu:', error);
      return { success: false, error: error.message };
    }
    
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`);
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateMenu:', error);
    return { success: false, error: 'Failed to update menu' };
  }
}

/**
 * Delete a menu
 */
export async function deleteMenu(id: string) {
  try {
    const supabase = await createServerClient();
    
    // Ensure menu ID is a valid UUID
    const menuId = ensureUUID(id);
    
    // Get the menu's restaurant_id before deleting
    const { data: menu } = await supabase
      .from('menus')
      .select('restaurant_id')
      .eq('id', menuId)
      .single();
    
    if (!menu) {
      return { success: false, error: 'Menu not found' };
    }
    
    const restaurantId = menu.restaurant_id;
    
    // Delete the menu
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);
    
    if (error) {
      console.error('Error deleting menu:', error);
      return { success: false, error: error.message };
    }
    
    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteMenu:', error);
    return { success: false, error: 'Failed to delete menu' };
  }
}

/**
 * Publish a menu
 * 
 * Makes a menu visible to the public by setting is_published to true
 * and updating the last_published_at timestamp. After publishing,
 * related pages are revalidated to reflect the changes.
 * 
 * @param {PublishMenuParams} params - Object containing menu ID and optional publishing metadata
 * @returns {Promise<{ success: boolean; error?: string; version?: string; publishDate?: string }>}
 */
export async function publishMenu(params: PublishMenuParams) {
  try {
    const supabase = await createServerClient();
    
    // First, get the current menu
    const { data: menu, error: fetchError } = await supabase
      .from('menus')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching menu:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!menu) {
      return { success: false, error: 'Menu not found' };
    }
    
    // Generate version if not provided
    const version = params.version || new Date().toISOString().split('T')[0] + '-' + Math.floor(Math.random() * 1000);
    
    // Create a published version record
    const publishData = {
      menu_id: params.id,
      version: version,
      publish_date: new Date().toISOString(),
      notes: params.publishNotes || '',
      published_by: 'current-user', // This should be replaced with the actual user ID
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: publishError } = await supabase
      .from('menu_published_versions')
      .insert([publishData]);
    
    if (publishError) {
      console.error('Error creating published version:', publishError);
      return { success: false, error: publishError.message };
    }
    
    // Update the menu to mark it as published
    const { error: updateError } = await supabase
      .from('menus')
      .update({
        is_active: true,
        is_published: true,
        last_published_at: publishData.publish_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);
    
    if (updateError) {
      console.error('Error updating menu:', updateError);
      return { success: false, error: updateError.message };
    }
    
    // Revalidate the menu pages
    revalidatePath(`/dashboard/restaurants/[restaurantId]/menus/${params.id}`);
    revalidatePath(`/r/[restaurantId]/menu/${params.id}`);
    
    return { 
      success: true, 
      version: version,
      publishDate: publishData.publish_date,
      error: null
    };
  } catch (error) {
    console.error('Error in publishMenu:', error);
    return { success: false, error: 'Failed to publish menu' };
  }
}

/**
 * Unpublish a menu
 * 
 * Hides a menu from the public by setting is_published to false.
 * The menu remains available in the dashboard but is no longer
 * accessible through public URLs. After unpublishing,
 * related pages are revalidated to reflect the changes.
 * 
 * @param {string} id - The ID of the menu to unpublish
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function unpublishMenu(id: string) {
  try {
    const supabase = await createServerClient();
    
    // Update the menu to mark it as unpublished
    const { error } = await supabase
      .from('menus')
      .update({
        is_published: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error unpublishing menu:', error);
      return { success: false, error: error.message };
    }
    
    // Revalidate the menu pages
    revalidatePath(`/dashboard/restaurants/[restaurantId]/menus/${id}`);
    revalidatePath(`/r/[restaurantId]/menu/${id}`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in unpublishMenu:', error);
    return { success: false, error: 'Failed to unpublish menu' };
  }
}

/**
 * Duplicate a menu with all its categories and items
 */
export async function duplicateMenu(id: string, newName: string) {
  try {
    const supabase = await createServerClient();
    
    // Get the original menu
    const { data: originalMenu, error: menuError } = await supabase
      .from('menus')
      .select('*')
      .eq('id', id)
      .single();
    
    if (menuError || !originalMenu) {
      console.error('Error fetching original menu:', menuError);
      return { success: false, error: menuError?.message || 'Menu not found' };
    }
    
    // Create a new menu based on the original
    const newMenuId = crypto.randomUUID();
    const newMenu = {
      ...originalMenu,
      id: newMenuId,
      name: newName,
      is_active: false,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_published_version: null,
      last_published_at: null
    };
    
    const { error: insertMenuError } = await supabase
      .from('menus')
      .insert([newMenu]);
    
    if (insertMenuError) {
      console.error('Error creating new menu:', insertMenuError);
      return { success: false, error: insertMenuError.message };
    }
    
    // Get all categories from the original menu
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('menu_id', id);
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return { success: false, error: categoriesError.message };
    }
    
    // Create a mapping of old to new category IDs
    const categoryIdMap = new Map();
    
    // Create new categories for the new menu
    if (categories && categories.length > 0) {
      const newCategories = categories.map(category => {
        const newCategoryId = crypto.randomUUID();
        categoryIdMap.set(category.id, newCategoryId);
        
        return {
          ...category,
          id: newCategoryId,
          menu_id: newMenuId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
      
      const { error: insertCategoriesError } = await supabase
        .from('menu_categories')
        .insert(newCategories);
      
      if (insertCategoriesError) {
        console.error('Error creating new categories:', insertCategoriesError);
        return { success: false, error: insertCategoriesError.message };
      }
      
      // For each original category, get its items
      for (const category of categories) {
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('category_id', category.id);
        
        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          continue; // Continue with other categories even if one fails
        }
        
        if (items && items.length > 0) {
          const newItems = items.map(item => {
            const newItemId = crypto.randomUUID();
            
            return {
              ...item,
              id: newItemId,
              category_id: categoryIdMap.get(category.id),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          });
          
          const { error: insertItemsError } = await supabase
            .from('menu_items')
            .insert(newItems);
          
          if (insertItemsError) {
            console.error('Error creating new items:', insertItemsError);
            continue; // Continue with other categories even if one fails
          }
          
          // TODO: Copy variants for each item if needed
        }
      }
    }
    
    return { 
      success: true, 
      newMenuId, 
      error: null 
    };
  } catch (error) {
    console.error('Error in duplicateMenu:', error);
    return { success: false, error: 'Failed to duplicate menu' };
  }
} 