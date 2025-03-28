import { generateMetadata, generateViewport } from '../lib/metadata';

export const metadata = generateMetadata(
  'Dashboard',
  'Manage your restaurant menus and settings'
);

export const viewport = generateViewport();

// ... rest of the dashboard page code ... 