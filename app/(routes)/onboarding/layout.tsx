'use client';

import React from 'react';
import { useAuth } from '@/app/context/auth-context';
import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { captureException } from '@/lib/sentry';

/**
 * Layout component for the onboarding flow
 * Provides a consistent structure and authentication checks
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, signOut, isLoading } = useAuth();

  // Redirect if user is not authenticated
  if (!isLoading && !user) {
    redirect('/auth/login');
  }

  // Redirect to dashboard if user has already completed onboarding
  if (!isLoading && profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
      captureException(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with logo and sign out */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b bg-white shadow-sm">
        <div className="flex items-center">
          <Image
            src="/logo.svg"
            alt="MenuFacil Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <h1 className="text-xl font-semibold text-slate-800">
            MenuFacil | Onboarding
          </h1>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="text-slate-600 hover:text-slate-900"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>Sign Out</span>
        </Button>
      </header>

      {/* Content area */}
      <main className="container mx-auto max-w-4xl py-10 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t bg-white mt-auto">
        <div className="container mx-auto text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} MenuFacil. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 