'use client';

import { useSupabase } from '@/components/providers/SupabaseProvider';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useSupabase();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to your Dashboard</h2>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-primary-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-primary-800 mb-2">Your Restaurants</h3>
              <p className="text-primary-600 mb-4">Manage your restaurant profiles</p>
              <Link
                href="/dashboard/restaurants"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                View Restaurants
              </Link>
            </div>
          </div>

          <div className="bg-secondary-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-secondary-800 mb-2">Your Menus</h3>
              <p className="text-secondary-600 mb-4">Create and customize your menus</p>
              <Link
                href="/dashboard/menus"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700"
              >
                Manage Menus
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Account Settings</h3>
              <p className="text-gray-600 mb-4">Update your profile and preferences</p>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Start Guide</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>Create a restaurant profile with your business details</li>
              <li>Design your menu with categories and items</li>
              <li>Customize the appearance with your brand colors</li>
              <li>Preview your menu and make adjustments</li>
              <li>Publish your menu and share the link with customers</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 