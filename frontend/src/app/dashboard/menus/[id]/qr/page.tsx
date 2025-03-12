'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getMenu } from '@/lib/menus';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';

export default function MenuQRCodePage() {
  const params = useParams();
  const menuId = params.id as string;
  
  const [menu, setMenu] = useState<{ id: string; name: string; restaurant_id: string } | null>(null);
  const [restaurant, setRestaurant] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState(200);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await getMenu(menuId);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setMenu(data);
          
          // Get restaurant name
          const { data: restaurantData, error: restaurantError } = await fetch(
            `/api/restaurants/${data.restaurant_id}`
          ).then(res => res.json());
          
          if (restaurantError) {
            throw restaurantError;
          }
          
          setRestaurant(restaurantData);
        }
      } catch (err) {
        console.error('Error loading menu data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [menuId]);

  const handleDownload = async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current);
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `${menu?.name.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
      link.click();
    } catch (err) {
      console.error('Error generating QR code image:', err);
      alert('Failed to download QR code. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error || 'Menu not found'}
          </div>
        </div>
      </div>
    );
  }

  const menuUrl = `${window.location.origin}/menu/${menu.id}`;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              QR Code for {menu.name}
            </h2>
            {restaurant && (
              <p className="mt-1 text-sm text-gray-500">{restaurant.name}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div 
                ref={qrRef} 
                className="p-6 rounded-lg border border-gray-200"
                style={{ backgroundColor: bgColor }}
              >
                <QRCode 
                  value={menuUrl} 
                  size={qrSize} 
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Scan this QR code to view the menu
              </p>
              <button
                onClick={handleDownload}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Download QR Code
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customize QR Code</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="qr-size" className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <input
                  type="range"
                  id="qr-size"
                  min="100"
                  max="400"
                  step="10"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="mt-1 block w-full"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700">
                  Background Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="color"
                    id="bg-color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-8 rounded-md border border-gray-300"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="fg-color" className="block text-sm font-medium text-gray-700">
                  Foreground Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="color"
                    id="fg-color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-8 w-8 rounded-md border border-gray-300"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="menu-url" className="block text-sm font-medium text-gray-700">
                  Menu URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="menu-url"
                    value={menuUrl}
                    readOnly
                    className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(menuUrl);
                      alert('URL copied to clipboard!');
                    }}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 