import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastContainer } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MenúFácil - Interactive Restaurant Menu Platform',
  description: 'Create and manage digital menus for your restaurant with QR code generation and real-time updates.',
  keywords: 'restaurant menu, digital menu, QR code menu, food menu, online menu',
  authors: [{ name: 'Iñaki Zamores' }],
  creator: 'Iñaki Zamores',
  publisher: 'MenúFácil',
  openGraph: {
    title: 'MenúFácil - Interactive Restaurant Menu Platform',
    description: 'Create and manage digital menus for your restaurant with QR code generation and real-time updates.',
    url: 'https://menufacil.vercel.app',
    siteName: 'MenúFácil',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenúFácil - Interactive Restaurant Menu Platform',
    description: 'Create and manage digital menus for your restaurant with QR code generation and real-time updates.',
    creator: '@inakizamores',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
        <ToastContainer position="top-right" />
      </body>
    </html>
  );
} 