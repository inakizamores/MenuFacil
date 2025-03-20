'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useForm } from '@/app/hooks/useForm';
import { createRestaurant } from '@/app/utils/db';
import Input from '@/app/components/ui/input';
import Button from '@/app/components/ui/button';
import { useToast } from '@/components/ui/useToast';
import { restaurantSchema } from '@/lib/validation/schemas';
import { createValidationRules } from '@/lib/validation/index';
import type { RestaurantFormValues } from '@/lib/validation/schemas';
import type { UUID } from 'crypto';

export default function CreateRestaurantPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: RestaurantFormValues = {
    name: '',
    description: '',
    primaryColor: '#4F46E5', // Default indigo color
    secondaryColor: '#818CF8', // Default light indigo
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
  };

  // Create validation rules from Zod schema
  const validationRules = createValidationRules(restaurantSchema);

  const handleCreateRestaurant = async (values: RestaurantFormValues) => {
    if (!user?.id) {
      setServerError('You must be logged in to create a restaurant');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const newRestaurant = await createRestaurant({
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
        owner_id: user.id as unknown as UUID,
        logo_url: null,
        social_media: null,
        business_hours: null,
        is_active: true
      });

      if (newRestaurant) {
        toast({
          title: "Success!",
          description: "Restaurant created successfully.",
          type: "success",
        });
        router.push(`/dashboard/restaurants/${newRestaurant.id}`);
      } else {
        setServerError('Failed to create restaurant. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      setServerError(error.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: error.message || 'An unexpected error occurred',
        type: "error",
      });
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
  } = useForm<RestaurantFormValues>(initialValues, validationRules, handleCreateRestaurant);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Restaurant</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to add a new restaurant to your account.
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
                id="restaurant-name"
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
                  error={errors.primaryColor}
                  touched={touched.primaryColor}
                  id="primary-color"
                />

                <Input
                  label="Secondary Color"
                  name="secondaryColor"
                  type="color"
                  value={values.secondaryColor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.secondaryColor}
                  touched={touched.secondaryColor}
                  id="secondary-color"
                />
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
                  id="phone"
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
                  id="email"
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
                id="website"
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
                error={errors.address}
                touched={touched.address}
                id="address"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="City"
                  name="city"
                  type="text"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.city}
                  touched={touched.city}
                  id="city"
                />

                <Input
                  label="State / Province"
                  name="state"
                  type="text"
                  value={values.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.state}
                  touched={touched.state}
                  id="state"
                />

                <Input
                  label="Postal Code"
                  name="postalCode"
                  type="text"
                  value={values.postalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.postalCode}
                  touched={touched.postalCode}
                  id="postal-code"
                />
              </div>

                <Input
                  label="Country"
                  name="country"
                  type="text"
                  value={values.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.country}
                  touched={touched.country}
                  id="country"
                />
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/restaurants')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Restaurant
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 