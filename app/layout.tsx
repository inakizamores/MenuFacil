import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/auth-context';
import { Toaster } from 'react-hot-toast';
import GlobalErrorWrapper from './components/GlobalErrorWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MenúFácil - Digital Menus Made Simple',
  description: 'Create beautiful digital menus for your restaurant in minutes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <GlobalErrorWrapper isPageWrapper>
            {children}
          </GlobalErrorWrapper>
          <Analytics />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
} 