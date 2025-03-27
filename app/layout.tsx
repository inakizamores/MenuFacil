import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/auth-context';
import { Toaster } from 'react-hot-toast';
import GlobalErrorWrapper from './components/GlobalErrorWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MenuFacil - Digital Menus Made Simple',
  description: 'Create beautiful digital menus for your restaurant in minutes',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5
  },
  icons: {
    icon: [
      { url: '/images/logos/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/images/logos/favicon/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/images/logos/favicon/favicon.ico', sizes: 'any' }
    ],
    apple: '/images/logos/favicon/apple-touch-icon.png',
    shortcut: '/images/logos/favicon/apple-touch-icon.png'
  },
  manifest: '/images/logos/favicon/site.webmanifest',
  themeColor: '#0057B8',
  appleWebApp: {
    title: 'MenuFacil',
    statusBarStyle: 'black-translucent'
  }
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