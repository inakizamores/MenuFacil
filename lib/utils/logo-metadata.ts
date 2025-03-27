import { Metadata } from 'next';

/**
 * MenuFacil default logo and favicon metadata for SEO and browsers
 * Follows Next.js 14 best practices for logo and favicon implementation
 */
export const getDefaultLogoMetadata = (): Partial<Metadata> => {
  return {
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
};

/**
 * MenuFacil application title metadata
 */
export const getApplicationTitleMetadata = (pageName?: string): Partial<Metadata> => {
  const baseTitle = 'MenuFacil - Digital Menus Made Simple';
  return {
    title: pageName ? `${pageName} | ${baseTitle}` : baseTitle,
    description: 'Create beautiful digital menus for your restaurant in minutes',
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5
    }
  };
};

/**
 * Complete metadata for a MenuFacil page
 */
export const getCompleteMetadata = (pageName?: string): Metadata => {
  return {
    ...getApplicationTitleMetadata(pageName),
    ...getDefaultLogoMetadata()
  } as Metadata;
}; 