'use client';

import { useAuth } from '../../context/auth-context';
import { useEffect } from 'react';
import Button from '../../components/ui/button';
import LogoutButton from '@/app/components/LogoutButton';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.user_metadata?.full_name || user?.email}</h2>
            
            <div className="mb-6">
              <p className="text-gray-600">You are logged in as {user?.email}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-50 p-6 rounded-lg border border-primary-100">
                <h3 className="text-lg font-medium text-primary-800 mb-2">Quick Actions</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/restaurants" className="text-primary-600 hover:text-primary-800">
                      Manage Restaurants
                    </a>
                  </li>
                  <li>
                    <a href="/menus" className="text-primary-600 hover:text-primary-800">
                      Edit Menus
                    </a>
                  </li>
                  <li>
                    <a href="/dashboard/analytics" className="text-primary-600 hover:text-primary-800">
                      View Analytics
                    </a>
                  </li>
                  <li>
                    <a href="/dashboard/restaurants" className="text-primary-600 hover:text-primary-800">
                      Manage QR Codes
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/profile" className="text-gray-600 hover:text-gray-900">
                      Edit Profile
                    </a>
                  </li>
                  <li>
                    <a href="/dashboard/settings" className="text-gray-600 hover:text-gray-900">
                      Settings
                    </a>
                  </li>
                  <li>
                    <LogoutButton
                      className="text-red-600 hover:text-red-800"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 