'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Menu,
  QrCode, 
  Settings, 
  LogOut
} from 'lucide-react';
import LogoutButton from '@/app/components/LogoutButton';

export default function StaffDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading, isRestaurantStaff } = useAuth();
  const router = useRouter();

  // Staff access control
  useEffect(() => {
    if (!isLoading && !isRestaurantStaff) {
      router.push('/auth/login');
    }
  }, [isLoading, isRestaurantStaff, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Redirect if not staff
  if (!isRestaurantStaff) {
    return null;
  }

  const restaurantName = user?.user_metadata?.restaurant_name || 'Restaurant';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-emerald-900 text-white w-64 min-h-screen py-6 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Staff Portal</h1>
          <p className="text-emerald-200 text-sm mt-1">{restaurantName}</p>
        </div>
        
        <nav className="space-y-1">
          <Link 
            href="/staff/dashboard" 
            className="flex items-center px-4 py-3 hover:bg-emerald-800 rounded-md transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            href="/staff/dashboard/menu" 
            className="flex items-center px-4 py-3 hover:bg-emerald-800 rounded-md transition-colors"
          >
            <Menu className="w-5 h-5 mr-3" />
            <span>Menu Management</span>
          </Link>
          
          <Link 
            href="/staff/dashboard/qrcodes" 
            className="flex items-center px-4 py-3 hover:bg-emerald-800 rounded-md transition-colors"
          >
            <QrCode className="w-5 h-5 mr-3" />
            <span>QR Codes</span>
          </Link>
          
          <Link 
            href="/staff/dashboard/settings" 
            className="flex items-center px-4 py-3 hover:bg-emerald-800 rounded-md transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Settings</span>
          </Link>
          
          <LogoutButton
            className="w-full flex items-center px-4 py-3 hover:bg-emerald-800 rounded-md transition-colors text-left text-white"
            label="Logout"
          />
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Staff Dashboard</h2>
            <div className="flex items-center space-x-4">
              <span>{user?.email}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'S'}
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