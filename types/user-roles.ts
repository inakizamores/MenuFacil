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
  return (
    user?.user_metadata?.role === 'system_admin' || 
    user?.role === 'system_admin'
  );
};

export const isRestaurantOwner = (user: any): boolean => {
  return (
    user?.user_metadata?.role === 'restaurant_owner' || 
    user?.role === 'restaurant_owner'
  );
};

export const isRestaurantStaff = (user: any): boolean => {
  return (
    user?.user_metadata?.role === 'restaurant_staff' || 
    user?.role === 'restaurant_staff'
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
  if (isSystemAdmin(user)) return 'System Administrator';
  if (isRestaurantOwner(user)) return 'Restaurant Owner';
  if (isRestaurantStaff(user)) return 'Restaurant Staff';
  return 'User';
}; 