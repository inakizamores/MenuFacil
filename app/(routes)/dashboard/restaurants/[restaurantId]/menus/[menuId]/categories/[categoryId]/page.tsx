'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { getCategory } from '@/actions/categories';
import { getMenu } from '@/actions/menus';
import { getCategoryItems, deleteMenuItem } from '@/actions/menuItems';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { MenuItem } from '@/actions/menuItems';

const MenuItemCard = ({ 
  item,
  onEdit,
  onDelete
}: { 
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="relative">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute top-2 right-2 rounded-full bg-gray-800 px-2 py-1 text-xs text-white opacity-80">
            Unavailable
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold line-clamp-1">{item.name}</h3>
          <span className="font-medium text-primary-600">{formatCurrency(item.price)}</span>
        </div>
        
        {item.description && (
          <p className="mb-4 text-sm text-gray-500 line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="flex justify-end gap-2">
          {showDeleteConfirm ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
              >
                Confirm
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
              <Button
                size="sm"
                onClick={onEdit}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onAddItem }: { onAddItem: () => void }) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center">
      <h3 className="mt-2 text-sm font-medium text-gray-900">No items in this category</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new menu item.
      </p>
      <div className="mt-6">
        <Button onClick={onAddItem}>
          <svg 
            className="-ml-1 mr-2 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Menu Item
        </Button>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-gray-500">Loading menu items...</p>
    </div>
  );
};

interface CategoryItemsPageProps {
  params: {
    restaurantId: string;
    menuId: string;
    categoryId: string;
  };
}

export default function CategoryItemsPage({ params }: CategoryItemsPageProps) {
  const { restaurantId, menuId, categoryId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch category details
        const categoryData = await getCategory(categoryId);
        
        if (!categoryData) {
          setError('Category not found');
          setIsLoading(false);
          return;
        }
        
        setCategory(categoryData);
        
        // Fetch menu details
        const menuData = await getMenu(menuId);
        
        if (!menuData) {
          setError('Menu not found');
          setIsLoading(false);
          return;
        }
        
        setMenu(menuData);
        
        // Fetch menu items
        const { items, error: itemsError } = await getCategoryItems(categoryId);
        
        if (itemsError) {
          setError(itemsError);
          setIsLoading(false);
          return;
        }
        
        setItems(items);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryId, menuId, restaurantId, user, router]);

  const handleAddMenuItem = () => {
    router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/create`);
  };

  const handleEditMenuItem = (itemId: string) => {
    router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/${itemId}/edit`);
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const { error: deleteError } = await deleteMenuItem(itemId);
      
      if (deleteError) {
        console.error('Error deleting menu item:', deleteError);
        return;
      }
      
      // Remove deleted item from state
      setItems(prevItems => prevItems ? prevItems.filter(item => item.id !== itemId) : null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !category || !menu) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error || 'Failed to load data'}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`)}
              >
                Back to menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {category.name}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {menu.name} • {items?.length || 0} items
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/edit`)}
          >
            Edit Category
          </Button>
          <Button onClick={handleAddMenuItem}>
            <svg 
              className="-ml-1 mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Item
          </Button>
        </div>
      </div>

      {items && items.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={() => handleEditMenuItem(item.id)}
              onDelete={() => handleDeleteMenuItem(item.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAddItem={handleAddMenuItem} />
      )}
    </div>
  );
} 