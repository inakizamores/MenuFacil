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
      { url: '/images/logos/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/logos/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/logos/favicon/favicon.ico', sizes: '48x48' }
    ],
    apple: { 
      url: '/images/logos/favicon/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png'
    },
    shortcut: { 
      url: '/images/logos/favicon/favicon-96x96.png',
      sizes: '96x96',
      type: 'image/png'
    },
    other: [
      { 
        rel: 'icon',
        url: '/images/logos/favicon/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      { 
        rel: 'icon',
        url: '/images/logos/favicon/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  manifest: '/images/logos/favicon/site.webmanifest',
  themeColor: '#0057B8',
  appleWebApp: {
    title: 'MenuFacil',
    statusBarStyle: 'black-translucent',
    capable: true,
    startupImage: [
      {
        url: '/images/logos/favicon/apple-touch-icon.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
      }
    ]
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