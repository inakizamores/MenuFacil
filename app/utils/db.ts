import { supabase } from '../config/supabase';
import {
  Profile,
  Restaurant,
  Menu,
  MenuCategory,
  MenuItem,
  RestaurantMember,
  TeamRole,
  QRCode
} from '../types/database';

// ===== PROFILES =====
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

export async function updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  
  return data;
}

// ===== RESTAURANTS =====
export async function getRestaurant(restaurantId: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();
  
  if (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
  
  return data;
}

export async function getUserRestaurants(userId: string): Promise<Restaurant[] | null> {
  // First get restaurants where user is the owner
  const { data: ownedRestaurants, error: ownedError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_active', true);
  
  if (ownedError) {
    console.error('Error fetching owned restaurants:', ownedError);
    return null;
  }
  
  // Then get restaurants where user is a team member
  const { data: memberRestaurants, error: memberError } = await supabase
    .from('restaurant_members')
    .select('restaurant_id')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (memberError) {
    console.error('Error fetching member restaurants:', memberError);
    return null;
  }
  
  // If user is not a member of any restaurants, return owned restaurants
  if (!memberRestaurants.length) {
    return ownedRestaurants;
  }
  
  // Get full restaurant data for member restaurants
  const memberRestaurantIds = memberRestaurants.map(r => r.restaurant_id);
  const { data: memberRestaurantData, error: memberDataError } = await supabase
    .from('restaurants')
    .select('*')
    .in('id', memberRestaurantIds)
    .eq('is_active', true);
  
  if (memberDataError) {
    console.error('Error fetching member restaurant data:', memberDataError);
    return ownedRestaurants; // Return only owned restaurants if error
  }
  
  // Combine owned and member restaurants, removing duplicates
  const allRestaurants = [...ownedRestaurants];
  for (const restaurant of memberRestaurantData) {
    if (!allRestaurants.some(r => r.id === restaurant.id)) {
      allRestaurants.push(restaurant);
    }
  }
  
  return allRestaurants;
}

export async function createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurantData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating restaurant:', error);
    return null;
  }
  
  return data;
}

export async function updateRestaurant(restaurantId: string, restaurantData: Partial<Restaurant>): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .update(restaurantData)
    .eq('id', restaurantId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating restaurant:', error);
    return null;
  }
  
  return data;
}

export async function deleteRestaurant(restaurantId: string): Promise<boolean> {
  // We could do a hard delete, but it's safer to just mark as inactive
  const { error } = await supabase
    .from('restaurants')
    .update({ is_active: false })
    .eq('id', restaurantId);
  
  if (error) {
    console.error('Error deleting restaurant:', error);
    return false;
  }
  
  return true;
}

// ===== TEAM MEMBERS =====
export async function getTeamMembers(restaurantId: string): Promise<RestaurantMember[] | null> {
  const { data, error } = await supabase
    .from('restaurant_members')
    .select('*, profiles:user_id(id, full_name, avatar_url)')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching team members:', error);
    return null;
  }
  
  return data;
}

export async function addTeamMember(restaurantId: string, userId: string, role: TeamRole): Promise<RestaurantMember | null> {
  const { data, error } = await supabase
    .from('restaurant_members')
    .insert({
      restaurant_id: restaurantId,
      user_id: userId,
      role
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding team member:', error);
    return null;
  }
  
  return data;
}

export async function updateTeamMember(restaurantId: string, userId: string, role: TeamRole): Promise<RestaurantMember | null> {
  const { data, error } = await supabase
    .from('restaurant_members')
    .update({ role })
    .eq('restaurant_id', restaurantId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating team member:', error);
    return null;
  }
  
  return data;
}

export async function removeTeamMember(restaurantId: string, userId: string): Promise<boolean> {
  // We could do a hard delete, but we'll just mark as inactive
  const { error } = await supabase
    .from('restaurant_members')
    .update({ is_active: false })
    .eq('restaurant_id', restaurantId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error removing team member:', error);
    return false;
  }
  
  return true;
}

// ===== MENUS =====
export async function getRestaurantMenus(restaurantId: string): Promise<Menu[] | null> {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching menus:', error);
    return null;
  }
  
  return data;
}

export async function getMenu(menuId: string): Promise<Menu | null> {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('id', menuId)
    .single();
  
  if (error) {
    console.error('Error fetching menu:', error);
    return null;
  }
  
  return data;
}

export async function createMenu(menuData: Omit<Menu, 'id' | 'created_at' | 'updated_at'>): Promise<Menu | null> {
  // If this is set as default, unset other default menus for this restaurant
  if (menuData.is_default) {
    await supabase
      .from('menus')
      .update({ is_default: false })
      .eq('restaurant_id', menuData.restaurant_id)
      .eq('is_default', true);
  }
  
  const { data, error } = await supabase
    .from('menus')
    .insert(menuData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating menu:', error);
    return null;
  }
  
  return data;
}

export async function updateMenu(menuId: string, menuData: Partial<Menu>): Promise<Menu | null> {
  // If this is set as default, unset other default menus for this restaurant
  if (menuData.is_default) {
    const { data: menuInfo } = await supabase
      .from('menus')
      .select('restaurant_id')
      .eq('id', menuId)
      .single();
    
    if (menuInfo) {
      await supabase
        .from('menus')
        .update({ is_default: false })
        .eq('restaurant_id', menuInfo.restaurant_id)
        .eq('is_default', true)
        .neq('id', menuId);
    }
  }
  
  const { data, error } = await supabase
    .from('menus')
    .update(menuData)
    .eq('id', menuId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating menu:', error);
    return null;
  }
  
  return data;
}

export async function deleteMenu(menuId: string): Promise<boolean> {
  // We could do a hard delete, but we'll just mark as inactive
  const { error } = await supabase
    .from('menus')
    .update({ is_active: false })
    .eq('id', menuId);
  
  if (error) {
    console.error('Error deleting menu:', error);
    return false;
  }
  
  return true;
}

// ===== MENU CATEGORIES =====
export async function getMenuCategories(menuId: string): Promise<MenuCategory[] | null> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('menu_id', menuId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching menu categories:', error);
    return null;
  }
  
  return data;
}

export async function getCategory(categoryId: string): Promise<MenuCategory | null> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('id', categoryId)
    .single();
  
  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  
  return data;
}

export async function createCategory(categoryData: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory | null> {
  const { data, error } = await supabase
    .from('menu_categories')
    .insert(categoryData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating category:', error);
    return null;
  }
  
  return data;
}

export async function updateCategory(categoryId: string, categoryData: Partial<MenuCategory>): Promise<MenuCategory | null> {
  const { data, error } = await supabase
    .from('menu_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating category:', error);
    return null;
  }
  
  return data;
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  // We could do a hard delete, but we'll just mark as inactive
  const { error } = await supabase
    .from('menu_categories')
    .update({ is_active: false })
    .eq('id', categoryId);
  
  if (error) {
    console.error('Error deleting category:', error);
    return false;
  }
  
  return true;
}

// ===== MENU ITEMS =====
export async function getCategoryItems(categoryId: string): Promise<MenuItem[] | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching menu items:', error);
    return null;
  }
  
  return data;
}

export async function getMenuItem(itemId: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();
  
  if (error) {
    console.error('Error fetching menu item:', error);
    return null;
  }
  
  return data;
}

export async function createMenuItem(itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(itemData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating menu item:', error);
    return null;
  }
  
  return data;
}

export async function updateMenuItem(itemId: string, itemData: Partial<MenuItem>): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(itemData)
    .eq('id', itemId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating menu item:', error);
    return null;
  }
  
  return data;
}

export async function deleteMenuItem(itemId: string): Promise<boolean> {
  // We could do a hard delete, but we'll just mark as inactive
  const { error } = await supabase
    .from('menu_items')
    .update({ is_active: false })
    .eq('id', itemId);
  
  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
  
  return true;
}

// ===== COMPLETE MENU DATA =====
export async function getCompleteMenu(menuId: string): Promise<{
  menu: Menu | null;
  categories: (MenuCategory & { items: MenuItem[] })[] | null;
}> {
  // First get the menu
  const menu = await getMenu(menuId);
  if (!menu) {
    return { menu: null, categories: null };
  }
  
  // Then get categories
  const categories = await getMenuCategories(menuId);
  if (!categories) {
    return { menu, categories: null };
  }
  
  // Then get items for each category
  const categoriesWithItems = await Promise.all(categories.map(async (category) => {
    const items = await getCategoryItems(category.id as unknown as string);
    return {
      ...category,
      items: items || []
    };
  }));
  
  return {
    menu,
    categories: categoriesWithItems
  };
}

// ===== QR CODES =====
export async function createQRCode(qrCodeData: Omit<QRCode, 'id' | 'created_at' | 'updated_at' | 'unique_views' | 'total_views'>): Promise<QRCode | null> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        ...qrCodeData,
        unique_views: 0,
        total_views: 0,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating QR code:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception creating QR code:', err);
    return null;
  }
}

export async function getQRCodes(restaurantId: string): Promise<QRCode[] | null> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching QR codes:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching QR codes:', err);
    return null;
  }
}

export async function getMenuQRCodes(menuId: string): Promise<QRCode[] | null> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('menu_id', menuId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching menu QR codes:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching menu QR codes:', err);
    return null;
  }
}

export async function getQRCode(qrCodeId: string): Promise<QRCode | null> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .single();
      
    if (error) {
      console.error('Error fetching QR code:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching QR code:', err);
    return null;
  }
}

export async function updateQRCode(qrCodeId: string, qrCodeData: Partial<QRCode>): Promise<QRCode | null> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        ...qrCodeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', qrCodeId)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating QR code:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception updating QR code:', err);
    return null;
  }
}

export async function deleteQRCode(qrCodeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', qrCodeId);
      
    if (error) {
      console.error('Error deleting QR code:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception deleting QR code:', err);
    return false;
  }
}

export async function incrementQRCodeViews(qrCodeId: string): Promise<boolean> {
  try {
    // Get current view counts
    const { data: qrCode, error: fetchError } = await supabase
      .from('qr_codes')
      .select('unique_views, total_views')
      .eq('id', qrCodeId)
      .single();
      
    if (fetchError || !qrCode) {
      console.error('Error fetching QR code for view increment:', fetchError);
      return false;
    }
    
    // Update the views
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({
        total_views: qrCode.total_views + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', qrCodeId);
      
    if (updateError) {
      console.error('Error incrementing QR code views:', updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in incrementQRCodeViews:', err);
    return false;
  }
} 