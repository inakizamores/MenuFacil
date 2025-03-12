import { supabase } from './supabase';

export type Menu = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export const getMenus = async (restaurantId: string): Promise<{
  data: Menu[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching menus for restaurant ${restaurantId}:`, error);
    return { data: null, error: error as Error };
  }
};

export const getMenu = async (id: string): Promise<{
  data: Menu | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching menu ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const createMenu = async (menu: Partial<Menu>): Promise<{
  data: Menu | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('menus')
      .insert([menu])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating menu:', error);
    return { data: null, error: error as Error };
  }
};

export const updateMenu = async (id: string, updates: Partial<Menu>): Promise<{
  data: Menu | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('menus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating menu ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const deleteMenu = async (id: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting menu ${id}:`, error);
    return { success: false, error: error as Error };
  }
}; 