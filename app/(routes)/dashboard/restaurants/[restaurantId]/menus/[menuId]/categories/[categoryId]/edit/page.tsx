'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useForm } from '@/hooks/useForm';
import { validate, combineValidators } from '@/lib/validation';
import { getMenu } from '@/actions/menus';
import { getCategory, updateCategory } from '@/actions/categories';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';

interface CategoryFormValues {
  name: string;
  description: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);

  // Initialize form with default values
  const initialValues: CategoryFormValues = {
    name: '',
    description: ''
  };

  // Validation rules
  const validationRules = {
    name: [validate.required('Name is required')]
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues } = 
    useForm<CategoryFormValues>({
      initialValues,
      validationRules: combineValidators(validationRules),
      onSubmit: async (formValues) => {
        await handleUpdateCategory(formValues);
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
        
        // Fetch category data
        const categoryData = await getCategory(categoryId);
        if (!categoryData) {
          setError('Category not found');
          setIsLoading(false);
          return;
        }

        // Fetch menu data
        const menuData = await getMenu(menuId);
        if (!menuData) {
          setError('Menu not found');
          setIsLoading(false);
          return;
        }

        setCategory(categoryData);
        setMenu(menuData);
        
        // Set form values from category data
        setValues({
          name: categoryData.name,
          description: categoryData.description || ''
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load category information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.categoryId, params.menuId, router, user, setValues]);

  // Handle category update
  const handleUpdateCategory = async (formValues: CategoryFormValues) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!category || !menu) {
      setError('Required information missing');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const categoryId = params.categoryId as string;
      const menuId = params.menuId as string;
      const restaurantId = params.restaurantId as string;
      
      // Update the category
      const result = await updateCategory({
        id: categoryId,
        name: formValues.name,
        description: formValues.description
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Redirect to the menu page upon successful update
      router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}`);
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
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
        <h1 className="text-2xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground">
          Update category in {menu?.name} menu
        </p>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter category name"
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
              placeholder="Enter category description (optional)"
              rows={3}
            />
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
              Update Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 