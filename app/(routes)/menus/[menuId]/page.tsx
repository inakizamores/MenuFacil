'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getCompleteMenu } from '@/app/utils/db';
import { trackQRCodeView } from '@/app/utils/analytics';
import { Menu, MenuCategory, MenuItem } from '@/app/types/database';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicMenuPageProps {
  params: {
    menuId: string;
  };
  searchParams?: {
    qr?: string;
  };
}

const translations = {
  en: {
    loading: 'Loading menu...',
    menuNotFound: 'Menu not found',
    notAvailable: 'This menu is currently unavailable',
    tryAgain: 'Please check the URL or try again later',
    noLongerAvailable: 'The menu you\'re looking for doesn\'t exist or is no longer available',
    poweredBy: 'Menu powered by',
    search: 'Search menu items...',
    filter: 'Filter',
    all: 'All',
    sort: 'Sort by',
    priceAsc: 'Price (Low to High)',
    priceDesc: 'Price (High to Low)',
    dietaryOptions: 'Dietary Options',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten Free',
    clearFilters: 'Clear Filters',
    ingredients: 'Ingredients',
    allergens: 'Allergens',
    sale: 'Sale',
  },
  es: {
    loading: 'Cargando menú...',
    menuNotFound: 'Menú no encontrado',
    notAvailable: 'Este menú no está disponible actualmente',
    tryAgain: 'Por favor, verifica la URL o inténtalo más tarde',
    noLongerAvailable: 'El menú que buscas no existe o ya no está disponible',
    poweredBy: 'Menú impulsado por',
    search: 'Buscar elementos del menú...',
    filter: 'Filtrar',
    all: 'Todos',
    sort: 'Ordenar por',
    priceAsc: 'Precio (Bajo a Alto)',
    priceDesc: 'Precio (Alto a Bajo)',
    dietaryOptions: 'Opciones Dietéticas',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    glutenFree: 'Sin Gluten',
    clearFilters: 'Borrar Filtros',
    ingredients: 'Ingredientes',
    allergens: 'Alérgenos',
    sale: 'Oferta',
  }
};

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<{
    dietary: string[];
    sortBy: 'none' | 'price-asc' | 'price-desc';
  }>({
    dietary: [],
    sortBy: 'none',
  });
  const [language, setLanguage] = useState<'en' | 'es'>('en'); // Default to English
  const t = translations[language];
  
  // Loading state for skeleton screens
  const [categoryLoaded, setCategoryLoaded] = useState<Record<string, boolean>>({});
  
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
          
          // Initialize category loaded states
          const loadedStates: Record<string, boolean> = {};
          sortedCategories.forEach(category => {
            loadedStates[category.id as string] = false;
          });
          setCategoryLoaded(loadedStates);
          
          // Simulate staggered loading for categories
          sortedCategories.forEach((category, index) => {
            setTimeout(() => {
              setCategoryLoaded(prev => ({
                ...prev,
                [category.id as string]: true
              }));
            }, 300 * (index + 1));
          });
        }
        
        // Check browser language for initial language setting
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'es') {
          setLanguage('es');
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
  
  // Filter and sort menu items
  const filteredCategories = useMemo(() => {
    if (!categories) return null;
    
    return categories.map(category => {
      // Filter items
      let filteredItems = [...category.items];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(query) || 
          (item.description && item.description.toLowerCase().includes(query))
        );
      }
      
      // Apply dietary filters
      if (filterOptions.dietary.length > 0) {
        filteredItems = filteredItems.filter(item => {
          if (!item.dietary_options) return false;
          return filterOptions.dietary.some(option => 
            item.dietary_options?.includes(option.toLowerCase())
          );
        });
      }
      
      // Apply sorting
      if (filterOptions.sortBy === 'price-asc') {
        filteredItems.sort((a, b) => {
          const priceA = a.discounted_price ?? a.price;
          const priceB = b.discounted_price ?? b.price;
          return priceA - priceB;
        });
      } else if (filterOptions.sortBy === 'price-desc') {
        filteredItems.sort((a, b) => {
          const priceA = a.discounted_price ?? a.price;
          const priceB = b.discounted_price ?? b.price;
          return priceB - priceA;
        });
      } else {
        // Default sort by original sort_order
        filteredItems.sort((a, b) => a.sort_order - b.sort_order);
      }
      
      return {
        ...category,
        items: filteredItems
      };
    });
  }, [categories, searchQuery, filterOptions]);
  
  const toggleDietaryFilter = useCallback((option: string) => {
    setFilterOptions(prev => {
      const currentFilters = [...prev.dietary];
      const index = currentFilters.indexOf(option);
      
      if (index > -1) {
        currentFilters.splice(index, 1);
      } else {
        currentFilters.push(option);
      }
      
      return {
        ...prev,
        dietary: currentFilters
      };
    });
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilterOptions({
      dietary: [],
      sortBy: 'none'
    });
    setSearchQuery('');
  }, []);
  
  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">{t.loading}</p>
          
          {/* Skeleton menu */}
          <div className="mt-8 mx-auto w-full max-w-md">
            <div className="h-8 bg-gray-200 rounded-md animate-pulse mb-4 w-3/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex min-h-screen items-center justify-center bg-gray-50"
      >
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
            <h2 className="mt-4 text-lg font-bold text-gray-900">{t[error === 'Menu not found' ? 'menuNotFound' : 'notAvailable']}</h2>
            <p className="mt-2 text-gray-600">{t.tryAgain}</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (!menu || !categories) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">{t.menuNotFound}</h2>
          <p className="mt-2 text-gray-600">{t.noLongerAvailable}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Language Toggle - Top right floating button */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
        aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
      >
        {language === 'en' ? 'ES' : 'EN'}
      </button>
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          backgroundColor: menu.restaurant_id ? `var(--primary-color, #4F46E5)` : '#4F46E5',
        }}
        className="py-8 text-white relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">{menu.name}</h1>
          {menu.description && (
            <p className="mt-2 text-white/90 max-w-xl leading-relaxed">{menu.description}</p>
          )}
          
          {/* Search and filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 pr-10 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
              <svg 
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterOptions.sortBy}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-white text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
                aria-label={t.sort}
              >
                <option value="none">{t.sort}</option>
                <option value="price-asc">{t.priceAsc}</option>
                <option value="price-desc">{t.priceDesc}</option>
              </select>
              
              {filterOptions.dietary.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="bg-white/10 text-white rounded-lg px-3 py-2 hover:bg-white/20 transition"
                >
                  {t.clearFilters}
                </button>
              )}
            </div>
          </div>
          
          {/* Dietary filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => toggleDietaryFilter('vegetarian')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                filterOptions.dietary.includes('vegetarian')
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t.vegetarian}
            </button>
            <button
              onClick={() => toggleDietaryFilter('vegan')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                filterOptions.dietary.includes('vegan')
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t.vegan}
            </button>
            <button
              onClick={() => toggleDietaryFilter('gluten free')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                filterOptions.dietary.includes('gluten free')
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t.glutenFree}
            </button>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </motion.header>
      
      {/* Category Navigation */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="no-scrollbar flex overflow-x-auto py-3">
            {filteredCategories?.map((category) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: categoryLoaded[category.id as string] ? 1 : 0, y: categoryLoaded[category.id as string] ? 0 : -10 }}
                transition={{ duration: 0.3 }}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category.id
                    ? 'bg-primary-100 text-primary-700 rounded-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveCategory(category.id as string)}
                disabled={category.items.length === 0}
              >
                {category.name}
                {category.items.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center h-5 w-5 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {category.items.length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {filteredCategories?.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={activeCategory === category.id ? { opacity: 1, y: 0 } : { opacity: 0, height: 0, y: 20 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={`mb-8 scroll-mt-20 overflow-hidden ${
                activeCategory === category.id ? 'block' : 'hidden'
              }`}
            >
              <h2 className="mb-2 text-2xl font-bold text-gray-900">{category.name}</h2>
              
              {category.description && (
                <p className="mb-6 text-gray-600 max-w-3xl">{category.description}</p>
              )}
              
              {category.items.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="group overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-lg"
                    >
                      {item.image_url && (
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {item.discounted_price && (
                            <div className="absolute right-0 top-0 bg-red-500 px-2 py-1 text-xs font-bold text-white">
                              {t.sale}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 text-lg">{item.name}</h3>
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
                        
                        {item.ingredients && item.ingredients.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs font-medium text-gray-700">
                              {t.ingredients}: {item.ingredients.join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-red-600">
                              {t.allergens}: {item.allergens.join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {item.dietary_options && item.dietary_options.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
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
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No items available for this category with the current filters.</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-6 text-center text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-300">
            {t.poweredBy} <span className="font-semibold">MenuFácil</span>
          </p>
        </div>
      </footer>
    </div>
  );
} 