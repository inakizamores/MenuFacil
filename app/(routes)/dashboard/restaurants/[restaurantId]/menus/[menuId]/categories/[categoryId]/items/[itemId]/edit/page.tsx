import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validate, combineValidators } from '@/lib/validation';
import { getCategory } from '@/actions/categories';
import { getMenuItem, updateMenuItem } from '@/actions/menuItems';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { PriceInput } from '@/components/ui/PriceInput';
import { Spinner } from '@/components/ui/Spinner';

type MenuItemFormValues = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime?: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
};

const EditMenuItemPage: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [menuItem, setMenuItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Get the restaurantId, menuId, categoryId, and itemId from the URL
  const path = window.location.pathname;
  const pathParts = path.split('/');
  const restaurantIdIndex = pathParts.indexOf('restaurants') + 1;
  const menuIdIndex = pathParts.indexOf('menus') + 1;
  const categoryIdIndex = pathParts.indexOf('categories') + 1;
  const itemIdIndex = pathParts.indexOf('items') + 1;
  
  const restaurantId = pathParts[restaurantIdIndex];
  const menuId = pathParts[menuIdIndex];
  const categoryId = pathParts[categoryIdIndex];
  const itemId = pathParts[itemIdIndex + 1]; // +1 because "items" is followed by the itemId
  
  // Form setup with validation
  const { 
    values, 
    errors, 
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues
  } = useForm<MenuItemFormValues>({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      isAvailable: true,
      isPopular: false,
      preparationTime: undefined,
      nutrition: {
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined
      }
    },
    validationSchema: {
      name: (value) => validate.required(value, 'Item name is required'),
      price: (value) => {
        if (value === undefined || value === null) {
          return 'Price is required';
        }
        if (value < 0) {
          return 'Price cannot be negative';
        }
        return null;
      }
    },
    onSubmit: async (values) => {
      try {
        if (!user) {
          setError('You must be logged in');
          return;
        }

        if (!menuItem) {
          setError('Menu item not found');
          return;
        }

        // Update the menu item
        const result = await updateMenuItem({
          id: itemId,
          name: values.name,
          description: values.description,
          price: values.price,
          image_url: values.imageUrl,
          is_available: values.isAvailable,
          is_popular: values.isPopular,
          preparation_time: values.preparationTime,
          nutrition_info: values.nutrition && Object.values(values.nutrition).some(val => val !== undefined) 
            ? JSON.stringify(values.nutrition)
            : null,
          category_id: categoryId
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        // Redirect back to category items page
        router.push(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`);
        router.refresh();
      } catch (err) {
        console.error('Error updating menu item:', err);
        setError('Failed to update menu item. Please try again.');
      }
    }
  });

  // Fetch menu item and category details
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !itemId || !categoryId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the menu item
        const itemResult = await getMenuItem(itemId);
        
        if (itemResult.error) {
          setError(itemResult.error);
          setIsLoading(false);
          return;
        }

        if (!itemResult.data) {
          setError('Menu item not found');
          setIsLoading(false);
          return;
        }

        setMenuItem(itemResult.data);

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
        
        // Set form values from menu item data
        const item = itemResult.data;
        let nutritionInfo = null;
        
        try {
          if (item.nutrition_info) {
            nutritionInfo = JSON.parse(item.nutrition_info);
          }
        } catch (e) {
          console.error('Error parsing nutrition info:', e);
        }
        
        setValues({
          name: item.name || '',
          description: item.description || '',
          price: item.price || 0,
          imageUrl: item.image_url || '',
          isAvailable: item.is_available !== false,
          isPopular: item.is_popular === true,
          preparationTime: item.preparation_time,
          nutrition: nutritionInfo || {
            calories: undefined,
            protein: undefined,
            carbs: undefined,
            fat: undefined
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu item details');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, itemId, categoryId, setValues]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
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
      setFieldValue('imageUrl', data.url);
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
        <h1 className="text-2xl font-semibold">Edit Menu Item</h1>
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
            Editing item in category: <span className="font-semibold">{category.name}</span>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Margherita Pizza"
                error={touched.name && errors.name ? errors.name : undefined}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
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
                value={values.price}
                onChange={(value) => setFieldValue('price', value)}
                onBlur={handleBlur}
                error={touched.price && errors.price ? errors.price : undefined}
              />
            </div>
            
            <div>
              <label htmlFor="preparationTime" className="block text-sm font-medium mb-1">
                Preparation Time (minutes)
              </label>
              <Input
                id="preparationTime"
                name="preparationTime"
                type="number"
                value={values.preparationTime || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 15"
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isAvailable"
                  name="isAvailable"
                  checked={values.isAvailable}
                  onCheckedChange={(checked) => 
                    setFieldValue('isAvailable', checked === true)
                  }
                />
                <label htmlFor="isAvailable" className="text-sm font-medium">
                  Available
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPopular"
                  name="isPopular"
                  checked={values.isPopular}
                  onCheckedChange={(checked) => 
                    setFieldValue('isPopular', checked === true)
                  }
                />
                <label htmlFor="isPopular" className="text-sm font-medium">
                  Popular
                </label>
              </div>
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
                preview={values.imageUrl}
              />
              {values.imageUrl && (
                <p className="mt-1 text-xs text-gray-500">
                  {menuItem?.image_url === values.imageUrl 
                    ? 'Current image' 
                    : 'New image uploaded successfully!'}
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Nutrition Information (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="calories" className="block text-sm font-medium mb-1">
                    Calories
                  </label>
                  <Input
                    id="calories"
                    name="nutrition.calories"
                    type="number"
                    value={values.nutrition?.calories || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., 450"
                  />
                </div>
                
                <div>
                  <label htmlFor="protein" className="block text-sm font-medium mb-1">
                    Protein (g)
                  </label>
                  <Input
                    id="protein"
                    name="nutrition.protein"
                    type="number"
                    value={values.nutrition?.protein || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., 10"
                  />
                </div>
                
                <div>
                  <label htmlFor="carbs" className="block text-sm font-medium mb-1">
                    Carbs (g)
                  </label>
                  <Input
                    id="carbs"
                    name="nutrition.carbs"
                    type="number"
                    value={values.nutrition?.carbs || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., 50"
                  />
                </div>
                
                <div>
                  <label htmlFor="fat" className="block text-sm font-medium mb-1">
                    Fat (g)
                  </label>
                  <Input
                    id="fat"
                    name="nutrition.fat"
                    type="number"
                    value={values.nutrition?.fat || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMenuItemPage; 