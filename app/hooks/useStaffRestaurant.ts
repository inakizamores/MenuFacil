import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/context/auth-context';
import { supabase } from '@/app/config/supabase'; // Use existing client instead

type Restaurant = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  [key: string]: any;
}

export function useStaffRestaurant() {
  const { user, isRestaurantStaff } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user?.id || !isRestaurantStaff) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get staff member's restaurant
        const { data: staffData, error: staffError } = await supabase
          .from('restaurant_staff')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .single();
          
        if (staffError || !staffData) {
          console.error('Error fetching staff data:', staffError);
          setError('Your account is not properly linked to a restaurant.');
          setLoading(false);
          return;
        }
        
        const restaurantId = staffData.restaurant_id;
        
        // Get restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
          
        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError);
          setError('Could not fetch restaurant details.');
          setLoading(false);
          return;
        }
        
        setRestaurant(restaurantData);
        
        // Store restaurant info in localStorage for backup
        if (typeof window !== 'undefined' && restaurantData) {
          localStorage.setItem('staffRestaurantName', restaurantData.name);
          localStorage.setItem('staffRestaurantId', restaurantData.id);
        }
        
      } catch (error: any) {
        console.error('Error in restaurant fetch:', error);
        setError(error.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user?.id, isRestaurantStaff]);

  return { restaurant, loading, error };
} 