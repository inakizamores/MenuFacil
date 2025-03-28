'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DatabaseBackupManager from '@/app/components/DatabaseBackupManager';

export default function DatabaseManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/admindashboard" className="text-neutral-600 hover:text-yellow-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-800">Database Management</h1>
        </div>
      </div>
      
      {/* Introduction */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-2">Database Administration</h2>
        <p className="text-neutral-600">
          Manage database backups, monitor performance, and configure database settings.
          This section provides tools for ensuring data integrity and availability.
        </p>
      </div>
      
      {/* Database Backup Manager */}
      <DatabaseBackupManager />
      
      {/* Database Metrics - This would be implemented in a future update */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Database Metrics</h2>
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Coming Soon</span>
        </div>
        <p className="text-neutral-600 mb-4">
          Advanced metrics and monitoring for database performance will be available in a future update.
        </p>
        <div className="grid grid-cols-3 gap-4 opacity-60">
          <div className="border border-dashed border-neutral-300 rounded-md p-4 flex flex-col items-center justify-center h-32">
            <span className="text-sm font-medium text-neutral-400">Query Performance</span>
          </div>
          <div className="border border-dashed border-neutral-300 rounded-md p-4 flex flex-col items-center justify-center h-32">
            <span className="text-sm font-medium text-neutral-400">Index Utilization</span>
          </div>
          <div className="border border-dashed border-neutral-300 rounded-md p-4 flex flex-col items-center justify-center h-32">
            <span className="text-sm font-medium text-neutral-400">Storage Growth</span>
          </div>
        </div>
      </div>
    </div>
  );
} 