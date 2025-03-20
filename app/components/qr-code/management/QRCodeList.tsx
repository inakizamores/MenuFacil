'use client';

import { useState, useEffect } from 'react';
import { getMenuQRCodes, deleteQRCode } from '@/actions/qrCodes';
import { QRCode } from '@/app/types/database';
import { Button } from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeListProps {
  menuId: string;
  onCreateNew: () => void;
  onEdit: (qrCode: QRCode) => void;
}

/**
 * QRCodeList Component
 * 
 * Displays a list of QR codes for a menu and provides management options.
 * 
 * @param menuId - The ID of the menu to get QR codes for
 * @param onCreateNew - Callback when the "Create New" button is clicked
 * @param onEdit - Callback when the "Edit" button is clicked for a QR code
 */
const QRCodeList = ({ menuId, onCreateNew, onEdit }: QRCodeListProps) => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch QR codes for the menu
  useEffect(() => {
    const fetchQRCodes = async () => {
      setIsLoading(true);
      try {
        const result = await getMenuQRCodes(menuId);
        if (result.error) {
          setError(result.error);
        } else {
          setQrCodes(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        setError('Failed to load QR codes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCodes();
  }, [menuId]);

  // Delete a QR code
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      const result = await deleteQRCode(id);
      if (result.success) {
        // Remove the deleted QR code from the list
        setQrCodes(qrCodes.filter(qr => qr.id !== id));
      } else {
        setError(result.error || 'Failed to delete QR code');
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      setError('Failed to delete QR code');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4">Loading QR codes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
        <p className="font-medium">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-2">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">QR Codes</h2>
        <Button onClick={onCreateNew}>Create New QR Code</Button>
      </div>

      {qrCodes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No QR codes have been created for this menu yet.</p>
          <Button onClick={onCreateNew}>Create Your First QR Code</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 flex justify-center">
                <QRCodeSVG
                  value={qrCode.url}
                  size={150}
                  bgColor={qrCode.custom_design?.backgroundColor || '#FFFFFF'}
                  fgColor={qrCode.custom_design?.foregroundColor || '#000000'}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg">{qrCode.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <p>Scans: {qrCode.total_views || 0}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(qrCode)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(qrCode.id as string)}
                      disabled={isDeleting === qrCode.id}
                    >
                      {isDeleting === qrCode.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRCodeList; 