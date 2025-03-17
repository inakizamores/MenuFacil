'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QRCodeSVG } from 'qrcode.react';
import { createQRCode } from '@/app/actions/qrCodes';
import { exportQRAsPDF } from '@/app/utils/qrCodeExport';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ReactDOMServer from 'react-dom/server';

interface BatchQRGeneratorProps {
  menuId: string;
  menuName: string;
  restaurantId: string;
  baseUrl: string;
  onComplete: () => void;
}

interface BatchQRConfig {
  count: number;
  prefix: string;
  fgColor: string;
  bgColor: string;
}

/**
 * BatchQRGenerator Component
 * 
 * A component for generating multiple QR codes in a batch operation.
 * 
 * @param menuId - The ID of the menu to generate QR codes for
 * @param menuName - The name of the menu (used in QR code names)
 * @param restaurantId - The ID of the restaurant
 * @param baseUrl - The base URL for the QR codes
 * @param onComplete - Callback when the batch operation is completed
 */
const BatchQRGenerator = ({ 
  menuId, 
  menuName, 
  restaurantId, 
  baseUrl,
  onComplete 
}: BatchQRGeneratorProps) => {
  const [config, setConfig] = useState<BatchQRConfig>({
    count: 5,
    prefix: menuName,
    fgColor: '#000000',
    bgColor: '#FFFFFF'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<{id: string, name: string, url: string}[]>([]);
  
  const handleChange = (field: keyof BatchQRConfig, value: string | number) => {
    setConfig({ ...config, [field]: value });
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedCodes([]);
    
    try {
      const results: {id: string, name: string, url: string}[] = [];
      
      // Use batch processing with a limited concurrency to avoid overloading the system
      const batchSize = 5;
      const batches = Math.ceil(config.count / batchSize);
      
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const batchStart = batchIndex * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, config.count);
        const batchPromises: Promise<{id: string, name: string, url: string} | undefined>[] = [];
        
        for (let i = batchStart; i < batchEnd; i++) {
          const name = `${config.prefix} ${i + 1}`;
          
          // Create QR code in database
          const promise = createQRCode({
            menuId,
            name,
            design: {
              foregroundColor: config.fgColor,
              backgroundColor: config.bgColor,
              margin: 1
            },
            url: `${baseUrl}/menu/${menuId}?batch=${i + 1}`
          }).then(result => {
            if (result.error) {
              throw new Error(`Failed to create QR code #${i + 1}: ${result.error}`);
            }
            
            if (result.data) {
              return {
                id: result.data.id as string,
                name: result.data.name,
                url: result.data.url
              };
            }
            return undefined;
          });
          
          batchPromises.push(promise);
        }
        
        // Wait for the current batch to complete
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter((item): item is {id: string, name: string, url: string} => item !== undefined);
        results.push(...validResults);
        
        // Update progress after each batch
        setProgress(Math.round((results.length / config.count) * 100));
        
        // Add a small delay between batches to prevent overwhelming the server
        if (batchIndex < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      setGeneratedCodes(results);
    } catch (error) {
      console.error('Error generating batch QR codes:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadAll = async () => {
    if (!generatedCodes.length) return;
    
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Create a zip file with all QR codes as PNGs
      const zip = new JSZip();
      
      // Process in batches to avoid memory issues
      const batchSize = 10;
      const batches = Math.ceil(generatedCodes.length / batchSize);
      
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, generatedCodes.length);
        const batch = generatedCodes.slice(start, end);
        
        // Process each QR code in the current batch
        await processBatch(batch, zip);
        
        // Update progress
        setProgress(Math.round(((batchIndex + 1) * batchSize / generatedCodes.length) * 100));
      }
      
      // Also generate a PDF with all QR codes
      const pdfBlob = await generateBatchPDF(generatedCodes);
      if (pdfBlob) {
        zip.file('all_qr_codes.pdf', pdfBlob);
      }
      
      // Save the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${config.prefix}_qr_codes.zip`);
    } catch (error) {
      console.error('Error downloading QR codes:', error);
      setError('Failed to download QR codes. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };
  
  const generateBatchPDF = async (codes: { id: string, name: string, url: string }[]) => {
    if (!codes.length) return null;
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const margin = 15; // mm
    const qrSize = 40; // mm
    const itemsPerRow = Math.floor((pageWidth - 2 * margin) / (qrSize + 10));
    const verticalSpacing = 60; // mm (QR code + caption)
    
    let rowIndex = 0;
    let colIndex = 0;
    let currentY = margin;
    
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      
      // Check if we need a new page
      if (currentY + verticalSpacing > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        rowIndex = 0;
        colIndex = 0;
      }
      
      // Render QR code to canvas
      const qrCanvas = document.createElement('canvas');
      // Use React component directly in renderToString
      const svgString = ReactDOMServer.renderToString(
        <QRCodeSVG
          value={code.url}
          size={200}
          level="H"
          includeMargin={true}
          fgColor={config.fgColor}
          bgColor={config.bgColor}
        />
      );
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const ctx = qrCanvas.getContext('2d');
          if (ctx) {
            qrCanvas.width = img.width;
            qrCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve();
          }
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
      });
      
      // Calculate position
      const x = margin + colIndex * (qrSize + 10);
      const y = currentY;
      
      // Add QR code to PDF
      doc.addImage(
        qrCanvas.toDataURL('image/png'), 
        'PNG', 
        x, 
        y, 
        qrSize, 
        qrSize
      );
      
      // Add caption with name and URL
      doc.setFontSize(8);
      doc.text(code.name, x, y + qrSize + 5, { maxWidth: qrSize });
      doc.setFontSize(6);
      doc.text(code.url, x, y + qrSize + 10, { maxWidth: qrSize });
      
      // Update position for next QR code
      colIndex++;
      if (colIndex >= itemsPerRow) {
        colIndex = 0;
        rowIndex++;
        currentY += verticalSpacing;
      }
    }
    
    return doc.output('blob');
  };
  
  // Helper function to process a batch of QR codes
  const processBatch = async (batch: { id: string, name: string, url: string }[], zip: JSZip) => {
    // Process each QR code in the batch
    for (const code of batch) {
      // Render QR code
      const qrCanvas = document.createElement('canvas');
      // Use React component directly in renderToString
      const svgString = ReactDOMServer.renderToString(
        <QRCodeSVG
          value={code.url}
          size={500}
          level="H"
          includeMargin={true}
          fgColor={config.fgColor}
          bgColor={config.bgColor}
        />
      );
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const ctx = qrCanvas.getContext('2d');
          if (ctx) {
            qrCanvas.width = img.width;
            qrCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve();
          }
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
      });
      
      // Convert to PNG and add to zip
      qrCanvas.toBlob((blob) => {
        if (blob) {
          zip.file(`${code.name.replace(/[^a-z0-9]/gi, '_')}.png`, blob);
        }
      }, 'image/png');
    }
  };
  
  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Batch QR Code Generator</h2>
        <Button variant="ghost" size="sm" onClick={onComplete}>
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
          <div className="space-y-4">
            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                Number of QR Codes to Generate
              </label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={config.count}
                onChange={(e) => handleChange('count', parseInt(e.target.value) || 1)}
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">Maximum: 50 QR codes per batch</p>
            </div>
            
            <div>
              <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-1">
                Name Prefix
              </label>
              <Input
                id="prefix"
                type="text"
                value={config.prefix}
                onChange={(e) => handleChange('prefix', e.target.value)}
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">Each QR code will be named "[Prefix] 1", "[Prefix] 2", etc.</p>
            </div>
            
            <div>
              <label htmlFor="fgColor" className="block text-sm font-medium text-gray-700 mb-1">
                Foreground Color
              </label>
              <div className="flex space-x-2">
                <input
                  id="fgColor"
                  type="color"
                  value={config.fgColor}
                  onChange={(e) => handleChange('fgColor', e.target.value)}
                  className="h-10 w-10 p-0 border border-gray-300 rounded"
                />
                <Input
                  type="text"
                  value={config.fgColor}
                  onChange={(e) => handleChange('fgColor', e.target.value)}
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
                  value={config.bgColor}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className="h-10 w-10 p-0 border border-gray-300 rounded"
                />
                <Input
                  type="text"
                  value={config.bgColor}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? `Generating... ${progress}%` : 'Generate QR Codes'}
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Generated QR Codes</h3>
          
          {generatedCodes.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">
                {isGenerating ? 'Generating QR codes...' : 'No QR codes generated yet'}
              </p>
              {isGenerating && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {generatedCodes.length} QR codes generated
                </p>
                <Button onClick={handleDownloadAll} disabled={isGenerating}>
                  {isGenerating ? `Preparing... ${progress}%` : 'Download All (.zip)'}
                </Button>
              </div>
              
              <div className="h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {generatedCodes.slice(0, 6).map((code) => (
                    <div key={code.id} className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-16 h-16 bg-white p-1 border border-gray-200 rounded">
                        <QRCodeSVG
                          value={code.url}
                          size={56}
                          bgColor={config.bgColor}
                          fgColor={config.fgColor}
                          level="H"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {code.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {code.url.substring(0, 20)}...
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {generatedCodes.length > 6 && (
                    <div className="col-span-2 text-center text-gray-500 text-sm">
                      + {generatedCodes.length - 6} more QR codes
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchQRGenerator;