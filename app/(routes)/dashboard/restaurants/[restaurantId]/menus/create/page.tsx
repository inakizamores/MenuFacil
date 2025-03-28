'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useZodForm } from '@/app/hooks/useZodForm';
import { getRestaurant, createMenu } from '@/app/utils/db';
import Input from '@/app/components/ui/input';
import Button from '@/app/components/ui/button';
import { menuSchema, MenuFormValues } from '@/lib/validation/schemas';

interface CreateMenuPageProps {
  params: {
    restaurantId: string;
  };
}

export default function CreateMenuPage({ params }: CreateMenuPageProps) {
  const { restaurantId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useZodForm({
    schema: menuSchema,
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      isDefault: false,
      customCss: '',
      currency: 'USD',
    },
  });

  // Watch form values
  const formValues = watch();

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const restaurantData = await getRestaurant(restaurantId);
        
        if (!restaurantData) {
          setError('Restaurant not found');
        } else {
          setRestaurant(restaurantData);
        }
      } catch (err: any) {
        console.error('Error fetching restaurant:', err);
        setError(err.message || 'Failed to load restaurant');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, user, router]);

  const onSubmit = async (values: MenuFormValues) => {
    if (!user?.id || !restaurant) {
      setServerError('You must be logged in and restaurant must exist to create a menu');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const newMenu = await createMenu({
        restaurant_id: restaurantId as `${string}-${string}-${string}-${string}-${string}`,
        name: values.name,
        description: values.description || null,
        is_active: values.isActive,
        is_default: values.isDefault,
        template_id: null,
        custom_css: values.customCss || null
      });

      if (newMenu) {
        router.push(`/dashboard/restaurants/${restaurantId}/menus/${newMenu.id}`);
      } else {
        setServerError('Failed to create menu. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating menu:', error);
      setServerError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
      </div>
    );
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
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus`)}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create New Menu
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Create a new menu for {restaurant.name}
        </p>
      </div>

      <div className="bg-white p-6 shadow sm:rounded-lg">
        {serverError && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Menu Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                {...register('currency')}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="MXN">MXN ($)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
              {errors.currency && (
                <p className="mt-2 text-sm text-red-600">{errors.currency.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This setting affects how prices are displayed to customers.
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('isActive')}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="isDefault"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('isDefault')}
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default menu
              </label>
            </div>

            <div>
              <label htmlFor="customCss" className="block text-sm font-medium text-gray-700">
                Custom CSS (optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="customCss"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder=".menu-title { color: red; }"
                  {...register('customCss')}
                />
                {errors.customCss && (
                  <p className="mt-2 text-sm text-red-600">{errors.customCss.message}</p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Add custom CSS styles to customize the look of your menu.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus`)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Menu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 