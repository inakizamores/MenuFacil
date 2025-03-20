'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/components/ui/useToast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { QRCodeDesignProps } from './QRCodeGenerator';
import { trackQRCodeExport } from '@/app/utils/analytics';

interface BatchQRGeneratorProps {
  menuId: string;
  baseUrl: string;
  menuName: string;
  restaurantId: string;
  onSave: (codes: BatchQRCode[]) => void;
}

interface BatchQRCode {
  name: string;
  url: string;
  design: {
    foregroundColor: string;
    backgroundColor: string;
    logoUrl?: string;
    cornerRadius?: number;
    margin: number;
  };
}

interface DesignOptions {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  cornerRadius?: number;
  margin: number;
}

const MAX_QR_CODES = 50;

export default function BatchQRGenerator({
  menuId,
  baseUrl,
  menuName,
  restaurantId,
  onSave
}: BatchQRGeneratorProps) {
  const { toast } = useToast();
  const [count, setCount] = useState<number>(5);
  const [namePrefix, setNamePrefix] = useState<string>(`${menuName} QR`);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [designOptions, setDesignOptions] = useState<DesignOptions>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    margin: 1,
    cornerRadius: 0
  });
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [generatedCodes, setGeneratedCodes] = useState<BatchQRCode[]>([]);
  
  // Refs for QR code export
  const qrCodeRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Validate count to not exceed maximum
  const validateCount = (value: number) => {
    if (value > MAX_QR_CODES) {
      toast({
        title: "Warning",
        description: `Maximum ${MAX_QR_CODES} QR codes allowed per batch.`,
        type: "warning"
      });
      return MAX_QR_CODES;
    }
    return value;
  };
  
  // Handle count input change
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCount(validateCount(value));
    } else {
      setCount(0);
    }
  };
  
  // Generate QR code previews
  const handleGeneratePreview = () => {
    try {
      if (count <= 0) {
        toast({
          title: "Error",
          description: "Count must be greater than 0",
          type: "error"
        });
        return;
      }
      
      setIsGenerating(true);
      const codes: BatchQRCode[] = [];
      
      for (let i = 0; i < count; i++) {
        const number = startNumber + i;
        codes.push({
          name: `${namePrefix} ${number}`,
          url: `${baseUrl}/menu/${menuId}?qr=${number}`,
          design: { ...designOptions }
        });
      }
      
      setGeneratedCodes(codes);
      setShowPreview(true);
      setIsGenerating(false);
      
      toast({
        title: "Success",
        description: `${count} QR code previews generated.`,
        type: "success"
      });
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate QR code previews",
        type: "error"
      });
      console.error('Error generating previews:', error);
    }
  };
  
  // Save QR codes to database
  const handleSaveToAccount = async () => {
    if (generatedCodes.length === 0) {
      toast({
        title: "Error",
        description: "No QR codes generated to save",
        type: "error"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      await onSave(generatedCodes);
      setIsSaving(false);
      
      // Clear the previews after successful save
      setShowPreview(false);
      setGeneratedCodes([]);
      
      // Track batch QR code creation event
      const analyticsData = {
        count: generatedCodes.length,
        menuId: menuId,
        restaurantId: restaurantId
      };
      
      // Store basic analytics in localStorage for reference
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            `batch_qr_created_${new Date().toISOString()}`, 
            JSON.stringify(analyticsData)
          );
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      toast({
        title: "Success",
        description: `${generatedCodes.length} QR codes saved to your account`,
        type: "success"
      });
    } catch (error: any) {
      setIsSaving(false);
      toast({
        title: "Error",
        description: error.message || "Failed to save QR codes",
        type: "error"
      });
    }
  };
  
  // Export QR codes as ZIP file containing PNGs
  const handleExportZIP = async () => {
    if (generatedCodes.length === 0) {
      toast({
        title: "Error",
        description: "No QR codes generated to export",
        type: "error"
      });
      return;
    }
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("qr-codes");
      
      if (!folder) {
        throw new Error("Failed to create folder in ZIP");
      }
      
      const promises = generatedCodes.map(async (code, index) => {
        try {
          // Get the SVG element for this QR code
          const svgElement = document.getElementById(`batch-qr-${index}`);
          if (!svgElement) {
            throw new Error(`QR code element #batch-qr-${index} not found`);
          }
          
          // Get SVG as string
          const svgData = new XMLSerializer().serializeToString(svgElement);
          
          // Create a canvas to render the SVG
          const canvas = document.createElement("canvas");
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            throw new Error("Could not get canvas context");
          }
          
          // Create Image from SVG
          const img = new Image();
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
          
          return new Promise<void>((resolve) => {
            img.onload = () => {
              // Clear canvas and draw image
              ctx.fillStyle = code.design.backgroundColor;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Convert to blob and add to zip
              canvas.toBlob(blob => {
                if (blob) {
                  folder.file(`${code.name.replace(/[\/\\:*?"<>|]/g, "_")}.png`, blob);
                }
                resolve();
              }, 'image/png');
            };
            
            img.onerror = () => {
              console.error(`Failed to load image for ${code.name}`);
              resolve();
            };
          });
        } catch (err) {
          console.error(`Error processing QR code ${index}:`, err);
          return Promise.resolve(); // Continue with other QR codes
        }
      });
      
      await Promise.all(promises);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${namePrefix}-batch-qr-codes.zip`);
      
      // Track the batch export event
      await trackQRCodeExport('png', 'batch');
      
      toast({
        title: "Success",
        description: `${generatedCodes.length} QR codes exported as ZIP`,
        type: "success"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export QR codes",
        type: "error"
      });
      console.error('Error exporting ZIP:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="qr-count" className="block text-sm font-medium mb-1">
            Number of QR Codes (Max {MAX_QR_CODES})
          </label>
          <Input
            id="qr-count"
            type="number"
            min="1"
            max={MAX_QR_CODES}
            value={count}
            onChange={handleCountChange}
            className="w-full"
            aria-label="Number of QR codes to generate"
            disabled={isGenerating || isSaving}
          />
        </div>
        
        <div>
          <label htmlFor="name-prefix" className="block text-sm font-medium mb-1">
            Name Prefix
          </label>
          <Input
            id="name-prefix"
            type="text"
            value={namePrefix}
            onChange={(e) => setNamePrefix(e.target.value)}
            className="w-full"
            placeholder="QR Code"
            aria-label="Prefix for QR code names"
            disabled={isGenerating || isSaving}
          />
        </div>
        
        <div>
          <label htmlFor="start-number" className="block text-sm font-medium mb-1">
            Start Number
          </label>
          <Input
            id="start-number"
            type="number"
            min="1"
            value={startNumber}
            onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
            className="w-full"
            aria-label="Starting number for QR code sequence"
            disabled={isGenerating || isSaving}
          />
        </div>
        
        <div>
          <label htmlFor="fg-color" className="block text-sm font-medium mb-1">
            Foreground Color
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="fg-color"
              type="color"
              value={designOptions.foregroundColor}
              onChange={(e) => setDesignOptions({...designOptions, foregroundColor: e.target.value})}
              className="w-12 h-10 p-1"
              aria-label="Foreground color for QR codes"
              disabled={isGenerating || isSaving}
            />
            <Input
              type="text"
              value={designOptions.foregroundColor}
              onChange={(e) => setDesignOptions({...designOptions, foregroundColor: e.target.value})}
              className="flex-1"
              placeholder="#000000"
              aria-label="Foreground color hex value"
              disabled={isGenerating || isSaving}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="bg-color" className="block text-sm font-medium mb-1">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="bg-color"
              type="color"
              value={designOptions.backgroundColor}
              onChange={(e) => setDesignOptions({...designOptions, backgroundColor: e.target.value})}
              className="w-12 h-10 p-1"
              aria-label="Background color for QR codes"
              disabled={isGenerating || isSaving}
            />
            <Input
              type="text"
              value={designOptions.backgroundColor}
              onChange={(e) => setDesignOptions({...designOptions, backgroundColor: e.target.value})}
              className="flex-1"
              placeholder="#FFFFFF"
              aria-label="Background color hex value"
              disabled={isGenerating || isSaving}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="corner-radius" className="block text-sm font-medium mb-1">
            Corner Radius
          </label>
          <Input
            id="corner-radius"
            type="number"
            min="0"
            max="50"
            value={designOptions.cornerRadius || 0}
            onChange={(e) => setDesignOptions({...designOptions, cornerRadius: parseInt(e.target.value) || 0})}
            className="w-full"
            aria-label="Corner radius for QR codes"
            disabled={isGenerating || isSaving}
          />
        </div>
        
        <div>
          <label htmlFor="margin" className="block text-sm font-medium mb-1">
            Margin
          </label>
          <Input
            id="margin"
            type="number"
            min="0"
            max="5"
            value={designOptions.margin}
            onChange={(e) => setDesignOptions({...designOptions, margin: parseInt(e.target.value) || 0})}
            className="w-full"
            aria-label="Margin around QR codes"
            disabled={isGenerating || isSaving}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={handleGeneratePreview} 
          disabled={isGenerating || isSaving || count <= 0}
          aria-label="Generate QR code previews"
        >
          {isGenerating ? 'Generating...' : 'Generate Preview'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleSaveToAccount} 
          disabled={isSaving || !showPreview || generatedCodes.length === 0}
          aria-label="Save generated QR codes to account"
        >
          {isSaving ? 'Saving...' : 'Save to Account'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleExportZIP} 
          disabled={isGenerating || !showPreview || generatedCodes.length === 0}
          aria-label="Download QR codes as ZIP file"
        >
          Download as ZIP
        </Button>
      </div>
      
      {showPreview && generatedCodes.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Preview ({generatedCodes.length} QR codes)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {generatedCodes.map((code, index) => (
              <div key={index} className="border rounded-md p-3 flex flex-col items-center">
                <div 
                  ref={(el) => { qrCodeRefs.current[`qr-${index}`] = el; }}
                  className="flex justify-center items-center mb-2"
                >
                  <QRCodeSVG
                    id={`batch-qr-${index}`}
                    value={code.url}
                    size={120}
                    fgColor={code.design.foregroundColor}
                    bgColor={code.design.backgroundColor}
                    level="M"
                    includeMargin={!!code.design.margin}
                  />
                </div>
                <span className="text-xs truncate max-w-full" title={code.name}>
                  {code.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 