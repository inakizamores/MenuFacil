'use client';

import React from 'react';
import RouteProtection from '@/app/components/RouteProtection';
import DashboardUI from './components/DashboardUI';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtection>
      <DashboardUI>{children}</DashboardUI>
    </RouteProtection>
  );
} 