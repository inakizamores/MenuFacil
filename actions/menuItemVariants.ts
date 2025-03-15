'use server';

import { createServerClient } from '@/lib/supabase/server';
import { MenuItemVariant } from '@/app/types/database';

/**
 * Get variants for a specific menu item
 */
export async function getItemVariants(itemId: string): Promise<{ 
  data: MenuItemVariant[] | null; 
  error: string | null 
}> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('menu_item_variants')
      .select('*')
      .eq('item_id', itemId)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching menu item variants:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getItemVariants:', error);
    return { data: null, error: 'Failed to load variants' };
  }
}

/**
 * Save variants for a menu item (create, update, or delete as needed)
 */
export async function saveItemVariants(
  itemId: string,
  variants: Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'>[]
): Promise<{ 
  success: boolean; 
  error: string | null 
}> {
  try {
    const supabase = await createServerClient();
    
    // First, fetch existing variants to determine what to create/update/delete
    const { data: existingVariants, error: fetchError } = await supabase
      .from('menu_item_variants')
      .select('id')
      .eq('item_id', itemId);
    
    if (fetchError) {
      console.error('Error fetching existing variants:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // Delete all existing variants for this item
    // This is simpler than trying to update existing ones and delete removed ones
    const { error: deleteError } = await supabase
      .from('menu_item_variants')
      .delete()
      .eq('item_id', itemId);
    
    if (deleteError) {
      console.error('Error deleting existing variants:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    // If there are no new variants to create, we're done
    if (!variants || variants.length === 0) {
      return { success: true, error: null };
    }
    
    // Create all the new variants
    const timestamp = new Date().toISOString();
    const variantsToInsert = variants.map(variant => ({
      ...variant,
      created_at: timestamp,
      updated_at: timestamp
    }));
    
    const { error: insertError } = await supabase
      .from('menu_item_variants')
      .insert(variantsToInsert);
    
    if (insertError) {
      console.error('Error inserting variants:', insertError);
      return { success: false, error: insertError.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in saveItemVariants:', error);
    return { success: false, error: 'Failed to save variants' };
  }
} 