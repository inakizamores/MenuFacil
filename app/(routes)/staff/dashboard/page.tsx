'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { supabase } from '@/app/config/supabase';
import Link from 'next/link';
import { 
  Menu as MenuIcon, 
  QrCode, 
  Edit, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface StaffDashboardStats {
  menuItems: number;
  categories: number;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
    description: string;
  } | null;
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StaffDashboardStats>({
    menuItems: 0,
    categories: 0,
    restaurant: null
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Get staff member's restaurant
        const { data: staffData, error: staffError } = await supabase
          .from('restaurant_staff')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .single();
          
        if (staffError || !staffData) {
          console.error('Error fetching staff data:', staffError);
          setAlerts(['Your account is not properly linked to a restaurant.']);
          setLoading(false);
          return;
        }
        
        const restaurantId = staffData.restaurant_id;
        
        // Get restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
          
        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError);
          setAlerts([...alerts, 'Could not fetch restaurant details.']);
        }
        
        // Get menu stats
        const { count: menuItemsCount, error: menuError } = await supabase
          .from('menu_items')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId);
          
        const { count: categoriesCount, error: categoryError } = await supabase
          .from('menu_categories')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId);
        
        if (menuError || categoryError) {
          console.error('Error fetching menu stats:', menuError || categoryError);
          setAlerts([...alerts, 'Could not fetch menu statistics.']);
        }
        
        setStats({
          menuItems: menuItemsCount || 0,
          categories: categoriesCount || 0,
          restaurant: restaurantData || null
        });
        
      } catch (error) {
        console.error('Error in dashboard data fetch:', error);
        setAlerts([...alerts, 'An unexpected error occurred.']);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>
      
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
            <div>
              {alerts.map((alert, i) => (
                <p key={i} className="text-amber-700">{alert}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Restaurant Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Restaurant Information</h2>
        {stats.restaurant ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-500">Name</h3>
              <p>{stats.restaurant.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Phone</h3>
              <p>{stats.restaurant.phone || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-500">Address</h3>
              <p>{stats.restaurant.address || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-500">Description</h3>
              <p>{stats.restaurant.description || 'No description available'}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No restaurant information available</p>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Menu Items</p>
              <h3 className="text-3xl font-bold mt-1">{stats.menuItems}</h3>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <MenuIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/staff/dashboard/menu" 
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center"
            >
              Manage Menu Items <Edit className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Categories</p>
              <h3 className="text-3xl font-bold mt-1">{stats.categories}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/staff/dashboard/menu/categories" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              Manage Categories <Edit className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-gray-800">Menu was updated</p>
                <p className="text-sm text-gray-500">3 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 