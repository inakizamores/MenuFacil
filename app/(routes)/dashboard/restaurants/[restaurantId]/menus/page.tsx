'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { getRestaurant, getRestaurantMenus } from '@/app/utils/db';
import { Menu } from '@/app/types/database';
import Button from '@/app/components/ui/button';

// Components
const MenuCard = ({ menu, onSelect }: { menu: Menu, onSelect: () => void }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 line-clamp-1">
              {menu.name}
            </h3>
            {menu.is_default && (
              <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Default
              </span>
            )}
            {!menu.is_active && (
              <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Inactive
              </span>
            )}
          </div>
        </div>
        
        {menu.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {menu.description}
          </p>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="primary" 
            onClick={onSelect}
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center">
      <h3 className="mt-2 text-sm font-medium text-gray-900">No menus</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new menu.
      </p>
      <div className="mt-6">
        <Button onClick={onCreate}>
          <svg 
            className="-ml-1 mr-2 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Menu
        </Button>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      <p className="mt-4 text-sm text-gray-500">Loading menus...</p>
    </div>
  );
};

interface RestaurantMenusPageProps {
  params: {
    restaurantId: string;
  };
}

export default function RestaurantMenusPage({ params }: RestaurantMenusPageProps) {
  const { restaurantId } = params;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menus, setMenus] = useState<Menu[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch restaurant details
        const restaurantData = await getRestaurant(restaurantId);
        
        if (!restaurantData) {
          setError('Restaurant not found');
          setIsLoading(false);
          return;
        }
        
        setRestaurant(restaurantData);
        
        // Fetch menus for the restaurant
        const menusData = await getRestaurantMenus(restaurantId);
        setMenus(menusData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, user, router]);

  const handleCreateMenu = () => {
    router.push(`/dashboard/restaurants/${restaurantId}/menus/create`);
  };

  const handleSelectMenu = (menuId: string) => {
    router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !restaurant) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error || 'Failed to load restaurant'}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/dashboard/restaurants')}
              >
                Back to restaurants
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
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}`)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Menus for {restaurant.name}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Manage digital menus for this restaurant
          </p>
        </div>
        <Button onClick={handleCreateMenu}>
          <svg 
            className="-ml-1 mr-2 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Menu
        </Button>
      </div>

      {menus && menus.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id as string}
              menu={menu}
              onSelect={() => handleSelectMenu(menu.id as string)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreate={handleCreateMenu} />
      )}
    </div>
  );
} 