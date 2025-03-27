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
  BarChart4,
  Shield,
  Tag,
  Bell
} from 'lucide-react';
import LogoutButton from '@/app/components/LogoutButton';
import { getColorWithAlpha, COLORS } from '@/lib/constants/colors';

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading, isSystemAdmin } = useAuth();
  const router = useRouter();

  // Check if user is admin or specifically test@menufacil.app
  const isAdminUser = isSystemAdmin || user?.email === 'test@menufacil.app';

  // Admin access control
  useEffect(() => {
    if (!isLoading && !isAdminUser) {
      console.log('Unauthorized access attempt to admin dashboard');
      router.push('/auth/login');
    }
  }, [isLoading, isAdminUser, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-600"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdminUser) {
    return null;
  }

  // Unique admin navigation links
  const adminNavigation = [
    {
      name: 'Overview',
      href: '/admindashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Users',
      href: '/admindashboard/users',
      icon: Users
    },
    {
      name: 'Restaurants',
      href: '/admindashboard/restaurants',
      icon: Building2
    },
    {
      name: 'System Settings',
      href: '/admindashboard/settings',
      icon: Settings
    },
    {
      name: 'Analytics',
      href: '/admindashboard/analytics',
      icon: BarChart4
    },
    {
      name: 'Security',
      href: '/admindashboard/security',
      icon: Shield
    },
    {
      name: 'Plans & Pricing',
      href: '/admindashboard/plans',
      icon: Tag
    },
    {
      name: 'Notifications',
      href: '/admindashboard/notifications',
      icon: Bell
    }
  ];

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Admin Sidebar - Using neutral colors with yellowish accent */}
      <aside className="bg-neutral-800 text-white w-64 min-h-screen py-6 px-4 shadow-lg">
        <div className="mb-8 px-2">
          <Link href="/admindashboard" className="flex items-center">
            <img 
              src="/images/logos/primary/primary-logo-clean-white.png"
              alt="MenuFacil Admin"
              className="h-10 w-auto animate-logoFadeIn"
            />
          </Link>
          <div className="mt-2 text-neutral-300 text-sm font-medium">
            Administration Portal
          </div>
        </div>
        
        <nav className="space-y-1">
          {adminNavigation.map((item) => (
            <Link 
              key={item.name}
              href={item.href} 
              className="flex items-center px-4 py-3 hover:bg-neutral-700 rounded-md transition-colors text-sm group"
            >
              <item.icon className="w-5 h-5 mr-3 text-neutral-300 group-hover:text-yellow-400" />
              <span className="group-hover:text-yellow-100">{item.name}</span>
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-neutral-700">
            <LogoutButton
              className="w-full flex items-center px-4 py-3 hover:bg-neutral-700 rounded-md transition-colors text-left text-neutral-300 text-sm group"
              label="Sign Out"
              showIcon={true}
            />
          </div>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin header */}
        <header className="bg-white shadow-md z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-xl font-semibold text-neutral-800">
              Admin Dashboard
            </h1>
            
            <div className="flex items-center">
              {/* Admin badge */}
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-yellow-200 mr-4">
                Administrator
              </span>
              
              {/* Admin profile */}
              <div className="flex items-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    className="h-9 w-9 rounded-full border-2 border-neutral-200 shadow-sm"
                    src={user.user_metadata.avatar_url}
                    alt="Admin avatar"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-700 text-white shadow-sm border-2 border-neutral-200">
                    <span className="text-lg font-semibold">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-800">
                    {user?.email === 'test@menufacil.app' 
                      ? 'Admin Test Account' 
                      : user?.user_metadata?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-neutral-500">
                    System Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Admin content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 