'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    viewDetails: 'View Details',
    close: 'Close',
    addToOrder: 'Add to Order',
    backToMenu: 'Back to Menu',
    mobileView: 'Mobile View',
    desktopView: 'Desktop View',
    openMenu: 'Open Menu',
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
    viewDetails: 'Ver Detalles',
    close: 'Cerrar',
    addToOrder: 'Agregar al pedido',
    backToMenu: 'Volver al menú',
    mobileView: 'Vista Móvil',
    desktopView: 'Vista Escritorio',
    openMenu: 'Abrir Menú',
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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];
  
  // Refs for scroll restoration
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Check initially
    checkIfMobile();
    
    // Update on resize
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
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
            }, 200 * (index + 1));
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

  const toggleViewMode = useCallback(() => {
    setIsMobileView(prev => !prev);
  }, []);
  
  const handleItemClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
  }, []);
  
  const closeItemDetails = useCallback(() => {
    setSelectedItem(null);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 pt-16">
        <div className="w-full max-w-4xl px-4">
          {/* Logo/Brand placeholder */}
          <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-gray-200 mb-6"></div>
          
          {/* Menu title skeleton */}
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-4 w-3/4 mx-auto"></div>
          
          {/* Menu description skeleton */}
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse mb-8 w-1/2 mx-auto"></div>
          
          {/* Search bar skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-6 w-full"></div>
          
          {/* Category tabs skeleton */}
          <div className="flex gap-2 mb-8 overflow-x-auto py-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse w-24 flex-shrink-0"></div>
            ))}
          </div>
          
          {/* Menu items skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                {/* Item image skeleton */}
                <div className="h-48 bg-gray-200"></div>
                
                {/* Item details skeleton */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
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
  
  // Item detail modal component
  const ItemDetailModal = ({ item }: { item: MenuItem }) => {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={closeItemDetails}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Item image */}
          {item.image_url && (
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              {item.discounted_price && (
                <div className="absolute right-0 top-0 bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  {t.sale}
                </div>
              )}
            </div>
          )}
          
          {/* Item details */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
              <div>
                {item.discounted_price ? (
                  <div className="text-right">
                    <div className="text-sm text-gray-500 line-through">
                      ${item.price.toFixed(2)}
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      ${item.discounted_price.toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            {item.description && (
              <p className="text-gray-600 mb-6">{item.description}</p>
            )}
            
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">{t.ingredients}</h4>
                <p className="text-sm text-gray-600">{item.ingredients.join(', ')}</p>
              </div>
            )}
            
            {item.allergens && item.allergens.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-600 mb-1">{t.allergens}</h4>
                <p className="text-sm text-red-600">{item.allergens.join(', ')}</p>
              </div>
            )}
            
            {item.dietary_options && item.dietary_options.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{t.dietaryOptions}</h4>
                <div className="flex flex-wrap gap-2">
                  {item.dietary_options.map((option, index) => (
                    <span
                      key={index}
                      className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={closeItemDetails}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                {t.close}
              </button>
              <button 
                className="flex-1 py-2 px-4 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
              >
                {t.addToOrder}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top utility buttons */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
          aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
        >
          {language === 'en' ? 'ES' : 'EN'}
        </button>
        
        {/* View Toggle (Mobile/Desktop) */}
        <button 
          onClick={toggleViewMode}
          className="bg-white rounded-full p-2 shadow-md hidden md:flex items-center justify-center"
          aria-label={isMobileView ? t.desktopView : t.mobileView}
        >
          {isMobileView ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          backgroundColor: menu.restaurant_id ? `var(--primary-color, #4F46E5)` : '#4F46E5',
        }}
        className={`py-6 text-white relative overflow-hidden ${isMobileView ? 'pb-4' : 'py-8'}`}
      >
        <div className="container mx-auto px-4 relative z-10">
          <h1 className={`font-bold tracking-tight ${isMobileView ? 'text-2xl' : 'text-3xl'}`}>{menu.name}</h1>
          {menu.description && (
            <p className="mt-2 text-white/90 max-w-xl leading-relaxed">{menu.description}</p>
          )}
          
          {/* Search and filter */}
          <div className={`mt-4 flex flex-col ${isMobileView ? 'gap-2' : 'sm:flex-row gap-2'}`}>
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
            
            <div className={`flex gap-2 ${isMobileView ? 'w-full' : ''}`}>
              <select
                value={filterOptions.sortBy}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className={`bg-white text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 transition ${isMobileView ? 'flex-1' : ''}`}
                aria-label={t.sort}
              >
                <option value="none">{t.sort}</option>
                <option value="price-asc">{t.priceAsc}</option>
                <option value="price-desc">{t.priceDesc}</option>
              </select>
              
              {filterOptions.dietary.length > 0 && (
                <button
                  onClick={clearFilters}
                  className={`bg-white/10 text-white rounded-lg px-3 py-2 hover:bg-white/20 transition ${isMobileView ? 'flex-1' : ''}`}
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
      
      {/* Mobile menu button (only in mobile view) */}
      {isMobileView && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed z-40 bottom-4 left-4 bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      {/* Mobile category menu (slide-in panel) */}
      <AnimatePresence>
        {isMobileView && isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-30 bg-white/95 shadow-lg"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 bg-primary-600 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{menu.name}</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-auto">
                {filteredCategories?.map((category) => (
                  <button
                    key={category.id}
                    className={`w-full text-left p-4 border-b border-gray-200 ${
                      activeCategory === category.id ? 'bg-primary-50 font-semibold text-primary-700' : 'text-gray-800'
                    }`}
                    onClick={() => {
                      setActiveCategory(category.id as string);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      {category.items.length > 0 && (
                        <span className="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                          {category.items.length}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Category Navigation - Desktop or horizontal scroll on mobile */}
      {!isMobileView && (
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
      )}
      
      {/* Content */}
      <main className={`container mx-auto px-4 ${isMobileView ? 'py-4' : 'py-8'} pb-20`}>
        <AnimatePresence mode="wait">
          {filteredCategories?.map((category) => (
            <div
              key={category.id}
              ref={el => categoryRefs.current[category.id as string] = el}
              className={`mb-8 scroll-mt-20 ${
                activeCategory === category.id ? 'block' : 'hidden'
              }`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={`mb-2 font-bold text-gray-900 ${isMobileView ? 'text-xl' : 'text-2xl'}`}>{category.name}</h2>
                
                {category.description && (
                  <p className="mb-6 text-gray-600 max-w-3xl">{category.description}</p>
                )}
                
                {category.items.length > 0 ? (
                  <div className={`grid gap-4 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {category.items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="group overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-lg"
                        onClick={() => handleItemClick(item)}
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
                        
                        <div className="p-4">
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
                          
                          <button
                            className="mt-4 w-full rounded-lg bg-primary-50 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(item);
                            }}
                          >
                            {t.viewDetails}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No items available for this category with the current filters.</p>
                )}
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
      </main>
      
      {/* Item detail modal */}
      <AnimatePresence>
        {selectedItem && <ItemDetailModal item={selectedItem} />}
      </AnimatePresence>
      
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