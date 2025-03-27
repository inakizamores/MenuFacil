'use client';

import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { resetAuthState } from '../utils/auth-helpers';

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

  const handleLogout = async () => {
    try {
      console.log('Logout requested');
      
      // First, reset the auth state completely
      await resetAuthState();
      
      // Then use the logout function from context
      await logout();
      
      // Force a complete page refresh to clear all React state
      if (typeof window !== 'undefined') {
        console.log('Redirecting to home page');
        window.location.href = '/';
      } else {
        // Fallback to Next.js router
        router.push('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      
      // Force navigation as a fallback
      if (typeof window !== 'undefined') {
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