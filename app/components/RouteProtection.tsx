'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { navigateTo } from '@/app/utils/navigation';

export default function RouteProtection({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthentication() {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found, user is authenticated');
          setIsAuthenticated(true);
        } else {
          console.log('No active session found, redirecting to login page');
          // First try the router
          await navigateTo(router, '/auth/login', { 
            fallback: true, 
            delay: 100,
            forceReload: false
          });
          
          // If still here, force a redirect
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }, 200);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Force navigation to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthentication();
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
} 