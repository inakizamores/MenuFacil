'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings, 
  LogOut,
  BarChart
} from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading, isSystemAdmin, logout } = useAuth();
  const router = useRouter();

  // Admin access control
  useEffect(() => {
    if (!isLoading && !isSystemAdmin) {
      router.push('/auth/login');
    }
  }, [isLoading, isSystemAdmin, router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isSystemAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-indigo-900 text-white w-64 min-h-screen py-6 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">MenuFácil Admin</h1>
        </div>
        
        <nav className="space-y-1">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            href="/admin/dashboard/users" 
            className="flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md transition-colors"
          >
            <Users className="w-5 h-5 mr-3" />
            <span>Users</span>
          </Link>
          
          <Link 
            href="/admin/dashboard/restaurants" 
            className="flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md transition-colors"
          >
            <Building2 className="w-5 h-5 mr-3" />
            <span>Restaurants</span>
          </Link>
          
          <Link 
            href="/admin/dashboard/analytics" 
            className="flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md transition-colors"
          >
            <BarChart className="w-5 h-5 mr-3" />
            <span>Analytics</span>
          </Link>
          
          <Link 
            href="/admin/dashboard/settings" 
            className="flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Settings</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md transition-colors text-left"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <div className="flex items-center space-x-4">
              <span>{user?.email}</span>
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 