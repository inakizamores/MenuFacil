'use client';

import React, { useState, useEffect } from 'react';
import { 
  getBackupStatus, 
  requestManualBackup, 
  enablePITR,
  configureBackups
} from '@/lib/supabase/backups';
import { useAuth } from '@/app/context/auth-context';

/**
 * Database Backup Manager Component
 * Provides admin interface for managing database backups
 */
export default function DatabaseBackupManager() {
  const [loading, setLoading] = useState(true);
  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const { isSystemAdmin } = useAuth();

  // Load backup status on initial render
  useEffect(() => {
    async function loadBackupStatus() {
      try {
        const status = await getBackupStatus();
        setBackupStatus(status);
      } catch (error) {
        console.error('Error loading backup status:', error);
        setMessage({
          text: 'Failed to load backup status',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    }

    loadBackupStatus();
  }, []);

  // Function to handle manual backup request
  const handleManualBackup = async () => {
    try {
      setOperationLoading(true);
      setMessage(null);
      const success = await requestManualBackup();
      
      if (success) {
        setMessage({
          text: 'Manual backup requested successfully',
          type: 'success'
        });
        
        // Refresh backup status
        const status = await getBackupStatus();
        setBackupStatus(status);
      } else {
        setMessage({
          text: 'Failed to request manual backup',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error requesting manual backup:', error);
      setMessage({
        text: 'Error requesting manual backup',
        type: 'error'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  // Function to enable point-in-time recovery
  const handleEnablePITR = async () => {
    try {
      setOperationLoading(true);
      setMessage(null);
      const success = await enablePITR();
      
      if (success) {
        setMessage({
          text: 'Point-in-time recovery enabled successfully',
          type: 'success'
        });
        
        // Refresh backup status
        const status = await getBackupStatus();
        setBackupStatus(status);
      } else {
        setMessage({
          text: 'Failed to enable point-in-time recovery',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error enabling PITR:', error);
      setMessage({
        text: 'Error enabling point-in-time recovery',
        type: 'error'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  // Function to update retention period
  const handleUpdateRetention = async (days: number) => {
    try {
      setOperationLoading(true);
      setMessage(null);
      const success = await configureBackups({
        retentionPeriod: days
      });
      
      if (success) {
        setMessage({
          text: `Retention period updated to ${days} days`,
          type: 'success'
        });
        
        // Refresh backup status
        const status = await getBackupStatus();
        setBackupStatus(status);
      } else {
        setMessage({
          text: 'Failed to update retention period',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating retention period:', error);
      setMessage({
        text: 'Error updating retention period',
        type: 'error'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  // Only allow system admins to access this component
  if (!isSystemAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md text-yellow-800">
        <h3 className="text-lg font-medium">Admin Access Required</h3>
        <p>You need system admin privileges to manage database backups.</p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Database Backup Management</h2>
        <p className="text-gray-600">Configure and monitor database backups</p>
      </div>

      {/* Status information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-3">Backup Status</h3>
        {backupStatus ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Backup:</span>
              <span className="font-medium">
                {backupStatus.lastBackupDate ? new Date(backupStatus.lastBackupDate).toLocaleString() : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">PITR Enabled:</span>
              <span className={`font-medium ${backupStatus.pitrEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {backupStatus.pitrEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Available Backups:</span>
              <span className="font-medium">{backupStatus.backupCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retention Period:</span>
              <span className="font-medium">{backupStatus.retentionPeriod} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${backupStatus.healthy ? 'text-green-600' : 'text-red-600'}`}>
                {backupStatus.healthy ? 'Healthy' : 'Issues Detected'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-yellow-600">
            Unable to retrieve backup status
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Backup Actions</h3>
        
        {/* Message display */}
        {message && (
          <div className={`p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleManualBackup}
            disabled={operationLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {operationLoading ? 'Processing...' : 'Request Manual Backup'}
          </button>
          
          {!backupStatus?.pitrEnabled && (
            <button
              onClick={handleEnablePITR}
              disabled={operationLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {operationLoading ? 'Processing...' : 'Enable Point-in-Time Recovery'}
            </button>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Backup Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retention Period (days)
            </label>
            <div className="flex items-center space-x-2">
              <select
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                defaultValue={backupStatus?.retentionPeriod || 7}
                onChange={(e) => handleUpdateRetention(parseInt(e.target.value))}
                disabled={operationLoading}
              >
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
              <span className="text-sm text-gray-500">
                How long to retain database backups
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 border-t pt-4">
        <p>
          <strong>Note:</strong> Database backups are managed through your Supabase project. 
          Some features may require a Pro plan or higher.
        </p>
      </div>
    </div>
  );
} 