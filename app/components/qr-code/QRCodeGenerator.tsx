'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { exportQRAsPNG, exportQRAsPDF, exportQRAsSVG } from '@/app/utils/qrCodeExport';
import { QRCodeDesign } from '@/types/qrCode';
import { qrCodeSchema, QRCodeFormValues } from '@/lib/validation/schemas';
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/app/components/ui/form';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';

interface QRCodeGeneratorProps {
  url: string;
  menuName: string;
  restaurantId: string;
  menuId: string;
  onSave: (values: any) => Promise<void>;
}

const QRCodeGenerator = ({
  url,
  menuName,
  restaurantId,
  menuId,
  onSave
}: QRCodeGeneratorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize the form with default values
  const form = useForm<QRCodeFormValues>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues: {
      name: `${menuName} QR Code`,
      description: '',
      tableNumber: '',
      isActive: true,
      customDesign: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        margin: 1,
        cornerRadius: 0,
      }
    }
  });
  
  // Get the current form values for the QR code preview
  const watchedValues = form.watch();
  
  const handleSave = async (data: QRCodeFormValues) => {
    setIsSaving(true);
    try {
      // Transform the form data to match the format expected by the server action
      const legacyFormat = {
        menuId,
        restaurantId,
        name: data.name,
        url, // Use the URL provided in props
        design: {
          foregroundColor: data.customDesign.foregroundColor,
          backgroundColor: data.customDesign.backgroundColor,
          margin: data.customDesign.margin,
          cornerRadius: data.customDesign.cornerRadius,
          logoUrl: data.customDesign.logoUrl
        }
      };
      
      await onSave(legacyFormat);
    } catch (error) {
      console.error('Error saving QR code:', error);
      form.setError('root', { 
        type: 'manual',
        message: 'Failed to save QR code. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExportPNG = () => {
    exportQRAsPNG(
      url,
      watchedValues.name,
      watchedValues.customDesign
    );
  };

  const handleExportSVG = () => {
    exportQRAsSVG(
      url,
      watchedValues.name,
      watchedValues.customDesign
    );
  };

  const handleExportPDF = () => {
    exportQRAsPDF(
      url,
      watchedValues.name,
      watchedValues.customDesign
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
              bgColor={watchedValues.customDesign.backgroundColor}
              fgColor={watchedValues.customDesign.foregroundColor}
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
        
        {/* Customization Form with Zod Validation */}
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
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
              
              {/* Form root error display */}
              {form.formState.errors.root && (
                <div className="text-red-500 text-sm">{form.formState.errors.root.message}</div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save QR Code'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator; 