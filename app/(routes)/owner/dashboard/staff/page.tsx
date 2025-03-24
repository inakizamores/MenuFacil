'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { supabase } from '@/app/config/supabase';
import Link from 'next/link';
import { 
  UserPlus, 
  UserX, 
  Mail, 
  User, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';

interface StaffMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  linked_restaurant_id: string | null;
  restaurants: {
    id: string;
    name: string;
  } | null;
}

export default function StaffManagementPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [restaurant, setRestaurant] = useState<{ id: string, name: string } | null>(null);
  
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First get restaurant
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('owner_id', user.id)
          .single();
          
        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError);
          setError('Unable to fetch your restaurant data');
          return;
        }
        
        if (!restaurantData) {
          setError('No restaurant found. Please create a restaurant first.');
          return;
        }
        
        setRestaurant(restaurantData);
        
        // Get staff members
        const { data: staffData, error: staffError } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name, 
            avatar_url, 
            linked_restaurant_id,
            restaurants:linked_restaurant_id (
              id, 
              name
            )
          `)
          .eq('parent_user_id', user.id)
          .eq('role', 'restaurant_staff');
          
        if (staffError) {
          console.error('Error fetching staff:', staffError);
          setError('Error loading staff members');
          return;
        }
        
        // Cast the data to ensure it matches our type
        const typedStaffData = (staffData || []) as StaffMember[];
        setStaff(typedStaffData);
      } catch (err) {
        console.error('Error in staff fetch:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaffData();
  }, [user?.id]);
  
  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete staff member');
      }
      
      // Remove from local state
      setStaff(staff.filter(member => member.id !== staffId));
      setNotification({
        type: 'success',
        message: 'Staff member deleted successfully'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Error deleting staff member'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && staff.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        
        {restaurant && (
          <Link 
            href="/owner/dashboard/staff/create" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add Staff Member
          </Link>
        )}
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-start">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <p className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notification.message}
            </p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          
          {error.includes('create a restaurant') && (
            <div className="mt-4">
              <Link 
                href="/owner/dashboard/restaurants/create" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Restaurant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Staff list */}
      {!error && (
        <>
          {staff.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Staff Members Yet</h2>
              <p className="text-gray-500 mb-6">You haven't added any staff members to your restaurant yet.</p>
              
              <Link 
                href="/owner/dashboard/staff/create" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" /> Add Staff Member
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="min-w-full divide-y divide-gray-200">
                <div className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Restaurant</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                </div>
                <div className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <div key={member.id} className="px-6 py-4 whitespace-nowrap">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4 flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            {member.full_name?.charAt(0) || 'S'}
                          </div>
                          <div className="font-medium text-gray-900">{member.full_name || 'No name'}</div>
                        </div>
                        <div className="col-span-4 flex items-center text-gray-500">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Staff email hidden</span>
                        </div>
                        <div className="col-span-2 text-gray-500">
                          {member.restaurants?.name || 'Not assigned'}
                        </div>
                        <div className="col-span-2">
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
                            className="text-red-600 hover:text-red-800 focus:outline-none"
                            disabled={loading}
                          >
                            <UserX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 