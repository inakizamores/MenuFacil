'use client';

import { useState } from 'react';
import { QRCode } from '@/app/types/database';
import { updateQRCode } from '@/actions/qrCodes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QRCodeSVG } from 'qrcode.react';
import { exportQRAsPNG, exportQRAsPDF, exportQRAsSVG } from '@/app/utils/qrCodeExport';
import { QRCodeDesign } from '@/types/qrCode';
import { qrCodeSchema, QRCodeFormValues } from '@/lib/validation/schemas';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/app/components/ui/form';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form with values from the existing QR code
  const form = useForm<QRCodeFormValues>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues: {
      name: qrCode.name,
      description: qrCode.description || '',
      tableNumber: qrCode.table_number || '',
      isActive: qrCode.is_active !== undefined ? qrCode.is_active : true,
      customDesign: {
        foregroundColor: qrCode.custom_design?.foregroundColor || '#000000',
        backgroundColor: qrCode.custom_design?.backgroundColor || '#FFFFFF',
        margin: qrCode.custom_design?.margin || 1,
        cornerRadius: qrCode.custom_design?.cornerRadius || 0,
        logoUrl: qrCode.custom_design?.logoUrl || undefined
      }
    }
  });
  
  // Get the current form values for the QR code preview
  const watchedValues = form.watch();
  
  const handleSubmit = async (data: QRCodeFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert form data to match what updateQRCode expects in actions/qrCodes.ts
      const result = await updateQRCode({
        id: qrCode.id as string,
        name: data.name,
        design: {
          foregroundColor: data.customDesign.foregroundColor,
          backgroundColor: data.customDesign.backgroundColor,
          margin: data.customDesign.margin,
          cornerRadius: data.customDesign.cornerRadius,
          logoUrl: data.customDesign.logoUrl
        }
      });

      if (result && !result.error) {
        onSave();
      } else {
        setError(result?.error || 'Failed to update QR code');
      }
    } catch (error) {
      console.error('Error updating QR code:', error);
      setError('Failed to update QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPNG = () => {
    exportQRAsPNG(
      qrCode.url,
      watchedValues.name,
      watchedValues.customDesign
    );
  };

  const handleExportSVG = () => {
    exportQRAsSVG(
      qrCode.url,
      watchedValues.name,
      watchedValues.customDesign
    );
  };

  const handleExportPDF = () => {
    exportQRAsPDF(
      qrCode.url,
      watchedValues.name,
      watchedValues.customDesign
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* QR Code Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: ControllerRenderProps<QRCodeFormValues, 'name'> }) => (
                <FormItem>
                  <FormLabel>QR Code Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: ControllerRenderProps<QRCodeFormValues, 'description'> }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add a description for this QR code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Table Number */}
            <FormField
              control={form.control}
              name="tableNumber"
              render={({ field }: { field: ControllerRenderProps<QRCodeFormValues, 'tableNumber'> }) => (
                <FormItem>
                  <FormLabel>Table Number (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Table 12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Foreground Color */}
            <FormField
              control={form.control}
              name="customDesign.foregroundColor"
              render={({ field }: { field: ControllerRenderProps<QRCodeFormValues, 'customDesign.foregroundColor'> }) => (
                <FormItem>
                  <FormLabel>Foreground Color</FormLabel>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-10 w-10 p-0 border border-gray-300 rounded"
                    />
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Background Color */}
            <FormField
              control={form.control}
              name="customDesign.backgroundColor"
              render={({ field }: { field: ControllerRenderProps<QRCodeFormValues, 'customDesign.backgroundColor'> }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-10 w-10 p-0 border border-gray-300 rounded"
                    />
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Margin Size */}
            <FormField
              control={form.control}
              name="customDesign.margin"
              render={({ field }: { field: ControllerRenderProps<QRCodeFormValues, 'customDesign.margin'> }) => (
                <FormItem>
                  <FormLabel>Margin Size (0-4)</FormLabel>
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-500">{field.value}</div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }: { field: ControllerRenderProps<QRCodeFormValues, 'isActive'> }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Whether this QR code is active and can be used
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
              bgColor={watchedValues.customDesign.backgroundColor}
              fgColor={watchedValues.customDesign.foregroundColor}
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