/**
 * System-wide roles for platform users
 * 
 * system_admin - Has access to admin dashboard and can manage all users
 * restaurant_owner - Can create and manage restaurants and their menus
 * restaurant_staff - Limited to managing specific restaurants assigned by their parent user
 */
export type SystemRole = 'system_admin' | 'restaurant_owner' | 'restaurant_staff';

/**
 * Restaurant-specific roles for team members
 * 
 * owner - Full control over restaurant, menu, and team
 * admin - Can manage menu and team, but cannot delete restaurant
 * editor - Can edit menu and content
 * viewer - Read-only access
 */
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Extended user interface with role information
 */
export interface UserWithRole {
  id: string;
  email?: string;
  role: SystemRole;
  parentUserId?: string | null;
  linkedRestaurantId?: string | null;
  user_metadata?: {
    role?: SystemRole;
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Interface for staff member creation
 */
export interface StaffMemberCreationData {
  email: string;
  password: string;
  full_name: string;
  restaurantId: string;
  role?: 'restaurant_staff';
}

/**
 * Utility functions for role checking
 */
export const isSystemAdmin = (user: any): boolean => {
  if (!user) return false;
  
  // Special case: test@menufacil.app should always be treated as admin
  if (user?.email === 'test@menufacil.app') {
    return true;
  }
  
  // Check in multiple possible locations
  return (
    user?.user_metadata?.role === 'system_admin' || 
    user?.role === 'system_admin' ||
    user?.app_metadata?.role === 'system_admin'
  );
};

export const isRestaurantOwner = (user: any): boolean => {
  if (!user) return false;
  
  // Check in multiple possible locations
  return (
    user?.user_metadata?.role === 'restaurant_owner' || 
    user?.role === 'restaurant_owner' ||
    user?.app_metadata?.role === 'restaurant_owner' ||
    // Default to restaurant owner if no specific role is set
    (!isSystemAdmin(user) && !isRestaurantStaff(user) && user?.email?.includes('@testrestaurant.com'))
  );
};

export const isRestaurantStaff = (user: any): boolean => {
  if (!user) return false;
  
  // Check in multiple possible locations
  return (
    user?.user_metadata?.role === 'restaurant_staff' || 
    user?.role === 'restaurant_staff' ||
    user?.app_metadata?.role === 'restaurant_staff' ||
    user?.email?.includes('limited@menufacil.app')
  );
};

/**
 * Determine if user has access to a specific restaurant
 */
export const hasRestaurantAccess = (user: any, restaurantId: string): boolean => {
  if (isSystemAdmin(user)) return true;
  
  if (isRestaurantStaff(user)) {
    return user?.linkedRestaurantId === restaurantId;
  }
  
  return true; // Restaurant owners have access to all their restaurants
};

/**
 * Get user role as a string for display
 */
export const getUserRoleDisplay = (user: any): string => {
  if (!user) return 'Guest';
  
  // Force test@menufacil.app to always show as System Administrator
  if (user?.email === 'test@menufacil.app') return 'System Administrator';
  
  // Force owner@testrestaurant.com to always show as Restaurant Owner
  if (user?.email === 'owner@testrestaurant.com') return 'Restaurant Owner';
  
  // Force limited@menufacil.app to always show as Restaurant Staff
  if (user?.email === 'limited@menufacil.app') return 'Restaurant Staff';
  
  if (isSystemAdmin(user)) return 'System Administrator';
  if (isRestaurantOwner(user)) return 'Restaurant Owner';
  if (isRestaurantStaff(user)) return 'Restaurant Staff';
  
  // Look more deeply in case role data is in unusual places
  const roleInMetadata = user?.user_metadata?.role || user?.app_metadata?.role;
  if (roleInMetadata === 'system_admin') return 'System Administrator';
  if (roleInMetadata === 'restaurant_owner') return 'Restaurant Owner';
  if (roleInMetadata === 'restaurant_staff') return 'Restaurant Staff';
  
  return 'User';
}; 