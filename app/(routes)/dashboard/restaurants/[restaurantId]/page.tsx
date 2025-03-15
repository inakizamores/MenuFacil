'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { getRestaurant } from '@/app/utils/db';
import Button from '@/app/components/ui/button';
import Link from 'next/link';

interface RestaurantPageProps {
  params: {
    restaurantId: string;
  };
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const { restaurantId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const restaurantData = await getRestaurant(restaurantId);
        
        if (!restaurantData) {
          setError('Restaurant not found');
        } else {
          setRestaurant(restaurantData);
        }
      } catch (err: any) {
        console.error('Error fetching restaurant:', err);
        setError(err.message || 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, user, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">
          {error || 'Restaurant not found'}
        </h1>
        <Button onClick={() => router.push('/dashboard/restaurants')}>
          Back to Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-sm text-gray-500">
            {restaurant.is_active ? (
              <span className="text-green-600">Active</span>
            ) : (
              <span className="text-red-600">Inactive</span>
            )}
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/edit`)}
          >
            Edit Restaurant
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus`)}
          >
            Manage Menus
          </Button>
        </div>
      </div>

      {/* Restaurant Information Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h2>
          
          <div className="space-y-3">
            {restaurant.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-gray-700">{restaurant.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Primary Color</h3>
                <div className="mt-1 flex items-center">
                  <div 
                    className="mr-2 h-6 w-6 rounded border border-gray-300" 
                    style={{ backgroundColor: restaurant.primary_color }}
                  ></div>
                  <span className="text-sm">{restaurant.primary_color}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Secondary Color</h3>
                <div className="mt-1 flex items-center">
                  <div 
                    className="mr-2 h-6 w-6 rounded border border-gray-300" 
                    style={{ backgroundColor: restaurant.secondary_color }}
                  ></div>
                  <span className="text-sm">{restaurant.secondary_color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Contact Information</h2>
          
          <div className="space-y-3">
            {restaurant.phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="text-gray-700">{restaurant.phone}</p>
              </div>
            )}
            
            {restaurant.email && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-gray-700">{restaurant.email}</p>
              </div>
            )}
            
            {restaurant.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <a 
                  href={restaurant.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {restaurant.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Location</h2>
          
          <div className="space-y-3">
            {restaurant.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="text-gray-700">
                  {restaurant.address}<br />
                  {restaurant.city && <>{restaurant.city}, </>}
                  {restaurant.state && <>{restaurant.state} </>}
                  {restaurant.postal_code && <>{restaurant.postal_code}<br /></>}
                  {restaurant.country && <>{restaurant.country}</>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h2>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button 
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/create`)}
              className="w-full justify-center"
            >
              Create Menu
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/qr-codes`)}
              className="w-full justify-center"
            >
              Generate QR Codes
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/members`)}
              className="w-full justify-center"
            >
              Manage Team
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/settings`)}
              className="w-full justify-center"
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Preview</h2>
          
          <Link 
            href={`/r/${restaurantId}`}
            target="_blank" 
            className="text-sm text-primary-600 hover:underline"
          >
            Open Public Page
          </Link>
        </div>
        
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-gray-500">
            Preview of your restaurant page will appear here soon.
          </p>
        </div>
      </div>
    </div>
  );
} 