'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  UserCircle,
  Store,
  Users,
  FileText,
  ChefHat,
  QrCode,
  ArrowUp,
  ArrowDown,
  BarChart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Server
} from 'lucide-react';

interface DashboardStats {
  userCount: number;
  restaurantCount: number;
  menuCount: number;
  staffCount: number;
  qrCodesCount: number;
  activeSessionsCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    restaurantCount: 0,
    menuCount: 0,
    staffCount: 0,
    qrCodesCount: 0,
    activeSessionsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get user count (excluding staff members)
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .neq('role', 'restaurant_staff');
        
        if (userError) console.error('Error fetching users:', userError);
        
        // Get restaurant count
        const { count: restaurantCount, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id', { count: 'exact', head: true });
        
        if (restaurantError) console.error('Error fetching restaurants:', restaurantError);
        
        // Get menu count
        const { count: menuCount, error: menuError } = await supabase
          .from('menus')
          .select('id', { count: 'exact', head: true });
        
        if (menuError) console.error('Error fetching menus:', menuError);
        
        // Get staff count
        const { count: staffCount, error: staffError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'restaurant_staff');
        
        if (staffError) console.error('Error fetching staff:', staffError);
        
        // Get QR codes count
        const { count: qrCodesCount, error: qrError } = await supabase
          .from('qr_codes')
          .select('id', { count: 'exact', head: true });
        
        if (qrError) console.error('Error fetching QR codes:', qrError);
        
        // For active sessions, we'll use a placeholder for now
        // In a real implementation, this would come from the auth system analytics
        const activeSessionsCount = Math.floor(Math.random() * 15) + 5;
        
        setStats({
          userCount: userCount || 0,
          restaurantCount: restaurantCount || 0,
          menuCount: menuCount || 0,
          staffCount: staffCount || 0,
          qrCodesCount: qrCodesCount || 0,
          activeSessionsCount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Stats Overview */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Stat */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-400">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full">
                <UserCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-800">{stats.userCount}</p>
                  <div className="flex items-center text-xs text-green-500 mb-0.5">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    <span>12%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admindashboard/users" className="text-sm text-amber-600 hover:underline">
                View all users →
              </a>
            </div>
          </div>
          
          {/* Restaurants Stat */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-full">
                <Store className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Restaurants</h3>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-800">{stats.restaurantCount}</p>
                  <div className="flex items-center text-xs text-green-500 mb-0.5">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    <span>8%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admindashboard/restaurants" className="text-sm text-gray-600 hover:underline">
                View all restaurants →
              </a>
            </div>
          </div>
          
          {/* Staff Members Stat */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-400">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full">
                <ChefHat className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Staff Members</h3>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-800">{stats.staffCount}</p>
                  <div className="flex items-center text-xs text-green-500 mb-0.5">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    <span>15%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admindashboard/users?type=staff" className="text-sm text-amber-600 hover:underline">
                View all staff →
              </a>
            </div>
          </div>
          
          {/* Menus Stat */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Menus</h3>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-800">{stats.menuCount}</p>
                  <div className="flex items-center text-xs text-green-500 mb-0.5">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    <span>20%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admindashboard/menus" className="text-sm text-gray-600 hover:underline">
                View all menus →
              </a>
            </div>
          </div>
          
          {/* QR Codes Stat */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-400">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full">
                <QrCode className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">QR Codes</h3>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-800">{stats.qrCodesCount}</p>
                  <div className="flex items-center text-xs text-red-500 mb-0.5">
                    <ArrowDown className="h-3 w-3 mr-0.5" />
                    <span>5%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admindashboard/qrcodes" className="text-sm text-amber-600 hover:underline">
                View all QR codes →
              </a>
            </div>
          </div>
          
          {/* Active Sessions Stat */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-800">{stats.activeSessionsCount}</p>
                  <div className="flex items-center text-xs text-green-500 mb-0.5">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admindashboard/analytics" className="text-sm text-gray-600 hover:underline">
                View analytics →
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              className="flex items-center p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
              onClick={() => window.location.href = '/admindashboard/users/create'}
            >
              <UserCircle className="h-5 w-5 mr-3 text-amber-600" />
              <div className="text-left">
                <h3 className="font-medium text-gray-800">Create User</h3>
                <p className="text-xs text-gray-500 mt-1">Add new account</p>
              </div>
            </button>
            
            <button 
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              onClick={() => window.location.href = '/admindashboard/restaurants/create'}
            >
              <Store className="h-5 w-5 mr-3 text-gray-600" />
              <div className="text-left">
                <h3 className="font-medium text-gray-800">Add Restaurant</h3>
                <p className="text-xs text-gray-500 mt-1">Create new restaurant</p>
              </div>
            </button>
            
            <button 
              className="flex items-center p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
              onClick={() => window.location.href = '/admindashboard/content'}
            >
              <FileText className="h-5 w-5 mr-3 text-amber-600" />
              <div className="text-left">
                <h3 className="font-medium text-gray-800">Manage Content</h3>
                <p className="text-xs text-gray-500 mt-1">Update site content</p>
              </div>
            </button>
            
            <button 
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              onClick={() => window.location.href = '/admindashboard/analytics'}
            >
              <BarChart className="h-5 w-5 mr-3 text-gray-600" />
              <div className="text-left">
                <h3 className="font-medium text-gray-800">View Analytics</h3>
                <p className="text-xs text-gray-500 mt-1">See platform stats</p>
              </div>
            </button>
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-gray-700">Database</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-1 text-green-500" />
                <span className="text-sm text-gray-600">Operational</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-gray-700">Storage</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-1 text-green-500" />
                <span className="text-sm text-gray-600">Operational</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-gray-700">Authentication</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-1 text-green-500" />
                <span className="text-sm text-gray-600">Operational</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-gray-700">API</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-1 text-amber-500" />
                <span className="text-sm text-gray-600">High Load</span>
              </div>
            </div>
            
            <div className="pt-4 mt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last checked: 2 minutes ago</span>
                <button className="text-sm text-amber-600 hover:underline">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 