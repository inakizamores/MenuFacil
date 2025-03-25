'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
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
import { FormProvider, useForm, Controller, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { ArrayField } from '@/app/components/ui/ArrayField';
import { ObjectField } from '@/app/components/ui/ObjectField';

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
  
  // Use react-hook-form with Zod schema validation
  const methods = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
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

  const { handleSubmit, formState: { errors }, control, watch, setValue } = methods;
  
  // Watch for form values
  const formValues = watch();

  // Fetch category and menu data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await getCategory(categoryId);
        
        if (categoryData.error) {
          setError(categoryData.error);
          return;
        }
        
        setCategory(categoryData);
        setMenu(categoryData.menu);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);
  
  // Handle file upload progress
  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };
  
  // Handle upload state
  const handleUploadState = (isUploading: boolean) => {
    setIsUploading(isUploading);
  };
  
  // Handle variants change
  const handleVariantsChange = (variants: MenuItemVariant[]) => {
    setPendingVariants(variants);
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
        // Optional: Send these as additional data
        // The backend might need to be updated to handle these
        ...(values.ingredients?.length ? { ingredients: values.ingredients } : {}),
        ...(values.allergens?.length ? { allergens: values.allergens } : {}),
        ...(values.dietaryOptions?.length ? { dietary_options: values.dietaryOptions } : {}),
        // Convert nutritional info to JSON string for storage
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
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 max-w-md">
          <h2 className="text-red-800 text-lg font-medium mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Item to {category?.name}</h1>
        <p className="text-muted-foreground">Create a new menu item in the {menu?.name} menu</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Basic Information</h2>
              
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Margherita Pizza"
                        {...field}
                        error={errors.name?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the menu item..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <PriceInput
                        id="price"
                        name="price"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        error={errors.price?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormField
                  control={control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          id="isAvailable"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        Item is available for ordering
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          id="isPopular"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        Mark as popular item
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={control}
                name="preparationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preparation Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 15"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                        error={errors.preparationTime?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Image Upload and Additional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Image & Additional Details</h2>
              
              <FormField
                control={control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Image</FormLabel>
                    <FormControl>
                      <FileUpload
                        id="image"
                        value={field.value}
                        onChange={(file) => field.onChange(file)}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024} // 5MB
                        onProgress={handleUploadProgress}
                        onUploading={handleUploadState}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload an image of the menu item (max 5MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Complex data types using new components */}
              <ArrayField
                name="ingredients"
                label="Ingredients"
                placeholder="Add an ingredient"
                description="List all ingredients in this item"
                emptyMessage="No ingredients added yet"
              />
              
              <ArrayField
                name="allergens"
                label="Allergens"
                placeholder="Add an allergen"
                description="List any allergy information"
                emptyMessage="No allergens added yet"
              />
              
              <ArrayField
                name="dietaryOptions"
                label="Dietary Options"
                placeholder="Add dietary option"
                description="E.g., Vegetarian, Vegan, Gluten-Free"
                emptyMessage="No dietary options added yet"
              />
              
              <ObjectField
                name="nutritionalInfo"
                label="Nutritional Information"
                description="Enter nutritional facts per serving"
                fields={[
                  { key: 'calories', label: 'Calories', type: 'number', suffix: 'kcal' },
                  { key: 'protein', label: 'Protein', type: 'number', suffix: 'g' },
                  { key: 'carbs', label: 'Carbs', type: 'number', suffix: 'g' },
                  { key: 'fat', label: 'Fat', type: 'number', suffix: 'g' },
                  { key: 'sugar', label: 'Sugar', type: 'number', suffix: 'g' },
                  { key: 'fiber', label: 'Fiber', type: 'number', suffix: 'g' },
                  { key: 'sodium', label: 'Sodium', type: 'number', suffix: 'mg' },
                ]}
                columns={2}
              />
            </div>
          </div>
          
          {/* Variants Management */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-medium mb-4">Item Variants (Optional)</h2>
            <VariantsManager 
              variants={pendingVariants} 
              onChange={handleVariantsChange}
              error={variantError}
            />
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
      </FormProvider>
    </div>
  );
};

export default CreateMenuItemPage; 