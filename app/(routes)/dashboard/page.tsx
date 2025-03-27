'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
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
  Clock,
  AlertTriangle
} from 'lucide-react';
import { isRestaurantOwner, isSystemAdmin, isRestaurantStaff } from '@/types/user-roles';
import { useStaffRestaurant } from '@/app/hooks/useStaffRestaurant';

interface DashboardStats {
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { restaurant: staffRestaurant } = useStaffRestaurant();
  const [stats, setStats] = useState<DashboardStats>({
    staffCount: 0,
    menuItemsCount: 0,
    categoriesCount: 0,
    restaurant: null
  });
  const [loading, setLoading] = useState(true);
  
  // Check user roles
  const isOwner = isRestaurantOwner(user);
  const isAdmin = isSystemAdmin(user);
  const isStaff = isRestaurantStaff(user);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        let restaurantData = null;
        
        // For staff members, use the restaurant they're assigned to
        if (isStaff && staffRestaurant) {
          restaurantData = staffRestaurant;
        } 
        // For owners, fetch their restaurant
        else if (isOwner) {
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching restaurant:', error);
            setLoading(false);
            return;
          }
          
          restaurantData = data;
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
  }, [user?.id, isStaff, isOwner, staffRestaurant]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Admin view shows platform-wide stats
  if (isAdmin && !isOwner) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Admin Dashboard</h1>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          <p className="text-gray-600">Welcome to the admin dashboard. You have access to all system features.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Users</p>
                <h3 className="text-3xl font-bold mt-1">-</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/users" 
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                Manage Users →
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Restaurants</p>
                <h3 className="text-3xl font-bold mt-1">-</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Utensils className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/restaurants" 
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
              >
                Manage Restaurants →
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Analytics</p>
                <h3 className="text-3xl font-bold mt-1">-</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/analytics" 
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center"
              >
                View Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no restaurant data for owner or staff
  if (!stats.restaurant) {
    return (
      <div className="text-center py-12">
        <Utensils className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Restaurant Found</h2>
        {isOwner ? (
          <>
            <p className="text-gray-600 mb-6">You don't have a restaurant set up yet. Create one to get started.</p>
            <Link 
              href="/dashboard/restaurants/create" 
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Restaurant
            </Link>
          </>
        ) : isStaff ? (
          <p className="text-gray-600 mb-6">You haven't been assigned to a restaurant yet. Please contact your manager.</p>
        ) : (
          <p className="text-gray-600 mb-6">No restaurant information is available.</p>
        )}
      </div>
    );
  }

  // Main dashboard view for restaurant owners and staff
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
        {isOwner && (
          <div className="flex space-x-2">
            <Link 
              href="/dashboard/menus/create" 
              className="inline-flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Menu Item
            </Link>
            <Link 
              href="/dashboard/staff/create" 
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Staff
            </Link>
          </div>
        )}
      </div>
      
      {/* Restaurant Info Card */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{stats.restaurant.name}</h2>
        {isStaff && !isOwner && (
          <div className="mb-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">You have limited access to this restaurant's data</p>
          </div>
        )}
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
        {isOwner && (
          <div className="mt-4">
            <Link 
              href="/dashboard/settings" 
              className="text-primary-600 text-sm hover:underline"
            >
              Edit Restaurant Information
            </Link>
          </div>
        )}
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
              href="/dashboard/staff" 
              className={`text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center ${!isOwner && 'opacity-50 pointer-events-none'}`}
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
              href="/dashboard/menus" 
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
              href="/dashboard/menus/categories" 
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
            <Link href="/dashboard/activity" className="text-sm text-primary-600 hover:underline">
              View all activity
            </Link>
          </div>
        </div>
        
        {/* Revenue Overview - Only visible to owners */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-gray-500">Enable analytics to view revenue data</p>
              <Link 
                href="/dashboard/analytics" 
                className={`mt-3 inline-block text-sm text-primary-600 hover:underline ${!isOwner && 'opacity-50 pointer-events-none'}`}
              >
                Set up analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 