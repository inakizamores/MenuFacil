'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { getMenu, publishMenu, unpublishMenu } from '@/actions/menus';
import PublishMenuWithQR from '@/app/components/menu/PublishMenuWithQR';
import QRCodeManager from '@/app/components/qr-code/management/QRCodeManager';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

/**
 * Props for the MenuPublishPage component
 */
interface MenuPublishPageProps {
  /** URL parameters passed from Next.js router */
  params: {
    /** ID of the restaurant */
    restaurantId: string;
    /** ID of the menu being published */
    menuId: string;
  };
}

/**
 * MenuPublishPage Component
 * 
 * This page allows restaurant owners to manage the publication status of their menus
 * and manage QR codes for their published menus.
 * 
 * Route: /dashboard/restaurants/[restaurantId]/menus/[menuId]/publish
 */
const MenuPublishPage: FC<MenuPublishPageProps> = ({ params }) => {
  const { restaurantId, menuId } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  
  // Base URL for menu access - used for QR codes
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menufacil.com';

  /**
   * Load menu data when the component mounts
   */
  useEffect(() => {
    async function loadMenu() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const result = await getMenu(menuId);
        
        if (result.error) {
          setError(result.error);
        } else if (!result.data) {
          setError('Menu not found');
        } else {
          setMenu(result.data);
        }
      } catch (err: any) {
        console.error('Error loading menu:', err);
        setError(err.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [menuId, user]);

  /**
   * Handle publishing a menu with proper error handling
   * @param {string} id - The ID of the menu to publish
   * @returns {Promise<{ success: boolean; error?: string }>}
   */
  const handlePublishMenu = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await publishMenu({
        id: id,
        version: 'auto',
        publishNotes: 'Published from dashboard'
      });
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to publish menu' };
      }
    } catch (err: any) {
      console.error('Error publishing menu:', err);
      return { success: false, error: err.message || 'Failed to publish menu' };
    }
  };

  /**
   * Handle unpublishing a menu with proper error handling
   * @param {string} id - The ID of the menu to unpublish
   * @returns {Promise<{ success: boolean; error?: string }>}
   */
  const handleUnpublishMenu = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await unpublishMenu(id);
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to unpublish menu' };
      }
    } catch (err: any) {
      console.error('Error unpublishing menu:', err);
      return { success: false, error: err.message || 'Failed to unpublish menu' };
    }
  };

  const handlePublishSuccess = () => {
    // Refresh the menu data and show success message
    setShowPublishSuccess(true);
    loadMenu();

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowPublishSuccess(false);
    }, 3000);
  };

  // Extract the loadMenu function from useEffect for reuse
  async function loadMenu() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const result = await getMenu(menuId);
      
      if (result.error) {
        setError(result.error);
      } else if (!result.data) {
        setError('Menu not found');
      } else {
        setMenu(result.data);
      }
    } catch (err: any) {
      console.error('Error loading menu:', err);
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Button 
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus`)}
            className="mt-4"
            variant="outline"
          >
            Back to Menus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb 
        items={[
          { label: 'Restaurants', href: '/dashboard/restaurants' },
          { label: menu?.restaurant_name || 'Restaurant', href: `/dashboard/restaurants/${restaurantId}` },
          { label: 'Menus', href: `/dashboard/restaurants/${restaurantId}/menus` },
          { label: menu?.name || 'Menu', href: `/dashboard/restaurants/${restaurantId}/menus/${menuId}` },
          { label: 'Publish', href: `/dashboard/restaurants/${restaurantId}/menus/${menuId}/publish` }
        ]}
      />
      
      <div className="max-w-4xl mx-auto mt-6">
        <h1 className="text-2xl font-bold mb-6">{menu?.name || 'Menu'} - Publishing & QR Codes</h1>
        
        {/* Show success notification */}
        {showPublishSuccess && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
            Menu status updated successfully
          </div>
        )}
        
        {/* PublishMenuWithQR integration */}
        <PublishMenuWithQR 
          menuId={menuId}
          isActive={menu?.is_active}
          menuName={menu?.name}
          restaurantId={restaurantId}
          baseUrl={baseUrl}
          onSuccess={handlePublishSuccess}
        />
        
        {/* QR Code Management Section */}
        {menu?.is_active && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-6">QR Code Management</h2>
            <QRCodeManager
              menuId={menuId}
              menuName={menu?.name}
              restaurantId={restaurantId}
              baseUrl={baseUrl}
            />
          </div>
        )}
        
        <div className="mt-10 bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Publishing Information</h2>
          <p className="text-gray-700 mb-4">
            When you publish a menu, it becomes visible to your customers through your restaurant's public menu page.
          </p>
          
          <h3 className="font-medium text-lg mt-6 mb-2">Tips for publishing:</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Make sure all menu items have correct prices and descriptions before publishing</li>
            <li>Preview your menu to see how it will appear to customers</li>
            <li>You can unpublish your menu at any time if you need to make changes</li>
            <li>When you make changes to an unpublished menu, they won't be visible until you publish again</li>
            <li>Generate and print QR codes to allow customers to easily access your digital menu</li>
          </ul>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`)}
          >
            Back to Menu Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuPublishPage; 