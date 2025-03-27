'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { isSystemAdmin } from '@/types/user-roles';

/**
 * RoleFixer component
 * 
 * This component helps diagnose and fix user role issues.
 * It will:
 * 1. Check if a user's role is properly set
 * 2. Display debugging information
 * 3. Allow manually fixing admin roles
 * 
 * Used in layout.tsx with autoFix=true for automatic corrections
 */
export default function RoleFixer({ 
  adminEmails = ['test@menufacil.app'],
  autoFix = false,
  debug = false
}: { 
  adminEmails?: string[],
  autoFix?: boolean,
  debug?: boolean
}) {
  const { user, isLoading } = useAuth();
  const [showDebug, setShowDebug] = useState(debug);
  const [status, setStatus] = useState<string>('Checking roles...');
  const [profileData, setProfileData] = useState<any>(null);
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;

    async function checkRoles() {
      try {
        const supabase = createClient();
        
        // Check if current user should be an admin
        const shouldBeAdmin = adminEmails.includes(user.email || '');
        const isAdmin = isSystemAdmin(user);
        
        // Get profile data from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          setStatus(`Error fetching profile: ${error.message}`);
          return;
        }
        
        setProfileData(profile);
        
        // Check for role mismatch
        if (shouldBeAdmin && !isAdmin) {
          setStatus('Role mismatch detected: User should be admin but is not');
          
          if (autoFix) {
            await fixAdminRole();
          }
        } else if (isAdmin && !shouldBeAdmin) {
          setStatus('Role mismatch detected: User is admin but should not be');
        } else if (isAdmin && shouldBeAdmin) {
          setStatus('Admin role correctly set');
        } else {
          setStatus('Non-admin role correctly set');
        }
      } catch (err) {
        setStatus(`Error checking roles: ${err}`);
      }
    }
    
    checkRoles();
  }, [user, isLoading, adminEmails, autoFix]);

  const fixAdminRole = async () => {
    if (!user) return;
    
    setIsFixing(true);
    try {
      const supabase = createClient();
      setStatus('Fixing admin role...');
      
      // 1. Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'system_admin' })
        .eq('id', user.id);
        
      if (profileError) {
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }
      
      // 2. Update user_metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { role: 'system_admin' }
      });
      
      if (userError) {
        throw new Error(`Failed to update user metadata: ${userError.message}`);
      }
      
      setStatus('Admin role fixed! Please reload the page to apply changes.');
      
      // Force reload after a delay
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err: any) {
      setStatus(`Error fixing role: ${err.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  if (!showDebug && !autoFix) return null;
  
  // If autoFix is enabled but not showing debug, just return null after running
  if (autoFix && !showDebug) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-white border border-yellow-500 shadow-lg rounded-tl-lg max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Role Fixer</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded"
          >
            {showDebug ? 'Hide Details' : 'Show Details'}
          </button>
          {showDebug && (
            <button
              onClick={() => fixAdminRole()}
              disabled={isFixing}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded disabled:opacity-50"
            >
              {isFixing ? 'Fixing...' : 'Fix Admin Role'}
            </button>
          )}
        </div>
      </div>
      
      <div className="text-xs text-yellow-700 mb-2">
        Status: {status}
      </div>
      
      {showDebug && (
        <div className="text-xs">
          <div className="mb-2">
            <div className="font-semibold">User:</div>
            <div className="ml-2">Email: {user?.email}</div>
            <div className="ml-2">ID: {user?.id}</div>
            <div className="ml-2">
              Should be admin: {adminEmails.includes(user?.email || '') ? 'Yes' : 'No'}
            </div>
            <div className="ml-2">
              Is admin (according to isSystemAdmin): {isSystemAdmin(user) ? 'Yes' : 'No'}
            </div>
          </div>
          
          <div className="mb-2">
            <div className="font-semibold">User metadata:</div>
            <div className="ml-2">Role: {user?.user_metadata?.role || 'not set'}</div>
          </div>
          
          {profileData && (
            <div className="mb-2">
              <div className="font-semibold">Profile data:</div>
              <div className="ml-2">Role: {profileData.role || 'not set'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 