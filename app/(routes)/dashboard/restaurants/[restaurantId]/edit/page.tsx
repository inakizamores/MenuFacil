'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useForm } from '@/app/hooks/useForm';
import { validate, combineValidators } from '@/app/utils/validation';
import { getRestaurant, updateRestaurant } from '@/app/utils/db';
import Input from '@/app/components/ui/input';
import Button from '@/app/components/ui/button';

type RestaurantFormValues = {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
};

interface EditRestaurantPageProps {
  params: {
    restaurantId: string;
  };
}

export default function EditRestaurantPage({ params }: EditRestaurantPageProps) {
  const { restaurantId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Default values that will be updated after fetching restaurant data
  const initialValues: RestaurantFormValues = {
    name: '',
    description: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#818CF8',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    isActive: true,
  };

  const validationRules = {
    name: combineValidators(validate.required),
    email: combineValidators(validate.email),
    phone: combineValidators(validate.phone),
    website: combineValidators(validate.url),
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const restaurantData = await getRestaurant(restaurantId);
        
        if (!restaurantData) {
          setLoadError('Restaurant not found');
        } else {
          setRestaurant(restaurantData);
          
          // Update form values with restaurant data
          setFieldValue('name', restaurantData.name);
          setFieldValue('description', restaurantData.description || '');
          setFieldValue('primaryColor', restaurantData.primary_color);
          setFieldValue('secondaryColor', restaurantData.secondary_color);
          setFieldValue('address', restaurantData.address || '');
          setFieldValue('city', restaurantData.city || '');
          setFieldValue('state', restaurantData.state || '');
          setFieldValue('postalCode', restaurantData.postal_code || '');
          setFieldValue('country', restaurantData.country || '');
          setFieldValue('phone', restaurantData.phone || '');
          setFieldValue('email', restaurantData.email || '');
          setFieldValue('website', restaurantData.website || '');
          setFieldValue('isActive', restaurantData.is_active);
        }
      } catch (err: any) {
        console.error('Error fetching restaurant:', err);
        setLoadError(err.message || 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, user, router]);

  const handleUpdateRestaurant = async (values: RestaurantFormValues) => {
    if (!user?.id || !restaurant) {
      setServerError('You must be logged in and restaurant must exist to update');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const updatedRestaurant = await updateRestaurant(restaurantId, {
        name: values.name,
        description: values.description || null,
        primary_color: values.primaryColor,
        secondary_color: values.secondaryColor,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        postal_code: values.postalCode || null,
        country: values.country || null,
        phone: values.phone || null,
        email: values.email || null,
        website: values.website || null,
        is_active: values.isActive
      });

      if (updatedRestaurant) {
        router.push(`/dashboard/restaurants/${restaurantId}`);
      } else {
        setServerError('Failed to update restaurant. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
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
  } = useForm<RestaurantFormValues>(initialValues, validationRules, handleUpdateRestaurant);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (loadError || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">
          {loadError || 'Restaurant not found'}
        </h1>
        <Button onClick={() => router.push('/dashboard/restaurants')}>
          Back to Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Restaurant</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your restaurant information.
        </p>
      </div>

      <div className="bg-white p-6 shadow sm:rounded-lg">
        {serverError && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              
              <Input
                label="Restaurant Name"
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Primary Color"
                  name="primaryColor"
                  type="color"
                  value={values.primaryColor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <Input
                  label="Secondary Color"
                  name="secondaryColor"
                  type="color"
                  value={values.secondaryColor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
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
            </div>

            {/* Contact Information */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phone}
                  touched={touched.phone}
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                />
              </div>

              <Input
                label="Website"
                name="website"
                type="url"
                value={values.website}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.website}
                touched={touched.website}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900">Location</h2>
              
              <Input
                label="Street Address"
                name="address"
                type="text"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="City"
                  name="city"
                  type="text"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <Input
                  label="State/Province"
                  name="state"
                  type="text"
                  value={values.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Postal Code"
                  name="postalCode"
                  type="text"
                  value={values.postalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <Input
                  label="Country"
                  name="country"
                  type="text"
                  value={values.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/restaurants/${restaurantId}`)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Update Restaurant
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 