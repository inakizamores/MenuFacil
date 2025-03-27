import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/ui/Logo';

// Add export config for static generation
export const dynamic = 'force-static';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" type="clean" />
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-primary-600">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm font-medium text-gray-600 hover:text-primary-600">
              Pricing
            </Link>
            <Link href="/#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary-600">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-primary-600"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <Logo size="sm" type="clean" className="mb-2" />
              <p className="mt-2 text-sm text-gray-500">
                Create beautiful digital menus for your restaurant in minutes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Product</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/#features" className="text-sm text-gray-600 hover:text-primary-600">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/#pricing" className="text-sm text-gray-600 hover:text-primary-600">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/about" className="text-sm text-gray-600 hover:text-primary-600">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm text-gray-600 hover:text-primary-600">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-8">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} MenuFacil. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 