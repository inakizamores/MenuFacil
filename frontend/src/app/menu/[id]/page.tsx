'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Menu } from '@/lib/menus';
import { Category } from '@/lib/categories';
import { Item } from '@/lib/items';

export default function PublicMenuPage() {
  const params = useParams();
  const menuId = params.id as string;
  
  const [menu, setMenu] = useState<Menu | null>(null);
  const [restaurant, setRestaurant] = useState<{ name: string; logo_url: string | null } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load menu details
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select('*, restaurants(name, logo_url)')
          .eq('id', menuId)
          .single();
        
        if (menuError) throw menuError;
        
        setMenu(menuData);
        setRestaurant({
          name: menuData.restaurants.name,
          logo_url: menuData.restaurants.logo_url
        });
        
        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('menu_id', menuId)
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        
        setCategories(categoriesData || []);
        
        if (categoriesData && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
          
          // Load all items for all categories
          const itemsRecord: Record<string, Item[]> = {};
          
          for (const category of categoriesData) {
            const { data: itemsData, error: itemsError } = await supabase
              .from('items')
              .select('*')
              .eq('category_id', category.id)
              .order('display_order', { ascending: true });
            
            if (itemsError) throw itemsError;
            
            itemsRecord[category.id] = itemsData || [];
          }
          
          setItems(itemsRecord);
        }
      } catch (err) {
        console.error('Error loading menu data:', err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [menuId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !menu || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md w-full">
          <p className="font-medium">Error</p>
          <p>{error || 'Menu not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            {restaurant.logo_url && (
              <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden mr-4">
                <img src={restaurant.logo_url} alt={restaurant.name} className="h-12 w-12 object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
              <h2 className="text-sm text-gray-600">{menu.name}</h2>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-3 space-x-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap px-3 py-2 font-medium text-sm rounded-md ${
                  activeCategory === category.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available in this menu.</p>
          </div>
        ) : (
          activeCategory && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {categories.find(c => c.id === activeCategory)?.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items[activeCategory]?.filter(item => item.is_available).map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 flex">
                      {item.image_url && (
                        <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden mr-4">
                          <img src={item.image_url} alt={item.name} className="h-24 w-24 object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                        {item.description && (
                          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                        )}
                        <p className="mt-2 text-primary-600 font-medium">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {items[activeCategory]?.filter(item => item.is_available).length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No items available in this category.</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
} 