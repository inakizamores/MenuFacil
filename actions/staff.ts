'use server';

import { createServerClient } from '@/lib/supabase/server';
import { StaffMemberCreationData } from '@/types/user-roles';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new staff member for a restaurant
 * This creates a new user with restaurant_staff role and links them to the specified restaurant
 * 
 * @param data Staff member data
 * @param ownerId The ID of the restaurant owner creating this staff
 */
export async function createStaffMember(data: StaffMemberCreationData, ownerId: string) {
  try {
    const supabase = await createServerClient();
    
    // First check if the restaurant belongs to the owner
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', data.restaurantId)
      .eq('owner_id', ownerId)
      .single();
    
    if (restaurantError || !restaurant) {
      return { 
        success: false, 
        error: 'You do not have permission to create staff for this restaurant' 
      };
    }
    
    // Generate a temporary password if not provided
    const password = data.password || `${uuidv4().substring(0, 8)}`;
    
    // Create the user in auth system
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: 'restaurant_staff'
      }
    });
    
    if (authError) {
      return { success: false, error: authError.message };
    }
    
    const userId = authData.user.id;
    
    // Create profile with staff role
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: data.full_name,
      role: 'restaurant_staff',
      parent_user_id: ownerId,
      linked_restaurant_id: data.restaurantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return { success: false, error: profileError.message };
    }
    
    // Add as restaurant member with viewer role
    const { error: memberError } = await supabase.from('restaurant_members').insert({
      restaurant_id: data.restaurantId,
      user_id: userId,
      role: 'viewer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (memberError) {
      return { success: false, error: memberError.message };
    }
    
    return { 
      success: true, 
      data: {
        id: userId,
        email: data.email,
        full_name: data.full_name,
        restaurantId: data.restaurantId
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create staff member' };
  }
}

/**
 * Get all staff members for a restaurant owner
 * 
 * @param ownerId The ID of the restaurant owner
 */
export async function getStaffMembers(ownerId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        avatar_url, 
        role, 
        linked_restaurant_id,
        restaurants:linked_restaurant_id (
          id, 
          name
        )
      `)
      .eq('parent_user_id', ownerId)
      .eq('role', 'restaurant_staff');
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch staff members' };
  }
}

/**
 * Delete a staff member
 * 
 * @param staffId The ID of the staff member to delete
 * @param ownerId The ID of the restaurant owner
 */
export async function deleteStaffMember(staffId: string, ownerId: string) {
  try {
    const supabase = await createServerClient();
    
    // First check if this staff member belongs to the owner
    const { data: staff, error: staffError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', staffId)
      .eq('parent_user_id', ownerId)
      .single();
    
    if (staffError || !staff) {
      return { 
        success: false, 
        error: 'You do not have permission to delete this staff member' 
      };
    }
    
    // Delete from auth system
    const { error: authError } = await supabase.auth.admin.deleteUser(staffId);
    
    if (authError) {
      return { success: false, error: authError.message };
    }
    
    // The profile will be automatically deleted due to CASCADE
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete staff member' };
  }
} 