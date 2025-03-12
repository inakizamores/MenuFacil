import { supabase } from './supabase';

export type Restaurant = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const getRestaurants = async (): Promise<{
  data: Restaurant[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return { data: null, error: error as Error };
  }
};

export const getRestaurant = async (id: string): Promise<{
  data: Restaurant | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching restaurant ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const createRestaurant = async (restaurant: Partial<Restaurant>): Promise<{
  data: Restaurant | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert([restaurant])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return { data: null, error: error as Error };
  }
};

export const updateRestaurant = async (id: string, updates: Partial<Restaurant>): Promise<{
  data: Restaurant | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating restaurant ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const deleteRestaurant = async (id: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting restaurant ${id}:`, error);
    return { success: false, error: error as Error };
  }
}; 