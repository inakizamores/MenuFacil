import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  menuId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryParams {
  name: string;
  description?: string;
  menuId: string;
  order?: number;
}

interface UpdateCategoryParams {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCategory:', error);
    return null;
  }
}

/**
 * Get all categories for a menu
 */
export async function getMenuCategories(menuId: string) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('menuId', menuId)
      .order('order', { ascending: true })
      .order('name');
    
    if (error) {
      console.error('Error fetching menu categories:', error);
      return { categories: [], error: error.message };
    }
    
    return { categories: data || [], error: null };
  } catch (error) {
    console.error('Error in getMenuCategories:', error);
    return { categories: [], error: 'Failed to load menu categories' };
  }
}

/**
 * Create a new category
 */
export async function createCategory({
  name,
  description = '',
  menuId,
  order
}: CreateCategoryParams) {
  try {
    const supabase = createServerClient();
    
    // If order not provided, get the highest order value and increment by 10
    let categoryOrder = order;
    if (categoryOrder === undefined) {
      const { data } = await supabase
        .from('menu_categories')
        .select('order')
        .eq('menuId', menuId)
        .order('order', { ascending: false })
        .limit(1);
      
      categoryOrder = data && data.length > 0 ? data[0].order + 10 : 0;
    }
    
    const categoryData = {
      id: uuidv4(),
      name,
      description,
      menuId,
      order: categoryOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('menu_categories')
      .insert([categoryData]);
    
    if (error) {
      console.error('Error creating category:', error);
      return { error: error.message };
    }
    
    return { id: categoryData.id, error: null };
  } catch (error) {
    console.error('Error in createCategory:', error);
    return { error: 'Failed to create category' };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory({
  id,
  name,
  description = '',
  order
}: UpdateCategoryParams) {
  try {
    const supabase = createServerClient();
    
    const categoryData: any = {
      name,
      description,
      updatedAt: new Date().toISOString()
    };
    
    if (order !== undefined) {
      categoryData.order = order;
    }
    
    const { error } = await supabase
      .from('menu_categories')
      .update(categoryData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating category:', error);
      return { error: error.message };
    }
    
    return { id, error: null };
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return { error: 'Failed to update category' };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  try {
    const supabase = createServerClient();
    
    // First, check if the category has any menu items
    const { data: itemCount, error: countError } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact' })
      .eq('categoryId', id);
    
    if (countError) {
      console.error('Error checking menu items:', countError);
      return { error: 'Failed to check if category has menu items' };
    }
    
    if (itemCount && itemCount.length > 0) {
      return { error: 'Cannot delete category with menu items. Please remove all items first.' };
    }
    
    // Now delete the category
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      return { error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return { error: 'Failed to delete category' };
  }
}

/**
 * Reorder categories
 */
export async function reorderCategories(categories: { id: string, order: number }[]) {
  try {
    const supabase = createServerClient();
    
    // Use a transaction to update all categories at once
    const updates = categories.map(cat => ({
      id: cat.id,
      order: cat.order,
      updatedAt: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('menu_categories')
      .upsert(updates);
    
    if (error) {
      console.error('Error reordering categories:', error);
      return { error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in reorderCategories:', error);
    return { error: 'Failed to reorder categories' };
  }
} 