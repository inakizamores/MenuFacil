'use client';

import { useState } from 'react';
import { QRCode } from '@/app/types/database';
import { updateQRCode } from '@/actions/qrCodes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QRCodeSVG } from 'qrcode.react';
import { exportQRAsPNG, exportQRAsPDF, exportQRAsSVG } from '@/app/utils/qrCodeExport';
import { QRCodeDesign } from '@/types/qrCode';

interface QRCodeEditorProps {
  qrCode: QRCode;
  onClose: () => void;
  onSave: () => void;
}

/**
 * QRCodeEditor Component
 * 
 * A component for editing an existing QR code.
 * 
 * @param qrCode - The QR code to edit
 * @param onClose - Callback for when the editor is closed
 * @param onSave - Callback for when the QR code is saved
 */
const QRCodeEditor = ({ qrCode, onClose, onSave }: QRCodeEditorProps) => {
  const [name, setName] = useState(qrCode.name);
  const [foregroundColor, setForegroundColor] = useState(qrCode.custom_design?.foregroundColor || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(qrCode.custom_design?.backgroundColor || '#FFFFFF');
  const [margin, setMargin] = useState(qrCode.custom_design?.margin || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateQRCode({
        id: qrCode.id as string,
        name,
        design: {
          foregroundColor,
          backgroundColor,
          margin,
          cornerRadius: qrCode.custom_design?.cornerRadius || 0,
          logoUrl: qrCode.custom_design?.logoUrl
        }
      });

      if (result.error) {
        setError(result.error);
      } else {
        onSave();
      }
    } catch (error) {
      console.error('Error updating QR code:', error);
      setError('Failed to update QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPNG = () => {
    exportQRAsPNG(
      qrCode.url,
      name,
      {
        foregroundColor,
        backgroundColor,
        margin
      }
    );
  };

  const handleExportSVG = () => {
    exportQRAsSVG(
      qrCode.url,
      name,
      {
        foregroundColor,
        backgroundColor,
        margin
      }
    );
  };

  const handleExportPDF = () => {
    exportQRAsPDF(
      qrCode.url,
      name,
      {
        foregroundColor,
        backgroundColor,
        margin
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit QR Code</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                QR Code Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="fgColor" className="block text-sm font-medium text-gray-700 mb-1">
                Foreground Color
              </label>
              <div className="flex space-x-2">
                <input
                  id="fgColor"
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="h-10 w-10 p-0 border border-gray-300 rounded"
                />
                <Input
                  type="text"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex space-x-2">
                <input
                  id="bgColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-10 p-0 border border-gray-300 rounded"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="margin" className="block text-sm font-medium text-gray-700 mb-1">
                Margin Size (0-4)
              </label>
              <input
                id="margin"
                type="range"
                min="0"
                max="4"
                step="1"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-gray-500 mt-1">{margin}</div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center">
          <div className="qr-code-preview p-4 bg-white rounded-lg shadow border border-gray-200 mb-4">
            <QRCodeSVG
              value={qrCode.url}
              size={200}
              bgColor={backgroundColor}
              fgColor={foregroundColor}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="text-sm text-gray-500 mb-4 text-center">
            <p>URL: {qrCode.url}</p>
          </div>
          
          <div className="w-full space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Export Options:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={handleExportPNG} className="w-full">
                PNG
              </Button>
              <Button variant="outline" onClick={handleExportSVG} className="w-full">
                SVG
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="w-full">
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeEditor; 