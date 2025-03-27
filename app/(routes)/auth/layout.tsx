'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * AuthLayout - Shared layout for all authentication screens
 * 
 * This component provides a consistent UI for all authentication pages,
 * including a logo, subtle gradient background, and a back-to-home button.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-gradient-to-br from-brand-background to-white py-6 px-4 sm:px-6">
      {/* Absolute positioned back to home button */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 flex items-center text-brand-text hover:text-brand-accent transition-colors duration-250 md:top-8 md:left-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
        <span className="text-xs sm:text-sm font-medium">Back to Home</span>
      </Link>
      
      {/* Logo header section */}
      <div className="w-full flex justify-center mb-4 sm:mb-8 mt-4 sm:mt-0">
        <Link href="/" className="inline-block">
          <img 
            src="/images/logos/primary/primary-logo-clean.svg"
            alt="MenuFacil"
            className="h-10 sm:h-12 w-auto animate-logoFadeIn transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>
      
      {/* Authentication form container with subtle shadow and animation */}
      <div className="w-full max-w-md px-4 sm:px-6 animate-fadeIn overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 