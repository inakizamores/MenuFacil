'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { getMenu, getMenuCategories, createCategory, deleteCategory, updateMenu, createQRCode, getMenuQRCodes } from '@/app/utils/db';
import { MenuCategory, Menu, QRCode } from '@/app/types/database';
import Button from '@/app/components/ui/button';
import Input from '@/app/components/ui/input';
import QRCodeGenerator from '@/app/components/qr-code/QRCodeGenerator';
import { QRCodeFormValues } from '@/lib/validation/schemas';

// Components
const CategoryCard = ({ 
  category, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  category: MenuCategory;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDeleting) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete the "${category.name}" category? This will delete all items in this category.`);
    
    if (confirmed) {
      setIsDeleting(true);
      onDelete();
    }
  };
  
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 line-clamp-1">
              {category.name}
            </h3>
            {!category.is_active && (
              <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Inactive
              </span>
            )}
          </div>
        </div>
        
        {category.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={onView}
          >
            View Items
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddCategoryForm = ({ 
  onCancel, 
  onSubmit,
  menuId
}: { 
  onCancel: () => void;
  onSubmit: (category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  menuId: string;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        menu_id: menuId as `${string}-${string}-${string}-${string}-${string}`,
        name,
        description: description || null,
        image_url: null,
        sort_order: 0,
        is_active: true
      });
      
      // Reset form
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">Add Category</h3>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Add Category
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

const EmptyState = ({ onAddCategory }: { onAddCategory: () => void }) => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center">
      <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
      <p className="mt-1 text-sm text-gray-500">
        Start by adding categories to your menu.
      </p>
      <div className="mt-6">
        <Button onClick={onAddCategory}>
          <svg 
            className="-ml-1 mr-2 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Category
        </Button>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      <p className="mt-4 text-sm text-gray-500">Loading menu...</p>
    </div>
  );
};

const MenuPublishPanel = ({ 
  menu, 
  onUpdate,
  restaurantId
}: { 
  menu: Menu;
  onUpdate: () => void;
  restaurantId: string;
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showQROptions, setShowQROptions] = useState(false);
  const [existingQRCodes, setExistingQRCodes] = useState<QRCode[] | null>(null);
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(false);
  
  const menuPublicUrl = `${window.location.origin}/menus/${menu.id}`;
  
  useEffect(() => {
    if (showQROptions && menu.is_active) {
      loadExistingQRCodes();
    }
  }, [showQROptions, menu.is_active]);
  
  const loadExistingQRCodes = async () => {
    setIsLoadingQRCodes(true);
    try {
      const qrCodes = await getMenuQRCodes(menu.id as string);
      setExistingQRCodes(qrCodes);
    } catch (error) {
      console.error('Error loading QR codes:', error);
    } finally {
      setIsLoadingQRCodes(false);
    }
  };
  
  const handlePublishToggle = async () => {
    setIsPublishing(true);
    
    try {
      await updateMenu(menu.id as string, { 
        is_active: !menu.is_active,
        updated_at: new Date().toISOString()
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error toggling menu published state:', error);
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleSaveQRCode = async (formValues: QRCodeFormValues) => {
    try {
      await createQRCode({
        menuId: menu.id as string,
        restaurantId: restaurantId,
        name: formValues.name,
        url: menuPublicUrl,
        design: {
          foregroundColor: formValues.customDesign.foregroundColor,
          backgroundColor: formValues.customDesign.backgroundColor,
          margin: formValues.customDesign.margin,
          cornerRadius: formValues.customDesign.cornerRadius || 0,
          logoUrl: formValues.customDesign.logoUrl
        }
      });
      
      // Reload QR codes
      await loadExistingQRCodes();
    } catch (error) {
      console.error('Error creating QR code:', error);
    }
  };
  
  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Menu Status
            </h3>
            <div className="mt-1 max-w-xl text-sm text-gray-500">
              <p>
                {menu.is_active 
                  ? 'Your menu is published and available to the public.' 
                  : 'Your menu is currently unpublished and only visible to you.'}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant={menu.is_active ? "outline" : "primary"}
              onClick={handlePublishToggle}
              isLoading={isPublishing}
              disabled={isPublishing}
            >
              {menu.is_active ? 'Unpublish Menu' : 'Publish Menu'}
            </Button>
          </div>
        </div>
        
        {menu.is_active && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h4 className="text-base font-medium text-gray-900">QR Code</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Generate a QR code for customers to scan and view your menu.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button
                  variant="secondary"
                  onClick={() => setShowQROptions(!showQROptions)}
                >
                  {showQROptions ? 'Hide Options' : 'Generate QR Code'}
                </Button>
              </div>
            </div>
            
            {showQROptions && (
              <div className="mt-4">
                <QRCodeGenerator
                  url={menuPublicUrl}
                  menuName={menu.name}
                  restaurantId={restaurantId}
                  menuId={menu.id as string}
                  onSave={handleSaveQRCode}
                />
                
                {isLoadingQRCodes && (
                  <div className="mt-4 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading QR codes...</p>
                  </div>
                )}
                
                {!isLoadingQRCodes && existingQRCodes && existingQRCodes.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Your QR Codes</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {existingQRCodes.map((qrCode) => (
                        <div 
                          key={qrCode.id} 
                          className="border border-gray-200 rounded-md p-3 flex flex-col"
                        >
                          <div className="font-medium">{qrCode.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Created: {new Date(qrCode.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Views: {qrCode.total_views}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface MenuPageProps {
  params: {
    restaurantId: string;
    menuId: string;
  };
}

export default function MenuPage({ params }: MenuPageProps) {
  const { restaurantId, menuId } = params;
  const { user } = useAuth();
  const router = useRouter();
  
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch menu details
      const menuData = await getMenu(menuId);
      
      if (!menuData) {
        setError('Menu not found');
        setIsLoading(false);
        return;
      }
      
      setMenu(menuData);
      
      // Fetch menu categories
      const categoriesData = await getMenuCategories(menuId);
      setCategories(categoriesData || []);
    } catch (err: any) {
      console.error('Error fetching menu data:', err);
      setError(err.message || 'Failed to load menu data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [menuId, user, router]);

  const handleAddCategory = async (category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createCategory(category);
      setShowAddCategory(false);
      // Refresh categories
      const categoriesData = await getMenuCategories(menuId);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const success = await deleteCategory(categoryId);
      if (success) {
        // Filter out the deleted category
        setCategories(categories => categories?.filter(cat => cat.id !== categoryId) || null);
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/edit`);
  };

  const handleViewCategoryItems = (categoryId: string) => {
    router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`);
  };

  const refreshMenu = async () => {
    setIsRefreshing(true);
    
    try {
      // Fetch menu details
      const menuData = await getMenu(menuId);
      
      if (menuData) {
        setMenu(menuData);
      }
      
      // Fetch menu categories
      const categoriesData = await getMenuCategories(menuId);
      setCategories(categoriesData || []);
    } catch (err: any) {
      console.error('Error refreshing menu data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!menu) {
    return (
      <div className="pt-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || "Menu not found"}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus`)}
                  className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200"
                >
                  Go back to menus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-8 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="flex items-center">
            <button 
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus`)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{menu.name}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {menu.description || "No description provided"}
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-3 flex">
          <Button
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/qr-codes`)}
            className="bg-primary-500 hover:bg-primary-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR Codes
          </Button>
          <Button 
            onClick={() => setShowAddCategory(true)}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Add Category
          </Button>
        </div>
      </div>
      
      {/* Menu settings panel */}
      <MenuPublishPanel 
        menu={menu} 
        onUpdate={refreshMenu} 
        restaurantId={restaurantId} 
      />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Categories</h2>
        <Button 
          onClick={() => setShowAddCategory(!showAddCategory)}
          disabled={showAddCategory}
        >
          <svg 
            className="-ml-1 mr-2 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Category
        </Button>
      </div>

      {showAddCategory && (
        <AddCategoryForm 
          onCancel={() => setShowAddCategory(false)} 
          onSubmit={handleAddCategory}
          menuId={menuId}
        />
      )}

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id as string}
              category={category}
              onEdit={() => handleEditCategory(category.id as string)}
              onDelete={() => handleDeleteCategory(category.id as string)}
              onView={() => handleViewCategoryItems(category.id as string)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAddCategory={() => setShowAddCategory(true)} />
      )}
    </div>
  );
} 