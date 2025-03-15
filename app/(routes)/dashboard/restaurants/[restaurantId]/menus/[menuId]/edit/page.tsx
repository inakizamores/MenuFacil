'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useForm } from '@/app/hooks/useForm';
import { validate, combineValidators } from '@/app/utils/validation';
import { getMenu, updateMenu } from '@/app/utils/db';
import Input from '@/app/components/ui/input';
import Button from '@/app/components/ui/button';

type MenuFormValues = {
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
};

interface EditMenuPageProps {
  params: {
    restaurantId: string;
    menuId: string;
  };
}

export default function EditMenuPage({ params }: EditMenuPageProps) {
  const { restaurantId, menuId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [menu, setMenu] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initialValues: MenuFormValues = {
    name: '',
    description: '',
    isActive: true,
    isDefault: false,
  };

  const validationRules = {
    name: combineValidators(validate.required),
  };

  useEffect(() => {
    const fetchMenu = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const menuData = await getMenu(menuId);
        
        if (!menuData) {
          setLoadError('Menu not found');
        } else {
          setMenu(menuData);
          
          // Update form values with menu data
          setFieldValue('name', menuData.name);
          setFieldValue('description', menuData.description || '');
          setFieldValue('isActive', menuData.is_active);
          setFieldValue('isDefault', menuData.is_default);
        }
      } catch (err: any) {
        console.error('Error fetching menu:', err);
        setLoadError(err.message || 'Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [menuId, user, router]);

  const handleUpdateMenu = async (values: MenuFormValues) => {
    if (!user?.id || !menu) {
      setServerError('You must be logged in and menu must exist to update');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const updatedMenu = await updateMenu(menuId, {
        name: values.name,
        description: values.description || null,
        is_active: values.isActive,
        is_default: values.isDefault,
      });

      if (updatedMenu) {
        router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`);
      } else {
        setServerError('Failed to update menu. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating menu:', error);
      setServerError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm<MenuFormValues>(initialValues, validationRules, handleUpdateMenu);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (loadError || !menu) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{loadError || 'Failed to load menu'}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus`)}
              >
                Back to menus
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
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
            Edit Menu
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Update the menu details.
        </p>
      </div>

      <div className="bg-white p-6 shadow sm:rounded-lg">
        {serverError && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Menu Name"
              name="name"
              type="text"
              required
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={values.isActive}
                onChange={handleChange}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="isDefault"
                name="isDefault"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={values.isDefault}
                onChange={handleChange}
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default menu
              </label>
              <span className="ml-2 text-xs text-gray-500">
                (Default menu will be shown to customers when they visit your restaurant page)
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Update Menu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 