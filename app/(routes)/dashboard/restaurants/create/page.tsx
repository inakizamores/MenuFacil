'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/auth-context';
import { useForm } from '../../../../hooks/useForm';
import { validate, combineValidators } from '../../../../utils/validation';
import { createRestaurant } from '../../../../utils/db';
import Input from '../../../../components/ui/input';
import Button from '../../../../components/ui/button';

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
};

export default function CreateRestaurantPage() {
  const { user } = useAuth();
  const router = useRouter();
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

  const validationRules = {
    name: combineValidators(validate.required),
    email: combineValidators(validate.email),
    phone: combineValidators(validate.phone),
    website: combineValidators(validate.url),
  };

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
        owner_id: user.id as `${string}-${string}-${string}-${string}-${string}`,
        logo_url: null,
        social_media: null,
        business_hours: null,
        is_active: true
      });

      if (newRestaurant) {
        router.push(`/dashboard/restaurants/${newRestaurant.id}`);
      } else {
        setServerError('Failed to create restaurant. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
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
              onClick={() => router.push('/dashboard/restaurants')}
              type="button"
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
        </form>
      </div>
    </div>
  );
} 