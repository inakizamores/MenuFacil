'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings, 
  LogOut,
  BarChart,
  Menu,
  Bell,
  QrCode,
  FileText,
  ClipboardCheck
} from 'lucide-react';
import LogoutButton from '@/app/components/LogoutButton';
import { COLORS, GRADIENTS, SEMANTIC_COLORS } from '@/lib/constants/colors';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isSystemAdmin } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin access control
  useEffect(() => {
    if (!isLoading && !isSystemAdmin) {
      console.log('Non-admin user attempting to access admin dashboard, redirecting to login');
      router.push('/auth/login');
    }
  }, [isLoading, isSystemAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isSystemAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity bg-gray-700 bg-opacity-50 lg:hidden ${
          sidebarOpen ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-gray-800 lg:translate-x-0 lg:relative lg:inset-0 ${
          sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/logos/primary/primary-logo-clean-white.png" 
              alt="MenuFacil Admin" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-white">Admin</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 lg:hidden"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <Link 
            href="/admindashboard" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-3 text-amber-400" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            href="/admindashboard/users" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Users className="w-5 h-5 mr-3 text-amber-400" />
            <span>Users</span>
          </Link>
          
          <Link 
            href="/admindashboard/restaurants" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Building2 className="w-5 h-5 mr-3 text-amber-400" />
            <span>Restaurants</span>
          </Link>
          
          <Link 
            href="/admindashboard/menus" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Menu className="w-5 h-5 mr-3 text-amber-400" />
            <span>Menus</span>
          </Link>
          
          <Link 
            href="/admindashboard/qrcodes" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <QrCode className="w-5 h-5 mr-3 text-amber-400" />
            <span>QR Codes</span>
          </Link>
          
          <Link 
            href="/admindashboard/analytics" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <BarChart className="w-5 h-5 mr-3 text-amber-400" />
            <span>Analytics</span>
          </Link>
          
          <Link 
            href="/admindashboard/content" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <FileText className="w-5 h-5 mr-3 text-amber-400" />
            <span>Content</span>
          </Link>
          
          <Link 
            href="/admindashboard/settings" 
            className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Settings className="w-5 h-5 mr-3 text-amber-400" />
            <span>Settings</span>
          </Link>
          
          <div className="pt-4 mt-4 border-t border-gray-700">
            <LogoutButton
              className="w-full flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors text-left"
              showIcon={true}
            />
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow z-10">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-1 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Admin Control Panel</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <span className="sr-only">View notifications</span>
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            </button>
            
            <div className="flex items-center">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full border-2 border-amber-200"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-semibold border-2 border-amber-200">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500">System Administrator</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 