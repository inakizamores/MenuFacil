'use client';

import { useState, useEffect } from 'react';
import { getCompleteMenu } from '@/app/utils/db';
import { trackQRCodeView } from '@/app/utils/analytics';
import { Menu, MenuCategory, MenuItem } from '@/app/types/database';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PublicMenuPageProps {
  params: {
    menuId: string;
  };
  searchParams?: {
    qr?: string;
  };
}

export default function PublicMenuPage({ params, searchParams }: PublicMenuPageProps) {
  const { menuId } = params;
  const qrCodeId = searchParams?.qr;
  const clientSearchParams = useSearchParams();
  const source = clientSearchParams.get('source') || 'direct';
  
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<(MenuCategory & { items: MenuItem[] })[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Track QR code view if qrCodeId is provided
        if (qrCodeId) {
          await trackQRCodeView({
            qrId: qrCodeId,
            source: source as 'scan' | 'direct' | 'share',
            location: window.location.href
          });
        }
        
        // Fetch menu data
        const { menu: menuData, categories: categoriesData } = await getCompleteMenu(menuId);
        
        if (!menuData) {
          setError('Menu not found');
          setIsLoading(false);
          return;
        }
        
        if (!menuData.is_active) {
          setError('This menu is currently unavailable');
          setIsLoading(false);
          return;
        }
        
        setMenu(menuData);
        
        if (categoriesData) {
          // Sort categories by sort_order
          const sortedCategories = [...categoriesData].sort((a, b) => a.sort_order - b.sort_order);
          setCategories(sortedCategories);
          
          // Set the first category as active
          if (sortedCategories.length > 0) {
            setActiveCategory(sortedCategories[0].id as string);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to load menu. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [menuId, qrCodeId, source]);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-red-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h2 className="mt-4 text-lg font-bold text-gray-900">{error}</h2>
            <p className="mt-2 text-gray-600">Please check the URL or try again later.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!menu || !categories) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Menu not found</h2>
          <p className="mt-2 text-gray-600">The menu you're looking for doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">{menu.name}</h1>
          {menu.description && (
            <p className="mt-2 text-sm text-white/80">{menu.description}</p>
          )}
        </div>
      </header>
      
      {/* Category Navigation */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="no-scrollbar flex overflow-x-auto py-3">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category.id
                    ? 'bg-primary-100 text-primary-700 rounded-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveCategory(category.id as string)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {categories.map((category) => (
          <div
            key={category.id}
            id={`category-${category.id}`}
            className={`mb-8 scroll-mt-20 ${
              activeCategory === category.id ? 'block' : 'hidden'
            }`}
          >
            <h2 className="mb-4 text-xl font-bold text-gray-900">{category.name}</h2>
            
            {category.description && (
              <p className="mb-4 text-gray-600">{category.description}</p>
            )}
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md"
                >
                  {item.image_url && (
                    <div className="relative h-40 w-full">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      {item.discounted_price && (
                        <div className="absolute right-0 top-0 bg-red-500 px-2 py-1 text-xs font-bold text-white">
                          Sale
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <div className="text-right">
                        {item.discounted_price ? (
                          <>
                            <span className="text-sm font-medium text-gray-500 line-through">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="ml-2 font-bold text-red-600">
                              ${item.discounted_price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{item.description}</p>
                    )}
                    
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-red-600">
                          Allergens: {item.allergens.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {item.dietary_options && item.dietary_options.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.dietary_options.map((option, index) => (
                          <span
                            key={index}
                            className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-6 text-center text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-300">
            Menu powered by <span className="font-semibold">MenuFácil</span>
          </p>
        </div>
      </footer>
    </div>
  );
} 