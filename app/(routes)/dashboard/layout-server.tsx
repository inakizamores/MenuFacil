import { generateMetadata, generateViewport } from '@/app/lib/metadata';
import DashboardLayout from './layout-client';

export const metadata = generateMetadata(
  'Dashboard',
  'Manage your restaurant menus and settings'
);

export const viewport = generateViewport();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 