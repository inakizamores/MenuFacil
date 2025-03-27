'use client';

import { useEffect } from 'react';
import { AuthProvider } from '../context/auth-context';
import RoleFixer from './RoleFixer';
import { initSentry } from '@/lib/sentry';

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  // Initialize Sentry when the app mounts
  useEffect(() => {
    try {
      initSentry();
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }, []);

  return (
    <AuthProvider initialSession={null}>
      {children}
      <RoleFixer 
        adminEmails={['test@menufacil.app']} 
        autoFix={true} 
        debug={false} 
      />
    </AuthProvider>
  );
} 