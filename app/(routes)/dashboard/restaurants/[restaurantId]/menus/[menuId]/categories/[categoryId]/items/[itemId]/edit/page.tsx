'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { getMenuItem, updateMenuItem } from '@/actions/menuItems';
import { getItemVariants, saveItemVariants } from '@/actions/menuItemVariants';
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
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { ArrayField } from '@/app/components/ui/ArrayField';
import { ObjectField } from '@/app/components/ui/ObjectField';

interface RouteParams {
  restaurantId: string;
  menuId: string;
  categoryId: string;
  itemId: string;
}

const EditMenuItemPage: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuItem, setMenuItem] = useState<any>(null);
  const [variants, setVariants] = useState<MenuItemVariant[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Get the route params from the URL
  const path = window.location.pathname;
  const pathParts = path.split('/');
  const restaurantIdIndex = pathParts.indexOf('restaurants') + 1;
  const menuIdIndex = pathParts.indexOf('menus') + 1;
  const categoryIdIndex = pathParts.indexOf('categories') + 1;
  const itemIdIndex = pathParts.indexOf('items') + 1;
  
  const restaurantId = pathParts[restaurantIdIndex];
  const menuId = pathParts[menuIdIndex];
  const categoryId = pathParts[categoryIdIndex];
  const itemId = pathParts[itemIdIndex];
  
  // Setup react-hook-form with Zod validation
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
  
  const { handleSubmit, formState: { errors }, control, reset, setValue, watch } = methods;
  
  // Fetch menu item and variants data
  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) {
        setIsLoading(false);
        setError('Menu item ID is missing');
        return;
      }
      
      try {
        // Fetch the menu item
        const menuItemData = await getMenuItem(itemId);
        
        if (!menuItemData || menuItemData.error) {
          setError(menuItemData?.error || 'Failed to fetch menu item data');
          return;
        }
        
        setMenuItem(menuItemData);
        
        // Parse nutritional info if available
        let nutritionalInfo = undefined;
        if (menuItemData.nutrition_info) {
          try {
            nutritionalInfo = JSON.parse(menuItemData.nutrition_info);
          } catch (e) {
            console.error('Error parsing nutritional info:', e);
          }
        }
        
        // Initialize form with menu item data
        reset({
          name: menuItemData.name,
          description: menuItemData.description || '',
          price: menuItemData.price,
          image: null, // Image will need to be uploaded again if needed
          isAvailable: menuItemData.is_available,
          isPopular: menuItemData.is_popular,
          preparationTime: menuItemData.preparation_time,
          ingredients: menuItemData.ingredients || [],
          allergens: menuItemData.allergens || [],
          dietaryOptions: menuItemData.dietary_options || [],
          nutritionalInfo: nutritionalInfo,
        });
        
        // Fetch item variants
        const variantsData = await getItemVariants(itemId);
        
        if (variantsData && !variantsData.error) {
          setVariants(variantsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu item data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [itemId, reset]);
  
  // Handle file upload progress
  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };
  
  // Handle upload state
  const handleUploadState = (isUploading: boolean) => {
    setIsUploading(isUploading);
  };
  
  // Handle variants change
  const handleVariantsChange = (updatedVariants: MenuItemVariant[]) => {
    setVariants(updatedVariants);
  };
  
  // Handle form submission
  const onSubmit = async (values: MenuItemFormValues) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update the menu item
      const result = await updateMenuItem({
        id: itemId,
        name: values.name,
        description: values.description || '',
        price: values.price,
        isAvailable: values.isAvailable,
        isPopular: values.isPopular,
        preparationTime: values.preparationTime,
        image: values.image,
        // Optional: Send these as additional data if present
        ...(values.ingredients?.length ? { ingredients: values.ingredients } : {}),
        ...(values.allergens?.length ? { allergens: values.allergens } : {}),
        ...(values.dietaryOptions?.length ? { dietaryOptions: values.dietaryOptions } : {}),
        nutritionInfo: values.nutritionalInfo ? JSON.stringify(values.nutritionalInfo) : null,
      });
      
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      
      // Update variants if they've changed
      if (variants && variants.length > 0) {
        await saveItemVariants(itemId, variants);
      }
      
      // Redirect back to the menu item list
      router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`);
      router.refresh();
    } catch (err) {
      console.error('Error updating menu item:', err);
      setError('Failed to update menu item');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
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
        <h1 className="text-2xl font-bold">Edit Menu Item</h1>
        <p className="text-muted-foreground">Update details for {menuItem?.name}</p>
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
                        value={field.value}
                        onChange={(file) => field.onChange(file)}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024} // 5MB
                        onProgress={handleUploadProgress}
                        onUploading={handleUploadState}
                        currentImageUrl={menuItem?.image_url}
                      />
                    </FormControl>
                    <div className="text-sm text-gray-500 mt-1">
                      Upload a new image or keep the existing one
                    </div>
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
            <h2 className="text-xl font-medium mb-4">Item Variants</h2>
            <p className="text-sm text-gray-500 mb-4">
              Add variations like size or options for this menu item
            </p>
            
            <VariantsManager 
              initialVariants={variants}
              itemId={itemId}
              onChange={handleVariantsChange}
            />
          </div>
          
          <div className="border-t pt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Update Menu Item'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EditMenuItemPage; 