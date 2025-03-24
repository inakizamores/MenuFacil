'use client';

import { useAuth } from '../context/auth-context';

export default function SignOutButton() {
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      // The redirect is handled in the auth.ts file
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload as a fallback if the normal signout fails
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Sign Out (Emergency)
    </button>
  );
} 