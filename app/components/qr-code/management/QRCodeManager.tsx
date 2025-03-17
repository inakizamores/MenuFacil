'use client';

import { useState } from 'react';
import QRCodeList from './QRCodeList';
import QRCodeEditor from './QRCodeEditor';
import QRCodeGenerator, { QRCodeDesignProps } from '../QRCodeGenerator';
import { QRCode } from '@/app/types/database';
import { createQRCode } from '@/actions/qrCodes';

interface QRCodeManagerProps {
  menuId: string;
  menuName: string;
  restaurantId: string;
  baseUrl: string;
}

/**
 * QRCodeManager Component
 * 
 * A comprehensive component for managing QR codes for a menu, including listing, 
 * creating, editing, and deleting QR codes.
 * 
 * @param menuId - The ID of the menu the QR codes are for
 * @param menuName - The name of the menu (used for default QR code names)
 * @param restaurantId - The ID of the restaurant
 * @param baseUrl - The base URL for the menu (used in the QR code URL)
 */
const QRCodeManager = ({ menuId, menuName, restaurantId, baseUrl }: QRCodeManagerProps) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The URL that the QR code will point to
  const menuUrl = `${baseUrl}/menu/${menuId}`;

  const handleCreateQR = () => {
    setView('create');
  };

  const handleEditQR = (qrCode: QRCode) => {
    setSelectedQR(qrCode);
    setView('edit');
  };

  const handleSaveQRCode = async (designOptions: QRCodeDesignProps) => {
    setError(null);
    
    try {
      const result = await createQRCode({
        menuId,
        name: `${menuName} QR Code`,
        design: designOptions,
        url: menuUrl
      });
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      // Go back to list view after successful creation
      setView('list');
    } catch (error) {
      console.error('Error creating QR code:', error);
      setError('Failed to create QR code');
    }
  };

  const handleSaveEdit = () => {
    // Return to list view and refresh the list
    setView('list');
    setSelectedQR(null);
  };

  const handleClose = () => {
    setView('list');
    setSelectedQR(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {view === 'list' && (
        <QRCodeList 
          menuId={menuId} 
          onCreateNew={handleCreateQR}
          onEdit={handleEditQR}
        />
      )}
      
      {view === 'create' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Create New QR Code</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          
          <QRCodeGenerator
            url={menuUrl}
            menuName={menuName}
            restaurantId={restaurantId}
            menuId={menuId}
            onSave={handleSaveQRCode}
          />
        </div>
      )}
      
      {view === 'edit' && selectedQR && (
        <QRCodeEditor
          qrCode={selectedQR}
          onClose={handleClose}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default QRCodeManager; 