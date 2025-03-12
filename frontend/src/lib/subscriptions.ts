import { supabase } from './supabase';

export type Subscription = {
  id: string;
  profile_id: string;
  restaurant_id: string;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  restaurant?: {
    name: string;
  };
};

export const getSubscriptions = async (): Promise<{
  data: Subscription[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, restaurant:restaurants(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { data: null, error: error as Error };
  }
};

export const getSubscription = async (id: string): Promise<{
  data: Subscription | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, restaurant:restaurants(name)')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching subscription ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

export const getSubscriptionByRestaurant = async (restaurantId: string): Promise<{
  data: Subscription | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No results found
        return { data: null, error: null };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching subscription for restaurant ${restaurantId}:`, error);
    return { data: null, error: error as Error };
  }
};

export const createSubscription = async (
  restaurantId: string,
  paymentMethodId: string
): Promise<{
  data: Subscription | null;
  error: Error | null;
}> => {
  try {
    // This would typically call a serverless function or API route that handles the Stripe API
    // For now, we'll just create a placeholder subscription in the database
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          profile_id: user.user.id,
          restaurant_id: restaurantId,
          status: 'active', // In a real app, this would be set by the Stripe webhook
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { data: null, error: error as Error };
  }
};

export const cancelSubscription = async (id: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    // In a real app, this would call a serverless function to cancel the Stripe subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Error canceling subscription ${id}:`, error);
    return { success: false, error: error as Error };
  }
}; 