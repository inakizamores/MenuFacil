'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import Button from '../../../components/ui/button';
import { Restaurant } from '../../../types/database';
import { getUserRestaurants } from '../../../utils/db';
import { isRestaurantStaff, isRestaurantOwner } from '@/types/user-roles';

// RestaurantCard component
const RestaurantCard = ({ restaurant, onSelect }: { restaurant: Restaurant, onSelect: () => void }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        {restaurant.logo_url ? (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant.name} 
            className="mx-auto mb-4 h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div 
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" 
            style={{ backgroundColor: restaurant.primary_color || '#4F46E5' }}
          >
            <span className="text-xl font-bold text-white">
              {restaurant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <h3 className="truncate text-center text-lg font-medium leading-6 text-gray-900">
          {restaurant.name}
        </h3>
        
        {restaurant.description && (
          <p className="mt-1 line-clamp-2 text-center text-sm text-gray-500">
            {restaurant.description}
          </p>
        )}
        
        <div className="mt-4">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={onSelect}
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
};

// EmptyState component
const EmptyState = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center">
      <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new restaurant.
      </p>
      <div className="mt-6">
        <Button onClick={onCreate}>
          <svg 
            className="-ml-1 mr-2 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Restaurant
        </Button>
      </div>
    </div>
  );
};

// LoadingState component
const LoadingState = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      <p className="mt-4 text-sm text-gray-500">Loading restaurants...</p>
    </div>
  );
};

// Create a default test restaurant
const createTestRestaurant = (userId: string): Restaurant => ({
  id: '12345678-1234-1234-1234-123456789012' as `${string}-${string}-${string}-${string}-${string}`,
  name: 'Test Restaurant',
  description: 'This is a test restaurant for demonstration purposes',
  logo_url: null,
  owner_id: userId as `${string}-${string}-${string}-${string}-${string}`,
  is_active: true,
  primary_color: '#4F46E5',
  secondary_color: '#818CF8',
  created_at: new Date().toISOString(),
  updated_at: null,
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  postal_code: '12345',
  country: 'Test Country',
  phone: '+1234567890',
  email: 'contact@testrestaurant.com',
  website: null,
  social_media: null,
  business_hours: null,
});

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user?.id) return;
      
      try {
        // First try to fetch from API
        const userRestaurants = await getUserRestaurants(user.id);
        
        // If we have no restaurants or there was an error,
        // create a default test restaurant
        if (!userRestaurants || userRestaurants.length === 0) {
          // Create a test restaurant
          const testRestaurant = createTestRestaurant(user.id);
          
          // For staff members, always show only the test restaurant
          if (isRestaurantStaff(user)) {
            setRestaurants([testRestaurant]);
          } else {
            // For owners, add this as a fallback
            setRestaurants(userRestaurants || [testRestaurant]);
          }
        } else {
          // Check if Test Restaurant exists in the returned list 
          const hasTestRestaurant = userRestaurants.some(r => r.name === 'Test Restaurant');
          
          // For staff, filter to only show Test Restaurant
          if (isRestaurantStaff(user)) {
            const staffRestaurants = hasTestRestaurant 
              ? userRestaurants.filter(r => r.name === 'Test Restaurant')
              : [...userRestaurants, createTestRestaurant(user.id)];
            
            setRestaurants(staffRestaurants);
          } else {
            // For owners, show all restaurants
            setRestaurants(userRestaurants);
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        
        // Fallback to showing at least the test restaurant
        const testRestaurant = createTestRestaurant(user.id);
        
        // For staff, only show Test Restaurant
        if (isRestaurantStaff(user)) {
          setRestaurants([testRestaurant]);
        } else {
          // For owners, just add the test restaurant
          setRestaurants([testRestaurant]);
        }
        
        // Still set the error for logging purposes
        setError('Failed to load restaurants from server. Showing default test restaurant.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [user?.id]);

  const handleCreate = () => {
    router.push('/dashboard/restaurants/create');
  };

  const handleSelect = (restaurantId: string) => {
    router.push(`/dashboard/restaurants/${restaurantId}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Restaurants</h1>
        {!isRestaurantStaff(user) && (
          <Button onClick={handleCreate}>
            <svg 
              className="-ml-1 mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Restaurant
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : restaurants && restaurants.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id as string}
              restaurant={restaurant}
              onSelect={() => handleSelect(restaurant.id as string)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreate={handleCreate} />
      )}
    </div>
  );
} 