'use client';

import React, { useState } from 'react';
import PublishMenu from './PublishMenu';
import QRCodeGenerator, { QRCodeDesignProps } from '../qr-code/QRCodeGenerator';
import { createQRCode } from '@/actions/qrCodes';

interface PublishMenuWithQRProps {
  menuId: string;
  isActive: boolean;
  menuName: string;
  restaurantId: string;
  baseUrl: string;
  onSuccess: () => void;
}

/**
 * PublishMenuWithQR Component
 * 
 * A component that combines menu publishing with QR code generation.
 * Provides a complete workflow for publishing a menu and generating a QR code.
 *
 * @param menuId - The ID of the menu to publish/unpublish
 * @param isActive - Whether the menu is currently active/published
 * @param menuName - The name of the menu for display
 * @param restaurantId - The ID of the restaurant the menu belongs to
 * @param baseUrl - The base URL for the QR code to link to
 * @param onSuccess - Callback when publish/unpublish succeeds
 */
const PublishMenuWithQR = ({
  menuId,
  isActive,
  menuName,
  restaurantId,
  baseUrl,
  onSuccess
}: PublishMenuWithQRProps) => {
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [qrSaveError, setQRSaveError] = useState<string | null>(null);
  
  // The URL that the QR code will point to
  const menuUrl = `${baseUrl}/menu/${menuId}`;
  
  /**
   * Handle successful menu publication
   * Shows the QR code generator after successful publication
   */
  const handlePublishSuccess = () => {
    setShowQRGenerator(true);
    onSuccess();
  };
  
  /**
   * Handle QR code save
   * Creates a new QR code in the database
   */
  const handleSaveQRCode = async (designOptions: QRCodeDesignProps) => {
    setQRSaveError(null);
    
    try {
      const result = await createQRCode({
        menuId,
        name: `${menuName} QR Code`,
        design: designOptions,
        url: menuUrl
      });
      
      if (result.error) {
        setQRSaveError(result.error || 'Failed to save QR code');
        return;
      }
      
      // QR code saved successfully
      setShowQRGenerator(false);
    } catch (error) {
      console.error('Error saving QR code:', error);
      setQRSaveError('An unexpected error occurred');
    }
  };
  
  return (
    <div className="space-y-8">
      <PublishMenu
        menuId={menuId}
        isActive={isActive}
        menuName={menuName}
        onSuccess={handlePublishSuccess}
      />
      
      {isActive && (
        <div>
          {showQRGenerator ? (
            <div className="mt-8">
              {qrSaveError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {qrSaveError}
                </div>
              )}
              
              <QRCodeGenerator
                url={menuUrl}
                menuName={menuName}
                restaurantId={restaurantId}
                menuId={menuId}
                onSave={handleSaveQRCode}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">QR Code Management</h2>
              <p className="text-gray-700 mb-4">
                Generate a QR code for this menu to allow customers to easily access it.
              </p>
              <button
                onClick={() => setShowQRGenerator(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate QR Code
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublishMenuWithQR; 