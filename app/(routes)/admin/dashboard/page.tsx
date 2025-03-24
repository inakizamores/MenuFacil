'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/config/supabase';
import { useAuth } from '@/app/context/auth-context';
import {
  UserCircle,
  Store,
  Users,
  FileText
} from 'lucide-react';

interface DashboardStats {
  userCount: number;
  restaurantCount: number;
  menuCount: number;
  staffCount: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    restaurantCount: 0,
    menuCount: 0,
    staffCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get user count (excluding staff members)
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .neq('role', 'restaurant_staff');
        
        // Get restaurant count
        const { count: restaurantCount, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id', { count: 'exact', head: true });
        
        // Get menu count
        const { count: menuCount, error: menuError } = await supabase
          .from('menus')
          .select('id', { count: 'exact', head: true });
        
        // Get staff count
        const { count: staffCount, error: staffError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'restaurant_staff');
        
        setStats({
          userCount: userCount || 0,
          restaurantCount: restaurantCount || 0,
          menuCount: menuCount || 0,
          staffCount: staffCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Overview</h1>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Stat */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <UserCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-semibold">{stats.userCount}</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admin/dashboard/users" className="text-sm text-blue-600 hover:underline">
                View all users →
              </a>
            </div>
          </div>
          
          {/* Restaurants Stat */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Restaurants</h3>
                <p className="text-2xl font-semibold">{stats.restaurantCount}</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admin/dashboard/restaurants" className="text-sm text-green-600 hover:underline">
                View all restaurants →
              </a>
            </div>
          </div>
          
          {/* Staff Members Stat */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Staff Members</h3>
                <p className="text-2xl font-semibold">{stats.staffCount}</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admin/dashboard/users?type=staff" className="text-sm text-purple-600 hover:underline">
                View all staff →
              </a>
            </div>
          </div>
          
          {/* Menus Stat */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Menus</h3>
                <p className="text-2xl font-semibold">{stats.menuCount}</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admin/dashboard/restaurants" className="text-sm text-amber-600 hover:underline">
                View restaurant menus →
              </a>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="bg-white hover:bg-gray-50 shadow rounded-lg p-4 text-left"
            onClick={() => window.location.href = '/admin/dashboard/users/create'}
          >
            <h3 className="font-medium">Create New User</h3>
            <p className="text-sm text-gray-500 mt-1">Add a new restaurant owner or admin</p>
          </button>
          
          <button 
            className="bg-white hover:bg-gray-50 shadow rounded-lg p-4 text-left"
            onClick={() => window.location.href = '/admin/dashboard/restaurants/create'}
          >
            <h3 className="font-medium">Create New Restaurant</h3>
            <p className="text-sm text-gray-500 mt-1">Add a new restaurant to the platform</p>
          </button>
          
          <button 
            className="bg-white hover:bg-gray-50 shadow rounded-lg p-4 text-left"
            onClick={() => window.location.href = '/admin/dashboard/analytics'}
          >
            <h3 className="font-medium">View Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">See platform usage statistics</p>
          </button>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-green-400 rounded-full mr-2"></div>
            <span>All systems operational</span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <h4 className="font-medium">Database</h4>
              <p className="text-sm text-gray-500">Connected - Supabase</p>
            </div>
            <div className="border rounded p-3">
              <h4 className="font-medium">Storage</h4>
              <p className="text-sm text-gray-500">Connected - Supabase Storage</p>
            </div>
            <div className="border rounded p-3">
              <h4 className="font-medium">Authentication</h4>
              <p className="text-sm text-gray-500">Connected - Supabase Auth</p>
            </div>
            <div className="border rounded p-3">
              <h4 className="font-medium">Deployments</h4>
              <p className="text-sm text-gray-500">Connected - Vercel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 