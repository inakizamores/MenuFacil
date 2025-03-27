'use client';

import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { resetAuthState } from '../utils/auth-helpers';
import { createClient } from '@/lib/supabase/client';

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export default function LogoutButton({ 
  className = '',
  showIcon = true,
  label = 'Sign out'
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      console.log('Logout requested - LogoutButton component');
      
      // Get a direct reference to the Supabase client
      const supabaseClient = createClient();
      
      // First try a direct signOut with Supabase
      console.log('Attempting direct signout with Supabase client');
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('Error in direct Supabase logout:', error);
      } else {
        console.log('Direct Supabase logout successful');
      }
      
      // Then, reset the auth state completely
      console.log('Resetting auth state');
      await resetAuthState();
      
      // Then use the logout function from context
      console.log('Calling context logout function');
      await logout();
      
      // Force a complete page refresh to clear all React state
      console.log('Forcing navigation to home page');
      if (typeof window !== 'undefined') {
        console.log('Using window.location for home page redirect');
        window.location.href = '/';
      } else {
        // Fallback to Next.js router
        console.log('Using Next.js router for home page redirect');
        router.push('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      
      // Force navigation as a fallback
      console.log('Error occurred during logout, forcing fallback navigation');
      if (typeof window !== 'undefined') {
        // Clear any Supabase-specific items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth') || 
              key.startsWith('sb-') || 
              key.includes('supabase')) {
            console.log(`Removing localStorage item: ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Force navigation to home
        window.location.href = '/';
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center text-gray-600 hover:text-gray-900 ${className}`}
      aria-label="Sign out"
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      <span>{label}</span>
    </button>
  );
} 