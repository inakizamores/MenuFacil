'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRestaurants, Restaurant, deleteRestaurant } from '@/lib/restaurants';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurants() {
      setIsLoading(true);
      const { data, error } = await getRestaurants();
      if (error) {
        setError(error.message);
      } else {
        setRestaurants(data || []);
      }
      setIsLoading(false);
    }

    loadRestaurants();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      const { success, error } = await deleteRestaurant(id);
      if (success) {
        setRestaurants(restaurants.filter(restaurant => restaurant.id !== id));
      } else if (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Your Restaurants</h1>
          <Link 
            href="/dashboard/restaurants/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Restaurant
          </Link>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">You don&apos;t have any restaurants yet.</p>
            <p className="mt-2">
              <Link 
                href="/dashboard/restaurants/new" 
                className="text-primary-600 hover:text-primary-500"
              >
                Add your first restaurant
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        {restaurant.logo_url && (
                          <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden mr-4">
                            <img src={restaurant.logo_url} alt={restaurant.name} className="h-12 w-12 object-cover" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-lg font-medium text-primary-600 truncate">{restaurant.name}</h2>
                          <p className="text-sm text-gray-500">{restaurant.address || 'No address'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/restaurants/${restaurant.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/restaurants/${restaurant.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 