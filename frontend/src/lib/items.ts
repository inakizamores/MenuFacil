import { supabase } from './supabase';

export type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export const getItems = async (categoryId: string): Promise<{
  data: Item[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching items for category ${categoryId}:`, error);
    return { data: null, error: error as Error };
  }
};

export const getItem = async (id: string): Promise<{
  data: Item | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const createItem = async (item: Partial<Item>): Promise<{
  data: Item | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating item:', error);
    return { data: null, error: error as Error };
  }
};

export const updateItem = async (id: string, updates: Partial<Item>): Promise<{
  data: Item | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const toggleItemAvailability = async (id: string, isAvailable: boolean): Promise<{
  data: Item | null;
  error: Error | null;
}> => {
  return updateItem(id, { is_available: isAvailable });
};

export const deleteItem = async (id: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
    return { success: false, error: error as Error };
  }
};

export const uploadItemImage = async (file: File, restaurantId: string, itemId: string): Promise<{
  url: string | null;
  error: Error | null;
}> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${restaurantId}/${itemId}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('menu-items')
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from('menu-items')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading item image:', error);
    return { url: null, error: error as Error };
  }
}; 