'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '../../../actions/profiles';

// Define form schema using Zod
const profileFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  avatar_url: z.string().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  company: z.string().optional(),
  position: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    full_name: '',
    avatar_url: '',
    bio: '',
    website: '',
    company: '',
    position: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormValues({
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        bio: user.user_metadata?.bio || '',
        website: user.user_metadata?.website || '',
        company: user.user_metadata?.company || '',
        position: user.user_metadata?.position || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const validateForm = () => {
    try {
      profileFormSchema.parse(formValues);
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
      
      // Use the new server action to update the profile
      const result = await updateUserProfile(user.id, formValues);
      
      if (result.success) {
        toast.success("Profile updated successfully");
        router.push('/dashboard');
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Profile</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
                    Avatar URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="avatar_url"
                      id="avatar_url"
                      value={formValues.avatar_url}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.avatar_url ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2`}
                    />
                    {formErrors.avatar_url && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.avatar_url}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formValues.bio}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.bio ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2`}
                    />
                    {formErrors.bio && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Brief description about yourself. Max 500 characters.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="website"
                      id="website"
                      value={formValues.website}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.website ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2`}
                    />
                    {formErrors.website && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.website}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formValues.company}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="position"
                      id="position"
                      value={formValues.position}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 