import { supabase } from '../config/supabase';

/**
 * Utility function to completely reset user authentication state
 * This ensures a clean slate between user sessions
 */
export const resetAuthState = async (): Promise<void> => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear localStorage items
    if (typeof window !== 'undefined') {
      // Clear auth-related items
      localStorage.removeItem('userRole');
      localStorage.removeItem('staffRestaurantName');
      localStorage.removeItem('staffRestaurantId');
      
      // Clear any session storage
      sessionStorage.clear();
      
      // Clear any Supabase-specific items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth') || 
            key.startsWith('sb-') || 
            key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth state reset complete');
  } catch (error) {
    console.error('Error resetting auth state:', error);
    throw error;
  }
}; 