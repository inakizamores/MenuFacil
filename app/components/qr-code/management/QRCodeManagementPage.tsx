'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import QRCodeGenerator from '@/components/qr-code/QRCodeGenerator';
import { getQRCodes, deleteQRCode } from '@/app/actions/qrCodes';
import { QRCode } from '@/app/types/qrCode';
import { Trash2, Download, Plus, BarChart, Copy } from 'lucide-react';
import BatchQRGenerator from './BatchQRGenerator';
import { exportQRAsPNG, exportQRAsSVG, exportQRAsPDF } from '@/app/utils/qrCodeExport';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/components/ui/useToast';

interface QRCodeManagementPageProps {
  menuId: string;
  menuName: string;
  restaurantId: string;
  baseUrl: string;
}

/**
 * QRCodeManagementPage Component
 * 
 * A comprehensive page for managing QR codes for a specific menu,
 * including creation, batch generation, listing, and analytics.
 */
const QRCodeManagementPage = ({
  menuId,
  menuName,
  restaurantId,
  baseUrl
}: QRCodeManagementPageProps) => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('existing');
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadQRCodes();
  }, [menuId]);
  
  const loadQRCodes = async () => {
    setIsLoading(true);
    try {
      const result = await getQRCodes(menuId);
      if (result.data) {
        setQRCodes(result.data);
      }
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QR codes',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (qrCodeId: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;
    
    try {
      const result = await deleteQRCode(qrCodeId);
      if (result.success) {
        setQRCodes(prev => prev.filter(code => code.id !== qrCodeId));
        toast({
          title: 'Success',
          description: 'QR code deleted successfully',
          type: 'success',
        });
      } else {
        throw new Error(result.error || 'Failed to delete QR code');
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete QR code',
        type: 'error',
      });
    }
  };
  
  const handleQRCreated = (newQRCode: QRCode) => {
    setQRCodes(prev => [...prev, newQRCode]);
    setActiveTab('existing');
    toast({
      title: 'Success',
      description: 'New QR code created successfully',
      type: 'success',
    });
  };
  
  const handleExport = async (qrCode: QRCode, format: 'png' | 'svg' | 'pdf') => {
    try {
      switch (format) {
        case 'png':
          await exportQRAsPNG(qrCode.url, qrCode.name, qrCode.design);
          break;
        case 'svg':
          await exportQRAsSVG(qrCode.url, qrCode.name, qrCode.design);
          break;
        case 'pdf':
          await exportQRAsPDF(qrCode.url, qrCode.name, qrCode.design);
          break;
      }
      
      toast({
        title: 'Success',
        description: `QR code exported as ${format.toUpperCase()}`,
        type: 'success',
      });
    } catch (error) {
      console.error(`Error exporting QR code as ${format}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to export QR code',
        type: 'error',
      });
    }
  };
  
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL Copied',
      description: 'QR code URL copied to clipboard',
      type: 'info',
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">QR Codes for {menuName}</h1>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setShowBatchGenerator(true)}
            disabled={showBatchGenerator}
          >
            <Plus className="mr-2 h-4 w-4" />
            Batch Generate
          </Button>
        </div>
      </div>
      
      {showBatchGenerator ? (
        <BatchQRGenerator
          menuId={menuId}
          menuName={menuName}
          restaurantId={restaurantId}
          baseUrl={baseUrl}
          onComplete={() => {
            setShowBatchGenerator(false);
            loadQRCodes();
          }}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="existing">Existing QR Codes</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Codes Yet</h3>
                <p className="text-gray-500 mb-6">Create your first QR code for this menu</p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create QR Code
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrCodes.map((qrCode) => (
                  <Card key={qrCode.id} className="p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium">{qrCode.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(qrCode.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-center mb-4">
                      <div className="p-2 bg-white border rounded">
                        <QRCodeSVG
                          value={qrCode.url}
                          size={150}
                          bgColor={qrCode.design?.backgroundColor || '#FFFFFF'}
                          fgColor={qrCode.design?.foregroundColor || '#000000'}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4 text-sm">
                      <div className="truncate flex-1">
                        {qrCode.url}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 ml-2 flex-shrink-0"
                        onClick={() => copyUrl(qrCode.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      <div>Created: {new Date(qrCode.createdAt).toLocaleDateString()}</div>
                      <div>Views: {qrCode.views || 0}</div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="px-2"
                          onClick={() => handleExport(qrCode, 'png')}
                        >
                          PNG
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="px-2"
                          onClick={() => handleExport(qrCode, 'svg')}
                        >
                          SVG
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="px-2"
                          onClick={() => handleExport(qrCode, 'pdf')}
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <Card className="p-6">
              <QRCodeGenerator 
                menuId={menuId}
                baseUrl={baseUrl}
                onQRCreated={handleQRCreated}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">QR Code Analytics</h2>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Total QR Codes</div>
                  <div className="text-3xl font-bold">{qrCodes.length}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Total Scans</div>
                  <div className="text-3xl font-bold">
                    {qrCodes.reduce((sum, code) => sum + (code.views || 0), 0)}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Average Scans per Code</div>
                  <div className="text-3xl font-bold">
                    {qrCodes.length > 0 
                      ? Math.round(qrCodes.reduce((sum, code) => sum + (code.views || 0), 0) / qrCodes.length) 
                      : 0}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Most Scanned QR Codes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scans
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {qrCodes
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 5)
                      .map((qrCode) => (
                        <tr key={qrCode.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{qrCode.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{new Date(qrCode.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{qrCode.views || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="link" size="sm" className="text-primary">
                              <BarChart className="mr-1 h-4 w-4" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default QRCodeManagementPage; 