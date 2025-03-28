'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import RouteProtection from '@/app/components/RouteProtection';
import LogoutButton from '@/app/components/LogoutButton';
import { 
  getUserRoleDisplay, 
  isRestaurantStaff, 
  isRestaurantOwner, 
  isSystemAdmin 
} from '@/types/user-roles';
import { useStaffRestaurant } from '@/app/hooks/useStaffRestaurant';

// Icons (using Heroicons classes with Tailwind)
export const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

export const RestaurantsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v10a1 1 0 001 1h14a1 1 0 001-1V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
  </svg>
);

export const MenusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);

export const QRCodesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm1 7a1 1 0 011-1h4a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" />
    <path d="M11 4a1 1 0 100 2h4a1 1 0 100-2h-4zM11 10a1 1 0 100 2h4a1 1 0 100-2h-4zM13 15a1 1 0 102 0v-3a1 1 0 00-2 0v3z" />
  </svg>
);

export const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

export const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

export const MobileMenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

type NavItem = {
  name: string;
  href: string;
  icon: React.FC;
  requiredRoles?: Array<'owner' | 'admin' | 'staff'>;
  subItems?: Array<{ name: string; href: string }>;
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { 
    name: 'Restaurants', 
    href: '/dashboard/restaurants', 
    icon: RestaurantsIcon, 
    requiredRoles: ['owner', 'admin'] 
  },
  { 
    name: 'Menus', 
    href: '/dashboard/menus', 
    icon: MenusIcon 
  },
  { 
    name: 'QR Codes', 
    href: '/dashboard/qr-codes', 
    icon: QRCodesIcon 
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: AnalyticsIcon, 
    requiredRoles: ['owner', 'admin'] 
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: SettingsIcon,
    subItems: [
      { name: 'General', href: '/dashboard/settings' },
      { name: 'Profile', href: '/dashboard/settings/profile' }
    ]
  },
];

export default function DashboardUI({ children }: { children: React.ReactNode }) {
  // ... rest of the DashboardUI component implementation ...
} 