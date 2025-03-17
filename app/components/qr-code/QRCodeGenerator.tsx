'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { exportQRAsPNG, exportQRAsPDF, exportQRAsSVG } from '@/app/utils/qrCodeExport';
import { QRCodeDesign } from '@/types/qrCode';

interface QRCodeGeneratorProps {
  url: string;
  menuName: string;
  restaurantId: string;
  menuId: string;
  onSave: (designOptions: QRCodeDesignProps) => Promise<void>;
}

export interface QRCodeDesignProps {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  cornerRadius?: number;
  margin: number;
}

const QRCodeGenerator = ({
  url,
  menuName,
  restaurantId,
  menuId,
  onSave
}: QRCodeGeneratorProps) => {
  const [designOptions, setDesignOptions] = useState<QRCodeDesignProps>({
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    margin: 1,
    cornerRadius: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [qrName, setQrName] = useState(`${menuName} QR Code`);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(designOptions);
    } catch (error) {
      console.error('Error saving QR code:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExportPNG = () => {
    exportQRAsPNG(
      url,
      qrName,
      {
        foregroundColor: designOptions.foregroundColor,
        backgroundColor: designOptions.backgroundColor,
        margin: designOptions.margin
      }
    );
  };

  const handleExportSVG = () => {
    exportQRAsSVG(
      url,
      qrName,
      {
        foregroundColor: designOptions.foregroundColor,
        backgroundColor: designOptions.backgroundColor,
        margin: designOptions.margin
      }
    );
  };

  const handleExportPDF = () => {
    exportQRAsPDF(
      url,
      qrName,
      {
        foregroundColor: designOptions.foregroundColor,
        backgroundColor: designOptions.backgroundColor,
        margin: designOptions.margin
      }
    );
  };
  
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">QR Code Generator</h3>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* QR Code Preview */}
        <div className="flex-1 flex flex-col items-center">
          <div className="qr-code-container p-4 bg-white rounded-lg shadow mb-4">
            <QRCodeSVG
              value={url}
              size={200}
              bgColor={designOptions.backgroundColor}
              fgColor={designOptions.foregroundColor}
              level="H"
              includeMargin={true}
              className="mx-auto"
            />
          </div>
          <div className="mt-4 w-full space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Export Options:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={handleExportPNG}>
                PNG
              </Button>
              <Button variant="outline" onClick={handleExportSVG}>
                SVG
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                PDF
              </Button>
            </div>
          </div>
        </div>
        
        {/* Customization Options */}
        <div className="flex-1">
          <div className="space-y-4">
            <div>
              <label htmlFor="qrName" className="block text-sm font-medium text-gray-700 mb-1">
                QR Code Name
              </label>
              <Input
                id="qrName"
                type="text"
                value={qrName}
                onChange={(e) => setQrName(e.target.value)}
                className="w-full"
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
                  value={designOptions.foregroundColor}
                  onChange={(e) => setDesignOptions({...designOptions, foregroundColor: e.target.value})}
                  className="h-10 w-10 p-0 border border-gray-300 rounded"
                />
                <Input
                  type="text"
                  value={designOptions.foregroundColor}
                  onChange={(e) => setDesignOptions({...designOptions, foregroundColor: e.target.value})}
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
                  value={designOptions.backgroundColor}
                  onChange={(e) => setDesignOptions({...designOptions, backgroundColor: e.target.value})}
                  className="h-10 w-10 p-0 border border-gray-300 rounded"
                />
                <Input
                  type="text"
                  value={designOptions.backgroundColor}
                  onChange={(e) => setDesignOptions({...designOptions, backgroundColor: e.target.value})}
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
                value={designOptions.margin}
                onChange={(e) => setDesignOptions({...designOptions, margin: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-gray-500 mt-1">{designOptions.margin}</div>
            </div>
            
            <div className="mt-6">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save QR Code'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator; 