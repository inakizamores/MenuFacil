'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/auth-context';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { updateUserSettings } from '../../../../actions/profiles';

// Define form schema using Zod
const settingsFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  language: z.enum(["en", "es"]),
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<SettingsFormValues>({
    full_name: '',
    email: '',
    language: 'en',
    theme: 'system',
    notifications: {
      email: true,
      push: true,
    },
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormValues({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        language: user.user_metadata?.language || 'en',
        theme: user.user_metadata?.theme || 'system',
        notifications: {
          email: user.user_metadata?.notifications?.email !== false,
          push: user.user_metadata?.notifications?.push !== false,
        },
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const [parent, child] = name.split('.');
      
      if (parent && child) {
        setFormValues({
          ...formValues,
          [parent]: {
            ...formValues[parent as keyof typeof formValues] as Record<string, boolean>,
            [child]: checked,
          },
        });
      }
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const validateForm = () => {
    try {
      settingsFormSchema.parse(formValues);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      
      // Use the new server action to update user settings
      const { language, theme, notifications, full_name } = formValues;
      const result = await updateUserSettings(user.id, {
        full_name,
        language,
        theme,
        notifications,
      });
      
      if (result.success) {
        toast.success("Settings updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error) {
      toast.error("Failed to update settings");
      console.error("Settings update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="full_name"
                        id="full_name"
                        value={formValues.full_name}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md border ${
                          formErrors.full_name ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2`}
                      />
                      {formErrors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.full_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formValues.email}
                        disabled
                        className="block w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <div className="mt-1">
                      <select
                        id="language"
                        name="language"
                        value={formValues.language}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                      Theme
                    </label>
                    <div className="mt-1">
                      <select
                        id="theme"
                        name="theme"
                        value={formValues.theme}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System (Auto)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="notifications.email"
                        name="notifications.email"
                        type="checkbox"
                        checked={formValues.notifications.email}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifications.email" className="font-medium text-gray-700">
                        Email notifications
                      </label>
                      <p className="text-gray-500">Get notified about menu views and updates via email</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="notifications.push"
                        name="notifications.push"
                        type="checkbox"
                        checked={formValues.notifications.push}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifications.push" className="font-medium text-gray-700">
                        Push notifications
                      </label>
                      <p className="text-gray-500">Receive push notifications on your device</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 