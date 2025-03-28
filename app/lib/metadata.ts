import { Metadata, Viewport } from 'next';

// Base metadata that's common across all pages
export const baseMetadata: Metadata = {
  title: {
    template: '%s | MenuFacil',
    default: 'MenuFacil - Restaurant Menu Management Made Easy',
  },
  description: 'MenuFacil helps restaurants create, manage, and share their menus digitally with QR codes and real-time updates.',
  applicationName: 'MenuFacil',
  authors: [{ name: 'MenuFacil Team' }],
  generator: 'Next.js',
  keywords: ['restaurant', 'menu', 'qr code', 'digital menu', 'food service'],
  referrer: 'origin-when-cross-origin',
  robots: 'index, follow',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

// Base viewport configuration
export const baseViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

// Helper to generate metadata for a specific page
export const generateMetadata = (
  pageTitle: string,
  pageDescription?: string,
  additionalMetadata: Partial<Metadata> = {}
): Metadata => {
  return {
    ...baseMetadata,
    title: pageTitle,
    description: pageDescription || baseMetadata.description,
    ...additionalMetadata,
  };
};

// Helper to generate viewport for a specific page
export const generateViewport = (
  additionalViewport: Partial<Viewport> = {}
): Viewport => {
  return {
    ...baseViewport,
    ...additionalViewport,
  };
}; 