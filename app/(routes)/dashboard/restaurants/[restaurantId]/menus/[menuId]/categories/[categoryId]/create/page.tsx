'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useForm } from '@/hooks/useForm';
import { validate, combineValidators } from '@/lib/validation';
import { getCategory } from '@/actions/categories';
import { getMenu } from '@/actions/menus';
import { createMenuItem } from '@/actions/menuItems';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';
import { PriceInput } from '@/components/ui/PriceInput';
import { FileUpload } from '@/components/ui/FileUpload';

interface MenuItemFormValues {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  image?: File | null;
}

export default function CreateMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);

  // Initialize form with default values
  const initialValues: MenuItemFormValues = {
    name: '',
    description: '',
    price: 0,
    isAvailable: true,
    image: null
  };

  // Validation rules
  const validationRules = {
    name: [validate.required('Name is required')],
    price: [validate.required('Price is required')]
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue } = 
    useForm<MenuItemFormValues>({
      initialValues,
      validationRules: combineValidators(validationRules),
      onSubmit: async (formValues) => {
        await handleCreateMenuItem(formValues);
      }
    });

  // Fetch category and menu data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setError(null);
        const categoryId = params.categoryId as string;
        const menuId = params.menuId as string;
        const restaurantId = params.restaurantId as string;

        // Fetch category and menu data
        const categoryData = await getCategory(categoryId);
        if (!categoryData) {
          setError('Category not found');
          setIsLoading(false);
          return;
        }

        const menuData = await getMenu(menuId);
        if (!menuData) {
          setError('Menu not found');
          setIsLoading(false);
          return;
        }

        setCategory(categoryData);
        setMenu(menuData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load category information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.categoryId, params.menuId, params.restaurantId, router, user]);

  // Handle menu item creation
  const handleCreateMenuItem = async (formValues: MenuItemFormValues) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!category || !menu) {
      setError('Category or menu information missing');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const categoryId = params.categoryId as string;
      const menuId = params.menuId as string;
      const restaurantId = params.restaurantId as string;
      
      // Create the menu item
      const result = await createMenuItem({
        name: formValues.name,
        description: formValues.description || '',
        price: formValues.price,
        isAvailable: formValues.isAvailable,
        categoryId,
        image: formValues.image,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Redirect to the category page upon successful creation
      router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`);
    } catch (error) {
      console.error('Error creating menu item:', error);
      setError('Failed to create menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6">
        <p className="mb-4 text-center text-red-500">{error}</p>
        <Button 
          onClick={() => router.back()}
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Item to {category?.name}</h1>
        <p className="text-muted-foreground">Create a new menu item in the {menu?.name} menu</p>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Item Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter item name"
              error={touched.name && errors.name ? errors.name : undefined}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter item description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price <span className="text-red-500">*</span>
            </label>
            <PriceInput
              id="price"
              name="price"
              value={values.price}
              onChange={(value) => setFieldValue('price', value)}
              onBlur={() => handleBlur({ target: { name: 'price' }} as React.FocusEvent<HTMLInputElement>)}
              error={touched.price && errors.price ? errors.price : undefined}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">Item Image</label>
            <FileUpload
              onFileSelected={(file) => setFieldValue('image', file)}
              accept="image/*"
              maxSizeInMB={5}
            />
            <p className="text-xs text-muted-foreground">
              Recommended size: 800x600px. Max file size: 5MB.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAvailable"
              name="isAvailable"
              checked={values.isAvailable}
              onChange={(e) => setFieldValue('isAvailable', e.target.checked)}
            />
            <label htmlFor="isAvailable" className="text-sm font-medium">
              Item is available for ordering
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
              Create Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 