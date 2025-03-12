import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SupabaseProvider from '@/components/providers/SupabaseProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MenúFácil - Digital Restaurant Menus',
  description: 'Create and manage interactive digital menus for your restaurant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-background">
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
} 