'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { isSystemAdmin, isRestaurantOwner, isRestaurantStaff } from '@/types/user-roles';
import { createClient } from '@/lib/supabase/client';

export default function DebugPage() {
  const { user, session, isLoading, userRole } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});

  // Fetch profile data from Supabase directly
  useEffect(() => {
    async function fetchProfileData() {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfileData(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setProfileLoading(false);
      }
    }

    // Get local storage data
    if (typeof window !== 'undefined') {
      const lsData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          lsData[key] = localStorage.getItem(key) || '';
        }
      }
      setLocalStorageData(lsData);
    }

    fetchProfileData();
  }, [user]);

  // Helper to safely stringify objects
  const safeStringify = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return `Error stringifying: ${e}`;
    }
  };

  // Helper to check all possible role locations
  const checkAllRoleLocations = (user: any) => {
    if (!user) return [];
    
    const locations = [
      { path: 'user_metadata.role', value: user?.user_metadata?.role },
      { path: 'app_metadata.role', value: user?.app_metadata?.role },
      { path: 'role', value: user?.role }
    ];
    
    // Check using helper functions
    const checks = [
      { name: 'isSystemAdmin(user)', value: isSystemAdmin(user) },
      { name: 'isRestaurantOwner(user)', value: isRestaurantOwner(user) },
      { name: 'isRestaurantStaff(user)', value: isRestaurantStaff(user) }
    ];
    
    return { locations, checks };
  };

  if (isLoading || profileLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
        <div className="text-neutral-600">Loading user data...</div>
      </div>
    );
  }

  const userRoleInfo = checkAllRoleLocations(user);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="p-4 bg-white rounded-lg shadow">
          <p><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
          <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>Auth Context userRole:</strong> {userRole || 'Not set'}</p>
        </div>
      </div>

      {user && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Role Information</h2>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-medium mb-2">Role Data Locations:</h3>
              <ul className="mb-4">
                {userRoleInfo.locations.map((loc, i) => (
                  <li key={i} className="mb-1">
                    <strong>{loc.path}:</strong> {loc.value || 'not set'}
                  </li>
                ))}
              </ul>
              
              <h3 className="font-medium mb-2">Role Check Functions:</h3>
              <ul>
                {userRoleInfo.checks.map((check, i) => (
                  <li key={i} className="mb-1">
                    <strong>{check.name}:</strong> {check.value ? 'true' : 'false'}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Supabase Profile Data</h2>
            <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-lg overflow-auto shadow">
              {profileData ? safeStringify(profileData) : 'No profile data found'}
            </pre>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">User Object</h2>
            <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-lg overflow-auto shadow">
              {safeStringify(user)}
            </pre>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Session Object</h2>
            <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-lg overflow-auto shadow">
              {safeStringify(session)}
            </pre>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
            <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-lg overflow-auto shadow">
              {safeStringify(localStorageData)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
} 