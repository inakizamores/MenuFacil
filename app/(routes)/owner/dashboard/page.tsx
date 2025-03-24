'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { supabase } from '@/app/config/supabase';
import Link from 'next/link';
import { 
  Users, 
  Menu as MenuIcon, 
  QrCode, 
  BarChart2, 
  Plus, 
  DollarSign,
  Utensils,
  Clock
} from 'lucide-react';

interface OwnerDashboardStats {
  staffCount: number;
  menuItemsCount: number;
  categoriesCount: number;
  restaurant: {
    id: string;
    name: string;
    address: string;
    description: string;
    created_at: string;
  } | null;
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OwnerDashboardStats>({
    staffCount: 0,
    menuItemsCount: 0,
    categoriesCount: 0,
    restaurant: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Get restaurant data
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .single();
          
        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError);
          setLoading(false);
          return;
        }
        
        if (!restaurantData) {
          setLoading(false);
          return;
        }
        
        const restaurantId = restaurantData.id;
        
        // Get staff count
        const { count: staffCount, error: staffError } = await supabase
          .from('restaurant_staff')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId);
          
        // Get menu items count
        const { count: menuItemsCount, error: menuError } = await supabase
          .from('menu_items')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId);
          
        // Get categories count
        const { count: categoriesCount, error: categoryError } = await supabase
          .from('menu_categories')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId);
        
        if (staffError || menuError || categoryError) {
          console.error('Error fetching stats:', staffError || menuError || categoryError);
        }
        
        setStats({
          staffCount: staffCount || 0,
          menuItemsCount: menuItemsCount || 0,
          categoriesCount: categoriesCount || 0,
          restaurant: restaurantData
        });
        
      } catch (error) {
        console.error('Error in dashboard data fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no restaurant data
  if (!stats.restaurant) {
    return (
      <div className="text-center py-12">
        <Utensils className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Restaurant Found</h2>
        <p className="text-gray-600 mb-6">You don't have a restaurant set up yet. Create one to get started.</p>
        <Link 
          href="/owner/dashboard/restaurants/create" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Restaurant
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
        <div className="flex space-x-2">
          <Link 
            href="/owner/dashboard/menu/create" 
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Menu Item
          </Link>
          <Link 
            href="/owner/dashboard/staff/create" 
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Staff
          </Link>
        </div>
      </div>
      
      {/* Restaurant Info Card */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{stats.restaurant.name}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Address</p>
            <p>{stats.restaurant.address || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Created</p>
            <p>{new Date(stats.restaurant.created_at).toLocaleDateString()}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500 text-sm">Description</p>
            <p>{stats.restaurant.description || 'No description available'}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link 
            href={`/owner/dashboard/settings`} 
            className="text-blue-600 text-sm hover:underline"
          >
            Edit Restaurant Information
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Staff Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Staff Members</p>
              <h3 className="text-3xl font-bold mt-1">{stats.staffCount}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/owner/dashboard/staff" 
              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center"
            >
              Manage Staff →
            </Link>
          </div>
        </div>
        
        {/* Menu Items Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Menu Items</p>
              <h3 className="text-3xl font-bold mt-1">{stats.menuItemsCount}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <MenuIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/owner/dashboard/menu" 
              className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center"
            >
              Manage Menu →
            </Link>
          </div>
        </div>
        
        {/* Categories Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Categories</p>
              <h3 className="text-3xl font-bold mt-1">{stats.categoriesCount}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <QrCode className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/owner/dashboard/menu/categories" 
              className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center"
            >
              Manage Categories →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Insights & Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Menu updated</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/owner/dashboard/activity" className="text-sm text-blue-600 hover:underline">
              View all activity
            </Link>
          </div>
        </div>
        
        {/* Revenue Overview */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-gray-500">Enable analytics to view revenue data</p>
              <Link 
                href="/owner/dashboard/analytics" 
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                Set up analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Get Started Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-lg font-semibold mb-2">Get the most out of your dashboard</h2>
        <p className="text-gray-600 mb-4">Complete these steps to fully set up your restaurant.</p>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm">Create your restaurant profile</span>
          </div>
          
          <div className="flex items-center">
            <div className={`w-5 h-5 rounded-full ${stats.menuItemsCount > 0 ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center mr-3`}>
              {stats.menuItemsCount > 0 ? (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-white text-xs">2</span>
              )}
            </div>
            <span className="text-sm">Add menu items {stats.menuItemsCount === 0 && <Link href="/owner/dashboard/menu/create" className="text-blue-600 hover:underline">Create now</Link>}</span>
          </div>
          
          <div className="flex items-center">
            <div className={`w-5 h-5 rounded-full ${stats.staffCount > 0 ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center mr-3`}>
              {stats.staffCount > 0 ? (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-white text-xs">3</span>
              )}
            </div>
            <span className="text-sm">Invite staff members {stats.staffCount === 0 && <Link href="/owner/dashboard/staff/create" className="text-blue-600 hover:underline">Invite now</Link>}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 