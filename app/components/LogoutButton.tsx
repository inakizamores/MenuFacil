'use client';

import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

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
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
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