'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { getQRCodes, createQRCode, deleteQRCode, createBatchQRCodes } from '@/app/actions/qrCodes';
import { getMenu } from '@/app/actions/menus';
import { getRestaurant } from '@/app/actions/restaurants';
import QRCodeGenerator from '@/components/qr-code/QRCodeGenerator';
import BatchQRGenerator from '@/components/qr-code/BatchQRGenerator';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/components/ui/useToast';

// Define types for QR codes and responses
interface QRCode {
  id: string;
  menu_id: string;
  restaurant_id: string;
  name: string;
  url: string;
  design: {
    foregroundColor: string;
    backgroundColor: string;
    logoUrl?: string;
    cornerRadius?: number;
    margin: number;
  };
  scan_count?: number;
  views?: number;
  created_at: string;
  updated_at: string;
}

interface QRCodesResponse {
  data: QRCode[] | null;
  error: string | null;
}

export default function QRCodesPage({ params }: { params: { restaurantId: string; menuId: string } }) {
  const { restaurantId, menuId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menufacil.app';
  
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [menu, setMenu] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('existing');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) {
          router.push('/login');
          return;
        }
        
        setIsLoading(true);
        setError(null);
        
        // Load restaurant data
        const restaurantData = await getRestaurant(restaurantId);
        if (!restaurantData) {
          setError('Restaurant not found');
          setIsLoading(false);
          return;
        }
        setRestaurant(restaurantData);
        
        // Load menu data
        const menuData = await getMenu(menuId);
        if (!menuData) {
          setError('Menu not found');
          setIsLoading(false);
          return;
        }
        setMenu(menuData);
        
        // Load QR codes
        try {
          const qrCodesData = await getQRCodes(menuId);
          setQRCodes(qrCodesData);
        } catch (qrError: any) {
          setError(qrError.message || 'Failed to load QR codes');
        }
        
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, restaurantId, menuId, router]);
  
  const handleCreateQR = async (designOptions: any) => {
    try {
      const result = await createQRCode({
        menuId: menuId,
        restaurantId: restaurantId,
        name: designOptions.name || `QR for ${menu?.name}`,
        url: `${baseUrl}/menu/${menuId}`,
        design: {
          foregroundColor: designOptions.foregroundColor,
          backgroundColor: designOptions.backgroundColor,
          logoUrl: designOptions.logoUrl,
          cornerRadius: designOptions.cornerRadius,
          margin: designOptions.margin || 1
        }
      });
      
      if (result && 'error' in result && result.error) {
        toast({
          title: 'Error',
          description: result.error,
          type: 'error'
        });
      } else {
        toast({
          title: 'Success',
          description: 'QR code created successfully',
          type: 'success'
        });
        
        // Refresh QR codes list
        const freshQRCodes = await getQRCodes(menuId);
        setQRCodes(freshQRCodes);
        
        setActiveTab('existing');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create QR code',
        type: 'error'
      });
    }
  };
  
  const handleCreateBatchQRs = async (codes: any[]) => {
    try {
      // Transform codes to match the expected format for batch creation
      const formattedCodes = codes.map(code => ({
        name: code.name,
        url: code.url,
        design: {
          foregroundColor: code.design.foregroundColor,
          backgroundColor: code.design.backgroundColor,
          logoUrl: code.design.logoUrl,
          cornerRadius: code.design.cornerRadius,
          margin: code.design.margin || 1
        }
      }));
      
      // Use the batch creation endpoint
      const results = await createBatchQRCodes(
        restaurantId,
        menuId,
        formattedCodes
      );
      
      if (results) {
        toast({
          title: 'Success',
          description: `${results.length} QR codes created successfully`,
          type: 'success'
        });
        
        // Refresh QR codes list
        const freshQRCodes = await getQRCodes(menuId);
        setQRCodes(freshQRCodes);
        
        setActiveTab('existing');
      } else {
        throw new Error('Failed to create QR codes');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create batch QR codes',
        type: 'error'
      });
    }
  };
  
  const handleDeleteQR = async (qrCodeId: string) => {
    try {
      // Confirm before deleting
      if (!window.confirm('Are you sure you want to delete this QR code?')) {
        return;
      }
      
      await deleteQRCode(qrCodeId, restaurantId, menuId);
      
      toast({
        title: 'Success',
        description: 'QR code deleted successfully',
        type: 'success'
      });
      
      // Refresh the list
      setQRCodes(prev => prev.filter(qr => qr.id !== qrCodeId));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete QR code',
        type: 'error'
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">QR Codes for {menu?.name}</h1>
      
      <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="existing">Existing QR Codes</TabsTrigger>
          <TabsTrigger value="create">Create New QR Code</TabsTrigger>
          <TabsTrigger value="batch">Batch Create QR Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing">
          {qrCodes.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="mb-4">No QR codes yet. Create your first QR code!</p>
              <Button onClick={() => setActiveTab('create')}>Create QR Code</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qrCodes.map((qrCode) => (
                <div key={qrCode.id} className="border rounded-lg p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{qrCode.name}</h3>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => handleDeleteQR(qrCode.id)}
                      aria-label={`Delete ${qrCode.name}`}
                    >
                      X
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex justify-center items-center py-2">
                    <QRCodeSVG 
                      value={qrCode.url}
                      size={150}
                      fgColor={qrCode.design?.foregroundColor || "#000000"}
                      bgColor={qrCode.design?.backgroundColor || "#FFFFFF"}
                      level="M"
                      includeMargin={!!qrCode.design?.margin}
                      id={`qr-${qrCode.id}`}
                    />
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <p>Scans: {qrCode.scan_count || qrCode.views || 0}</p>
                    <p className="truncate">URL: {qrCode.url}</p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(qrCode.url, '_blank')}
                      aria-label="Test QR code"
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Download QR code as PNG
                        try {
                          const svgElement = document.getElementById(`qr-${qrCode.id}`);
                          if (!svgElement) {
                            throw new Error('QR code element not found');
                          }
                          
                          // Open in new tab as fallback
                          window.open(qrCode.url, '_blank');
                        } catch (err) {
                          console.error('Error downloading QR code:', err);
                          // Fallback to opening URL
                          window.open(qrCode.url, '_blank');
                        }
                      }}
                      aria-label="Download QR code"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <QRCodeGenerator 
            menuId={menuId}
            baseUrl={baseUrl}
            menuName={menu?.name}
            restaurantId={restaurantId}
            onSave={handleCreateQR}
          />
        </TabsContent>
        
        <TabsContent value="batch">
          <BatchQRGenerator 
            menuId={menuId}
            baseUrl={baseUrl}
            menuName={menu?.name || ''}
            restaurantId={restaurantId}
            onSave={handleCreateBatchQRs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 