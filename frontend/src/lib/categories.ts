import { supabase } from './supabase';

export type Category = {
  id: string;
  menu_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const getCategories = async (menuId: string): Promise<{
  data: Category[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('menu_id', menuId)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching categories for menu ${menuId}:`, error);
    return { data: null, error: error as Error };
  }
};

export const getCategory = async (id: string): Promise<{
  data: Category | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const createCategory = async (category: Partial<Category>): Promise<{
  data: Category | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating category:', error);
    return { data: null, error: error as Error };
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<{
  data: Category | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const deleteCategory = async (id: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    return { success: false, error: error as Error };
  }
}; 