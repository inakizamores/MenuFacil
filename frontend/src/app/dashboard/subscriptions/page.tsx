'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSubscriptions, cancelSubscription, Subscription } from '@/lib/subscriptions';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptions() {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await getSubscriptions();
        
        if (error) {
          throw error;
        }
        
        setSubscriptions(data || []);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSubscriptions();
  }, []);

  const handleCancelSubscription = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { success, error } = await cancelSubscription(id);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        // Update the subscription status in the UI
        setSubscriptions(
          subscriptions.map(sub => 
            sub.id === id ? { ...sub, status: 'canceled' } : sub
          )
        );
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      alert(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Your Subscriptions</h1>
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
        ) : subscriptions.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">You don&apos;t have any subscriptions yet.</p>
            <p className="mt-2">
              <Link 
                href="/dashboard/restaurants" 
                className="text-primary-600 hover:text-primary-500"
              >
                Subscribe to a restaurant
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <li key={subscription.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-primary-600">
                          {subscription.restaurant?.name || 'Unknown Restaurant'}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="mr-2">Status:</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>
                        {subscription.current_period_end && (
                          <p className="mt-1 text-sm text-gray-500">
                            Current period ends: {formatDate(subscription.current_period_end)}
                          </p>
                        )}
                      </div>
                      <div className="flex">
                        <Link
                          href={`/dashboard/restaurants/${subscription.restaurant_id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                        >
                          View Restaurant
                        </Link>
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => handleCancelSubscription(subscription.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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