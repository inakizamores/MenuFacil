'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getRestaurant, Restaurant } from '@/lib/restaurants';
import { getMenus, Menu } from '@/lib/menus';
import { getSubscriptionByRestaurant } from '@/lib/subscriptions';

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load restaurant details
        const { data: restaurantData, error: restaurantError } = await getRestaurant(restaurantId);
        if (restaurantError) {
          throw restaurantError;
        }
        setRestaurant(restaurantData);
        
        // Load menus
        const { data: menusData, error: menusError } = await getMenus(restaurantId);
        if (menusError) {
          throw menusError;
        }
        setMenus(menusData || []);
        
        // Check subscription status
        const { data: subscriptionData } = await getSubscriptionByRestaurant(restaurantId);
        setHasSubscription(!!subscriptionData && subscriptionData.status === 'active');
      } catch (err) {
        console.error('Error loading restaurant data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [restaurantId]);

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error || 'Restaurant not found'}
          </div>
          <div className="mt-4">
            <Link 
              href="/dashboard/restaurants" 
              className="text-primary-600 hover:text-primary-500"
            >
              &larr; Back to restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {restaurant.name}
            </h2>
            {restaurant.description && (
              <p className="mt-1 text-sm text-gray-500">{restaurant.description}</p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link
              href={`/dashboard/restaurants/${restaurant.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Edit Restaurant
            </Link>
            {!hasSubscription && (
              <Link
                href={`/dashboard/restaurants/${restaurant.id}/subscribe`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Subscribe
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Restaurant Information</h3>
              <div className="mt-4">
                <dl className="grid grid-cols-1 gap-y-4">
                  {restaurant.address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.address}</dd>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.phone}</dd>
                    </div>
                  )}
                  {restaurant.website && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Website</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a 
                          href={restaurant.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-500"
                        >
                          {restaurant.website}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription Status</h3>
              <div className="mt-4">
                <div className={`rounded-md p-4 ${hasSubscription ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {hasSubscription ? (
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-10a1 1 0 10-2 0v4a1 1 0 102 0V8zm0 7a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${hasSubscription ? 'text-green-800' : 'text-yellow-800'}`}>
                        {hasSubscription ? 'Active Subscription' : 'No Active Subscription'}
                      </h3>
                      <div className={`mt-2 text-sm ${hasSubscription ? 'text-green-700' : 'text-yellow-700'}`}>
                        <p>
                          {hasSubscription
                            ? 'Your restaurant has an active subscription. You have full access to all features.'
                            : 'This restaurant does not have an active subscription. Some features may be limited.'}
                        </p>
                      </div>
                      {!hasSubscription && (
                        <div className="mt-4">
                          <Link
                            href={`/dashboard/restaurants/${restaurant.id}/subscribe`}
                            className="text-sm font-medium text-yellow-800 hover:text-yellow-600"
                          >
                            Subscribe Now &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Menus</h3>
            <Link
              href={`/dashboard/restaurants/${restaurant.id}/menus/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Menu
            </Link>
          </div>

          {menus.length === 0 ? (
            <div className="mt-4 bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">This restaurant doesn&apos;t have any menus yet.</p>
              <p className="mt-2">
                <Link 
                  href={`/dashboard/restaurants/${restaurant.id}/menus/new`} 
                  className="text-primary-600 hover:text-primary-500"
                >
                  Create your first menu
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {menus.map((menu) => (
                  <li key={menu.id}>
                    <Link
                      href={`/dashboard/menus/${menu.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {menu.name}
                              {menu.is_default && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Default
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${menu.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {menu.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        {menu.description && (
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {menu.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 