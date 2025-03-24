'use client';

import { useAuth } from '../context/auth-context';
import SignOutButton from '../components/SignOutButton';

export default function SignOutTestPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium text-gray-900">Sign Out Test</h1>
          
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Current user: {user ? user.email : 'Not signed in'}</p>
          </div>
          
          <div className="mt-5">
            <SignOutButton />
          </div>
          
          <div className="mt-5 border-t border-gray-200 pt-5">
            <h2 className="text-sm font-medium text-gray-500">Other Options</h2>
            <div className="mt-3 space-y-3">
              <button
                onClick={() => {
                  // Clear all cookies
                  document.cookie.split(';').forEach(cookie => {
                    const [name] = cookie.split('=');
                    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
                  });
                  // Force reload
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear All Cookies & Reload
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Go to Home Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 