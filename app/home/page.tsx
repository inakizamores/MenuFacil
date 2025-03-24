'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          router.push('/dashboard');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, [router, supabase.auth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {isLoading && (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      )}
    </div>
  );
} 