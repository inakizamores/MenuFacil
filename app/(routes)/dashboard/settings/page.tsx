/**
 * User Settings Page Component
 * 
 * This component provides a comprehensive user settings interface with the following features:
 * - Profile information management (name, profile picture)
 * - User preferences (language, theme)
 * - Notification settings
 * - Password management
 * 
 * The page uses a tabbed interface to organize settings into logical sections
 * and implements comprehensive form validation using Zod schemas.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/auth-context';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { updateUserSettings, updateUserPassword, uploadProfilePicture } from '@/actions/profiles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

// Define form schemas using Zod for validation
// Settings form includes profile info, language, theme and notification preferences
const settingsFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  language: z.enum(["en", "es"]),
  theme: z.enum(["light", "system"]),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
});

// Password form includes current password, new password and confirmation
// with a custom refinement to ensure passwords match
const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Infer TypeScript types from Zod schemas for type safety
type SettingsFormValues = z.infer<typeof settingsFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  // Get user data and loading state from auth context
  const { user, isLoading } = useAuth();
  
  // State for UI management
  const [activeTab, setActiveTab] = useState<string>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPwdSubmitting, setIsPwdSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Reference for the hidden file input (profile picture upload)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Form values and errors - main settings form
  const [formValues, setFormValues] = useState<SettingsFormValues>({
    full_name: '',
    email: '',
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
    },
  });
  
  // Form values and errors - password change form
  const [passwordValues, setPasswordValues] = useState<PasswordFormValues>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Error storage for form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Populate form values when user data is available
  useEffect(() => {
    if (user) {
      setFormValues({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        language: user.user_metadata?.language || 'en',
        theme: user.user_metadata?.theme || 'light',
        notifications: {
          email: user.user_metadata?.notifications?.email !== false,
          push: user.user_metadata?.notifications?.push !== false,
        },
      });
      
      // Set avatar URL if it exists in user metadata
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  /**
   * Handle input changes for the settings form
   * Special handling for checkbox inputs (notifications)
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      // Handle checkbox inputs for nested objects (notifications)
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
      // Handle regular text/select inputs
      setFormValues({ ...formValues, [name]: value });
    }
  };
  
  /**
   * Handle input changes for the password form
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordValues({ ...passwordValues, [name]: value });
  };

  /**
   * Validate the settings form using Zod schema
   * Returns true if valid, false if invalid
   */
  const validateSettingsForm = () => {
    try {
      // Attempt to parse form values with the schema
      settingsFormSchema.parse(formValues);
      // Clear any previous errors if valid
      setFormErrors({});
      return true;
    } catch (error) {
      // Handle Zod validation errors by mapping them to form fields
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
  
  /**
   * Validate the password form using Zod schema
   * Returns true if valid, false if invalid
   */
  const validatePasswordForm = () => {
    try {
      // Attempt to parse password values with the schema
      passwordFormSchema.parse(passwordValues);
      // Clear any previous errors if valid
      setPasswordErrors({});
      return true;
    } catch (error) {
      // Handle Zod validation errors by mapping them to form fields
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setPasswordErrors(errors);
      }
      return false;
    }
  };

  /**
   * Handle settings form submission
   * Validates form and sends data to server action
   */
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateSettingsForm()) return;
    
    // Set loading state while submitting
    setIsSubmitting(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      
      // Extract form values and call server action
      const { language, notifications, full_name, theme } = formValues;
      const result = await updateUserSettings(user.id, {
        full_name,
        language,
        notifications,
        theme,
      });
      
      // Handle success or error response
      if (result.success) {
        toast.success("Settings updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error("Failed to update settings");
      console.error("Settings update error:", error);
    } finally {
      // Reset loading state
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handle password form submission
   * Validates form and sends data to server action
   */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validatePasswordForm()) return;
    
    // Set loading state while submitting
    setIsPwdSubmitting(true);
    
    try {
      // Extract password values and call server action
      const { currentPassword, newPassword } = passwordValues;
      const result = await updateUserPassword(currentPassword, newPassword);
      
      // Handle success or error response
      if (result.success) {
        toast.success("Password updated successfully");
        // Reset form after successful password change
        setPasswordValues({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.error || "Failed to update password");
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error("Failed to update password");
      console.error("Password update error:", error);
    } finally {
      // Reset loading state
      setIsPwdSubmitting(false);
    }
  };
  
  /**
   * Handle avatar click to trigger file upload dialog
   */
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  /**
   * Handle file selection for profile picture upload
   * Validates file type and size before uploading
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size is 2MB");
      return;
    }
    
    // Set loading state while uploading
    setIsUploading(true);
    
    try {
      // Upload file using server action
      const result = await uploadProfilePicture(user.id, file);
      
      // Handle success or error response
      if (result.success) {
        setAvatarUrl(result.url || null);
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(result.error || "Failed to upload profile picture");
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error("Failed to upload profile picture");
      console.error("Upload error:", error);
    } finally {
      // Reset loading state and file input
      setIsUploading(false);
      
      // Reset the file input for future uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show loading spinner while auth state is loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <Spinner />
      </div>
    );
  }

  // Main settings page UI with tabbed interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Tabbed interface for settings organization */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            {/* General Settings Tab (profile, preferences, notifications) */}
            <TabsContent value="general">
              <Card className="p-6">
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  {/* Profile Section */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                    
                    {/* Profile Picture Upload Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                      <div className="relative">
                        {/* Avatar display with click handler for upload */}
                        <div 
                          className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-primary-100 hover:border-primary-300 transition-colors"
                          onClick={handleAvatarClick}
                        >
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt="Profile" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl text-gray-400">
                              {formValues.full_name.charAt(0).toUpperCase() || 'U'}
                            </span>
                          )}
                          
                          {/* Loading overlay while uploading */}
                          {isUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <Spinner className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>
                        {/* Hidden file input triggered by avatar click */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Click on the avatar to upload a new image.
                        </p>
                        <p className="text-xs text-gray-400">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>
                    
                    {/* Profile Information Form Fields */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Full Name Field */}
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
                          {/* Error message display */}
                          {formErrors.full_name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.full_name}</p>
                          )}
                        </div>
                      </div>

                      {/* Email Field (read-only) */}
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
                      {/* Language Preference */}
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
                      
                      {/* Theme Preference */}
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
                            <option value="system">System Default</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            MenuFácil currently only supports a light theme
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                    
                    <div className="space-y-4">
                      {/* Email Notifications Toggle */}
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

                      {/* Push Notifications Toggle */}
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
                  
                  {/* Form Actions */}
                  <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
            
            {/* Security Tab (password management) */}
            <TabsContent value="security">
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Current Password Field */}
                    <div className="sm:col-span-4">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={passwordValues.currentPassword}
                          onChange={handlePasswordChange}
                          className={`block w-full rounded-md border ${
                            passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2`}
                        />
                        {/* Error message display */}
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* New Password Field */}
                    <div className="sm:col-span-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={passwordValues.newPassword}
                          onChange={handlePasswordChange}
                          className={`block w-full rounded-md border ${
                            passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2`}
                        />
                        {/* Error message display */}
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Confirm Password Field */}
                    <div className="sm:col-span-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordValues.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`block w-full rounded-md border ${
                            passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2`}
                        />
                        {/* Error message display */}
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isPwdSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {isPwdSubmitting ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </form>
                
                {/* Security Information Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Account Security</h2>
                  
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            For your security, make sure your password:
                          </p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Is at least 8 characters long</li>
                            <li>Includes a mix of upper and lower case letters</li>
                            <li>Contains at least one number or special character</li>
                            <li>Is not a password you use on other sites</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 