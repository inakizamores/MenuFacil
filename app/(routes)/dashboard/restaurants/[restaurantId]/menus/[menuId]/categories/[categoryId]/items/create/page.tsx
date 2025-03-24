'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { getCategory } from '@/actions/categories';
import { createMenuItem } from '@/actions/menuItems';
import { saveItemVariants } from '@/actions/menuItemVariants';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { PriceInput } from '@/components/ui/PriceInput';
import { Spinner } from '@/components/ui/Spinner';
import VariantsManager from '@/app/components/menu/VariantsManager';
import { MenuItemVariant } from '@/app/types/database';
import { menuItemSchema, type MenuItemFormValues } from '@/lib/validation/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useZodForm } from '@/app/hooks/useZodForm';

const CreateMenuItemPage: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [pendingVariants, setPendingVariants] = useState<any[]>([]);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSavingVariants, setIsSavingVariants] = useState(false);
  
  // Get the restaurantId, menuId, and categoryId from the URL
  const path = window.location.pathname;
  const pathParts = path.split('/');
  const restaurantIdIndex = pathParts.indexOf('restaurants') + 1;
  const menuIdIndex = pathParts.indexOf('menus') + 1;
  const categoryIdIndex = pathParts.indexOf('categories') + 1;
  
  const restaurantId = pathParts[restaurantIdIndex];
  const menuId = pathParts[menuIdIndex];
  const categoryId = pathParts[categoryIdIndex];
  
  // Use Zod form with schema validation
  const {
    formState: { errors, touchedFields, isSubmitting: formSubmitting },
    handleSubmit,
    setValue,
    register,
    watch,
  } = useZodForm({
    schema: menuItemSchema,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image: null,
      isAvailable: true,
      isPopular: false,
      preparationTime: undefined,
      ingredients: [],
      allergens: [],
      dietaryOptions: [],
      nutritionalInfo: {
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined,
        sugar: undefined,
        fiber: undefined,
        sodium: undefined,
      },
    },
  });

  // Watch form values
  const formValues = watch();

  // Fetch category details
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !categoryId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the category
        const categoryResult = await getCategory(categoryId);
        
        if (categoryResult.error) {
          setError(categoryResult.error);
          setIsLoading(false);
          return;
        }

        if (!categoryResult.data) {
          setError('Category not found');
          setIsLoading(false);
          return;
        }

        setCategory(categoryResult.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load category details');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, categoryId]);

  // Handle saving variants
  const handleSaveVariants = async (updatedVariants: Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'>[]) => {
    setIsSavingVariants(true);
    setVariantError(null);
    
    try {
      // When creating a new item, we don't have an item ID yet, so we'll store the variants
      // and save them after the item is created
      setPendingVariants(updatedVariants);
      return Promise.resolve();
    } catch (err) {
      console.error('Error saving variants:', err);
      setVariantError('Failed to save variants. Please try again.');
      throw err;
    } finally {
      setIsSavingVariants(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Set image in form
      setValue('image', file);
      
      // Create a unique file name
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Create a form data object
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload to Supabase storage
      const response = await fetch(`/api/upload?fileName=${fileName}&folder=menu-items`, {
        method: 'POST',
        body: formData
      });
      
      clearInterval(uploadInterval);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      // Reset upload state after a delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle menu item creation
  const onSubmit = async (values: MenuItemFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!user) {
        setError('You must be logged in');
        return;
      }

      // Create the menu item
      const result = await createMenuItem({
        name: values.name,
        description: values.description || '',
        price: values.price,
        isAvailable: values.isAvailable,
        is_popular: values.isPopular,
        preparation_time: values.preparationTime,
        categoryId,
        image: values.image,
        // Optional fields that might be added later
        nutrition_info: values.nutritionalInfo ? JSON.stringify(values.nutritionalInfo) : null,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Save variants if any
      if (pendingVariants.length > 0 && result.id) {
        setCreatedItemId(result.id);
        const updatedVariants = pendingVariants.map(variant => ({
          ...variant,
          item_id: result.id as `${string}-${string}-${string}-${string}-${string}`
        }));
        
        await saveItemVariants(result.id, updatedVariants);
      }

      // Redirect back to category items page
      router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating menu item:', err);
      setError('Failed to create menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
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
            onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`)}
            className="mt-4"
            variant="outline"
          >
            Back to Category
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Menu Item</h1>
        <Button 
          onClick={() => router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`)}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
      
      {category && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded">
          <p className="text-sm text-blue-700">
            Adding item to category: <span className="font-semibold">{category.name}</span>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Basic Information</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Margherita Pizza"
                error={errors.name?.message}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the menu item..."
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <PriceInput
                id="price"
                name="price"
                value={formValues.price}
                onChange={(value) => setValue('price', value)}
                error={errors.price?.message}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAvailable"
                  name="isAvailable"
                  checked={formValues.isAvailable}
                  onChange={(e) => setValue('isAvailable', e.target.checked)}
                />
                <label htmlFor="isAvailable" className="text-sm font-medium">
                  Item is available for ordering
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPopular"
                  name="isPopular"
                  checked={formValues.isPopular}
                  onChange={(e) => setValue('isPopular', e.target.checked)}
                />
                <label htmlFor="isPopular" className="text-sm font-medium">
                  Mark as popular item
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="preparationTime" className="block text-sm font-medium mb-1">
                Preparation Time (minutes)
              </label>
              <Input
                id="preparationTime"
                type="number"
                {...register('preparationTime', { valueAsNumber: true })}
                placeholder="e.g., 15"
                error={errors.preparationTime?.message}
              />
            </div>
          </div>
          
          {/* Image Upload and Additional Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Image & Additional Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Item Image
              </label>
              <FileUpload 
                onFileSelected={handleImageUpload}
                accept="image/*"
                maxSizeInMB={5}
                isLoading={isUploading}
                progress={uploadProgress}
              />
              {formValues.image && (
                <p className="mt-1 text-xs text-gray-500">
                  Image uploaded successfully!
                </p>
              )}
              {errors.image && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.image.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Variants Section */}
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4">Item Variants</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add size or variation options for this menu item, such as Small, Medium, Large, etc.
            Each variant can have its own price adjustment relative to the base price.
          </p>
          
          <VariantsManager 
            itemId={createdItemId || 'temp-id'}
            initialVariants={[]}
            onSave={handleSaveVariants}
          />
          
          {variantError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              <p>{variantError}</p>
            </div>
          )}
        </div>
        
        <div className="border-t pt-6">
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading || isSavingVariants}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Create Menu Item'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMenuItemPage; 