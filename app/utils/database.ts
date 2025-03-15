import { supabase, getServiceSupabase } from '../config/supabase';
import { Database } from './database.types';

// Restaurant functions
export const getRestaurants = async (userId: string) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getRestaurant = async (id: string) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createRestaurant = async (
  restaurant: Database['public']['Tables']['restaurants']['Insert']
) => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateRestaurant = async (
  id: string,
  restaurant: Database['public']['Tables']['restaurants']['Update']
) => {
  const { data, error } = await supabase
    .from('restaurants')
    .update(restaurant)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteRestaurant = async (id: string) => {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Menu functions
export const getMenus = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getMenu = async (id: string) => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createMenu = async (
  menu: Database['public']['Tables']['menus']['Insert']
) => {
  const { data, error } = await supabase
    .from('menus')
    .insert(menu)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateMenu = async (
  id: string,
  menu: Database['public']['Tables']['menus']['Update']
) => {
  const { data, error } = await supabase
    .from('menus')
    .update(menu)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteMenu = async (id: string) => {
  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Menu Category functions
export const getMenuCategories = async (menuId: string) => {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('menu_id', menuId)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getMenuCategory = async (id: string) => {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createMenuCategory = async (
  category: Database['public']['Tables']['menu_categories']['Insert']
) => {
  const { data, error } = await supabase
    .from('menu_categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateMenuCategory = async (
  id: string,
  category: Database['public']['Tables']['menu_categories']['Update']
) => {
  const { data, error } = await supabase
    .from('menu_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteMenuCategory = async (id: string) => {
  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Menu Item functions
export const getMenuItems = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_id', categoryId)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getMenuItem = async (id: string) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createMenuItem = async (
  item: Database['public']['Tables']['menu_items']['Insert']
) => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateMenuItem = async (
  id: string,
  item: Database['public']['Tables']['menu_items']['Update']
) => {
  const { data, error } = await supabase
    .from('menu_items')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteMenuItem = async (id: string) => {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Template functions
export const getTemplates = async () => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTemplate = async (id: string) => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Subscription functions
export const getSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, restaurants(*)')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getSubscription = async (id: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, restaurants(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createSubscription = async (
  subscription: Database['public']['Tables']['subscriptions']['Insert']
) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscription)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateSubscription = async (
  id: string,
  subscription: Database['public']['Tables']['subscriptions']['Update']
) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(subscription)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Translation functions
export const getTranslations = async (entityId: string, entityType: string, language: string) => {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('entity_id', entityId)
    .eq('entity_type', entityType)
    .eq('language', language);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createTranslation = async (
  translation: Database['public']['Tables']['translations']['Insert']
) => {
  const { data, error } = await supabase
    .from('translations')
    .insert(translation)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateTranslation = async (
  id: string,
  translation: Database['public']['Tables']['translations']['Update']
) => {
  const { data, error } = await supabase
    .from('translations')
    .update(translation)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteTranslation = async (id: string) => {
  const { error } = await supabase
    .from('translations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Employee functions
export const getEmployees = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profiles(*)')
    .eq('restaurant_id', restaurantId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getEmployee = async (id: string) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profiles(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createEmployee = async (
  employee: Database['public']['Tables']['employees']['Insert']
) => {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateEmployee = async (
  id: string,
  employee: Database['public']['Tables']['employees']['Update']
) => {
  const { data, error } = await supabase
    .from('employees')
    .update(employee)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteEmployee = async (id: string) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateProfile = async (
  userId: string,
  profile: Database['public']['Tables']['profiles']['Update']
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}; 