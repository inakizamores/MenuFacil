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
  AlertTriangle,
  Mail
} from 'lucide-react';
import { isRestaurantOwner, isSystemAdmin, isRestaurantStaff } from '@/types/user-roles';
import { useStaffRestaurant } from '@/app/hooks/useStaffRestaurant';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

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

function EmailVerificationAlert() {
  const { profile, user } = useAuth();
  const router = useRouter();
  
  // Only show for users with unverified emails
  if (!user || profile?.verified) {
    return null;
  }
  
  return (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Email not verified</AlertTitle>
      <AlertDescription className="text-yellow-700 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          Your email address {user.email} has not been verified. Verify your email to access all features of MenuFacil.
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="sm:whitespace-nowrap border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={() => router.push('/auth/verify-email')}
        >
          <Mail className="mr-2 h-4 w-4" />
          Verify Email
        </Button>
      </AlertDescription>
    </Alert>
  );
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  // Admin view shows platform-wide stats
  if (isAdmin && !isOwner) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-text">System Admin Dashboard</h1>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-brand-text">Platform Overview</h2>
          <p className="text-brand-text/70">Welcome to the admin dashboard. You have access to all system features.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-brand-text/70">Users</p>
                  <h3 className="text-3xl font-bold mt-1 text-brand-text">-</h3>
                </div>
                <div className="bg-brand-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-brand-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/dashboard/users" 
                  className="text-brand-accent hover:text-brand-accent/80 font-medium text-sm flex items-center transition-colors duration-250"
                >
                  Manage Users →
                </Link>
              </div>
            </div>
            <div className="h-1 bg-primary-gradient-horizontal"></div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-brand-text/70">Restaurants</p>
                  <h3 className="text-3xl font-bold mt-1 text-brand-text">-</h3>
                </div>
                <div className="bg-brand-secondary/10 p-3 rounded-full">
                  <Utensils className="h-6 w-6 text-brand-secondary" />
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/dashboard/restaurants" 
                  className="text-brand-accent hover:text-brand-accent/80 font-medium text-sm flex items-center transition-colors duration-250"
                >
                  Manage Restaurants →
                </Link>
              </div>
            </div>
            <div className="h-1 bg-secondary-gradient-horizontal"></div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-brand-text/70">Analytics</p>
                  <h3 className="text-3xl font-bold mt-1 text-brand-text">-</h3>
                </div>
                <div className="bg-brand-accent/10 p-3 rounded-full">
                  <BarChart2 className="h-6 w-6 text-brand-accent" />
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/dashboard/analytics" 
                  className="text-brand-accent hover:text-brand-accent/80 font-medium text-sm flex items-center transition-colors duration-250"
                >
                  View Analytics →
                </Link>
              </div>
            </div>
            <div className="h-1 bg-cta-gradient"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no restaurant data for owner or staff
  if (!stats.restaurant) {
    return (
      <div className="text-center py-12 bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
        <Utensils className="h-16 w-16 mx-auto text-brand-text/40 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-brand-text">No Restaurant Found</h2>
        {isOwner ? (
          <>
            <p className="text-brand-text/70 mb-6">You don't have a restaurant set up yet. Create one to get started.</p>
            <Link 
              href="/dashboard/restaurants/create" 
              className="inline-flex items-center px-4 py-2 bg-primary-gradient-horizontal text-white rounded-md hover:opacity-90 shadow-md transition-all duration-250"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Restaurant
            </Link>
          </>
        ) : isStaff ? (
          <p className="text-brand-text/70 mb-6">You haven't been assigned to a restaurant yet. Please contact your manager.</p>
        ) : (
          <p className="text-brand-text/70 mb-6">No restaurant information is available.</p>
        )}
      </div>
    );
  }

  // Main dashboard view for restaurant owners and staff
  return (
    <div className="space-y-6">
      <EmailVerificationAlert />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Restaurant Dashboard</h1>
        {isOwner && (
          <div className="flex space-x-2">
            <Link 
              href="/dashboard/menus/create" 
              className="inline-flex items-center px-3 py-2 bg-primary-gradient-horizontal text-white text-sm rounded-md hover:opacity-90 shadow-md transition-all duration-250"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Menu Item
            </Link>
            <Link 
              href="/dashboard/staff/create" 
              className="inline-flex items-center px-3 py-2 bg-cta-gradient text-white text-sm rounded-md hover:opacity-90 shadow-md transition-all duration-250"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Staff
            </Link>
          </div>
        )}
      </div>
      
      {/* Restaurant Info Card */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-brand-text">{stats.restaurant.name}</h2>
        {isStaff && !isOwner && (
          <div className="mb-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">You have limited access to this restaurant's data</p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-brand-text/70 text-sm">Address</p>
            <p className="text-brand-text">{stats.restaurant.address || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-brand-text/70 text-sm">Created</p>
            <p className="text-brand-text">{new Date(stats.restaurant.created_at).toLocaleDateString()}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-brand-text/70 text-sm">Description</p>
            <p className="text-brand-text">{stats.restaurant.description || 'No description available'}</p>
          </div>
        </div>
        {isOwner && (
          <div className="mt-4">
            <Link 
              href="/dashboard/settings" 
              className="text-brand-accent text-sm hover:text-brand-accent/80 transition-colors duration-250"
            >
              Edit Restaurant Information
            </Link>
          </div>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Staff Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-brand-text/70">Staff Members</p>
                <h3 className="text-3xl font-bold mt-1 text-brand-text">{stats.staffCount}</h3>
              </div>
              <div className="bg-brand-accent/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-brand-accent" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/staff" 
                className={`text-brand-accent hover:text-brand-accent/80 font-medium text-sm flex items-center transition-colors duration-250 ${!isOwner && 'opacity-50 pointer-events-none'}`}
              >
                Manage Staff →
              </Link>
            </div>
          </div>
          <div className="h-1 bg-brand-gradient-horizontal"></div>
        </div>
        
        {/* Menu Items Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-brand-text/70">Menu Items</p>
                <h3 className="text-3xl font-bold mt-1 text-brand-text">{stats.menuItemsCount}</h3>
              </div>
              <div className="bg-brand-secondary/10 p-3 rounded-full">
                <MenuIcon className="h-6 w-6 text-brand-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/menus" 
                className="text-brand-accent hover:text-brand-accent/80 font-medium text-sm flex items-center transition-colors duration-250"
              >
                Manage Menu →
              </Link>
            </div>
          </div>
          <div className="h-1 bg-secondary-gradient-horizontal"></div>
        </div>
        
        {/* Categories Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-brand-text/70">Categories</p>
                <h3 className="text-3xl font-bold mt-1 text-brand-text">{stats.categoriesCount}</h3>
              </div>
              <div className="bg-brand-primary/10 p-3 rounded-full">
                <QrCode className="h-6 w-6 text-brand-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/menus/categories" 
                className="text-brand-accent hover:text-brand-accent/80 font-medium text-sm flex items-center transition-colors duration-250"
              >
                Manage Categories →
              </Link>
            </div>
          </div>
          <div className="h-1 bg-primary-gradient-horizontal"></div>
        </div>
      </div>
      
      {/* Quick Insights & Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-brand-text">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="bg-brand-background p-2 rounded-full">
                    <Clock className="h-4 w-4 text-brand-text/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-text">Menu updated</p>
                    <p className="text-xs text-brand-text/60">2 days ago</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/activity" className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors duration-250">
                View all activity
              </Link>
            </div>
          </div>
          <div className="h-1 bg-brand-gradient-diagonal"></div>
        </div>
        
        {/* Revenue Overview - Only visible to owners */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-brand-text">Revenue Overview</h2>
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="bg-brand-background w-16 h-16 flex items-center justify-center rounded-full mx-auto">
                  <DollarSign className="h-8 w-8 text-brand-text/30" />
                </div>
                <p className="mt-4 text-brand-text/70">Enable analytics to view revenue data</p>
                <Link 
                  href="/dashboard/analytics" 
                  className={`mt-3 inline-block text-sm text-brand-accent hover:text-brand-accent/80 transition-colors duration-250 ${!isOwner && 'opacity-50 pointer-events-none'}`}
                >
                  Set up analytics
                </Link>
              </div>
            </div>
          </div>
          <div className="h-1 bg-complementary-diagonal"></div>
        </div>
      </div>
    </div>
  );
} 