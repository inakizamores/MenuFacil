'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { supabase } from '@/app/config/supabase';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateStaffPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<{ id: string, name: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('owner_id', user.id)
          .single();
          
        if (error) {
          throw new Error('Could not fetch restaurant information');
        }
        
        setRestaurant(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [user?.id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) {
      setError('No restaurant found. Please create a restaurant first.');
      return;
    }
    
    // Validate form
    if (!formData.email || !formData.full_name) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password || undefined, // Only send if provided
          restaurantId: restaurant.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create staff member');
      }
      
      // Success, redirect to staff list
      router.push('/owner/dashboard/staff');
    } catch (err: any) {
      console.error('Error creating staff:', err);
      setError(err.message || 'Error creating staff member');
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Add Staff Member</h1>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-red-700">No restaurant found. Please create a restaurant first.</p>
              <div className="mt-4">
                <Link 
                  href="/owner/dashboard/restaurants/create" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Restaurant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/owner/dashboard/staff" 
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Add Staff Member</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <p className="font-medium text-gray-700">Restaurant: {restaurant.name}</p>
          <p className="text-gray-500 text-sm mt-1">
            You're adding a staff member who will have access to manage this restaurant
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="staff@example.com"
            />
          </div>
          
          <div>
            <label 
              htmlFor="full_name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name*
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password (optional)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave blank for auto-generated password"
            />
            <p className="text-xs text-gray-500 mt-1">
              If left blank, a temporary password will be generated
            </p>
          </div>
          
          {formData.password && (
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm password"
              />
            </div>
          )}
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" /> Creating...
                </>
              ) : (
                'Create Staff Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 