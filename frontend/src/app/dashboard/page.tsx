'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRestaurants } from '@/lib/restaurants';
import { getSubscriptions } from '@/lib/subscriptions';
import { useSupabase } from '@/components/providers/SupabaseProvider';

export default function DashboardPage() {
  const { user } = useSupabase();
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [recentRestaurants, setRecentRestaurants] = useState<Array<{
    id: string;
    name: string;
    created_at: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get restaurants
        const { data: restaurants, error: restaurantsError } = await getRestaurants();
        
        if (restaurantsError) {
          throw restaurantsError;
        }
        
        if (restaurants) {
          setRestaurantCount(restaurants.length);
          
          // Get 3 most recent restaurants
          const sorted = [...restaurants].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          setRecentRestaurants(
            sorted.slice(0, 3).map(r => ({
              id: r.id,
              name: r.name,
              created_at: r.created_at
            }))
          );
        }
        
        // Get subscriptions
        const { data: subscriptions, error: subscriptionsError } = await getSubscriptions();
        
        if (subscriptionsError) {
          throw subscriptionsError;
        }
        
        if (subscriptions) {
          const active = subscriptions.filter(s => s.status === 'active');
          setActiveSubscriptions(active.length);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user) {
      loadDashboardData();
    }
  }, [user]);

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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Restaurant Count Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Restaurants
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {restaurantCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/restaurants" className="font-medium text-primary-600 hover:text-primary-500">
                  View all restaurants
                </Link>
              </div>
            </div>
          </div>
          
          {/* Active Subscriptions Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Subscriptions
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {activeSubscriptions}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/subscriptions" className="font-medium text-primary-600 hover:text-primary-500">
                  Manage subscriptions
                </Link>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Link
                  href="/dashboard/restaurants/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add New Restaurant
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Restaurants */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Recent Restaurants
            </h2>
            <Link
              href="/dashboard/restaurants"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
            {recentRestaurants.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentRestaurants.map((restaurant) => (
                  <li key={restaurant.id}>
                    <Link
                      href={`/dashboard/restaurants/${restaurant.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {restaurant.name}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {new Date(restaurant.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">No restaurants yet.</p>
                <p className="mt-2">
                  <Link
                    href="/dashboard/restaurants/new"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Add your first restaurant
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 