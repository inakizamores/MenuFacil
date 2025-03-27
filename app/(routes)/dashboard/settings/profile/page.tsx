'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ProfileTracker } from '@/app/components/ProfileTracker';
import { UserProfile } from '@/app/context/auth-context';
import { captureException } from '@/lib/sentry';
import { Check, User, Save, Upload } from 'lucide-react';
import Image from 'next/image';
import { uploadProfilePicture } from '@/actions/profiles';

/**
 * Profile Settings Page
 * 
 * Allows users to update their profile information including:
 * - Personal details
 * - Contact information
 * - Business information
 * - Profile picture
 */
export default function ProfileSettingsPage() {
  const { user, profile, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        website: profile.website || '',
        company: profile.company || '',
        position: profile.position || '',
        location: profile.location || '',
        timezone: profile.timezone || '',
        language: profile.language || '',
      });

      if (profile.avatar_url) {
        setPreviewUrl(profile.avatar_url);
      }
    }
  }, [profile]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors and success message when user makes changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (success) {
      setSuccess(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Basic validation
    const validationErrors: Record<string, string> = {};
    
    if (!formData.full_name || (formData.full_name as string).trim().length < 2) {
      validationErrors.full_name = 'Name must be at least 2 characters';
    }
    
    if (formData.website && !validateUrl(formData.website as string)) {
      validationErrors.website = 'Must be a valid URL (include http:// or https://)';
    }
    
    // Update errors state
    setErrors(validationErrors);
    
    // If there are errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    // Save profile data
    try {
      setIsSubmitting(true);
      
      const result = await updateProfile(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setSuccess('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      captureException(error);
      setErrors({ form: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setSelectedImage(file);
    
    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage || !user) return;
    
    try {
      setUploadingImage(true);
      
      const result = await uploadProfilePicture(user.id, selectedImage);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setSuccess('Profile picture uploaded successfully');
      
      // Update preview URL with the new image URL from the server
      if (result.avatarUrl) {
        setPreviewUrl(result.avatarUrl);
      }
      
      // Reset selected image
      setSelectedImage(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      captureException(error);
      setErrors({ image: 'Failed to upload profile picture. Please try again.' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Helper validation functions
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        {/* Main form */}
        <div className="space-y-6">
          {/* Profile picture section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile image preview */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="cursor-pointer"
                    />
                    
                    <Button
                      onClick={handleImageUpload}
                      disabled={!selectedImage || uploadingImage}
                      className="flex items-center"
                    >
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload Picture
                    </Button>
                    
                    {errors.image && (
                      <p className="text-red-500 text-sm">{errors.image}</p>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPEG, PNG, WebP, GIF. Max size: 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Profile information form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Basic details section */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name as string || ''}
                        onChange={handleInputChange}
                        className={errors.full_name ? 'border-red-500' : ''}
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-sm">{errors.full_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email as string || ''}
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed directly. Contact support for assistance.
                      </p>
                    </div>
                  </div>
                  
                  {/* First/Last name section */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name as string || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name as string || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  {/* Contact information */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone as string || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location as string || ''}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  
                  {/* Business information */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company
                      </label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company as string || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                        Position
                      </label>
                      <Input
                        id="position"
                        name="position"
                        value={formData.position as string || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  {/* Website and Bio */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website as string || ''}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                        className={errors.website ? 'border-red-500' : ''}
                      />
                      {errors.website && (
                        <p className="text-red-500 text-sm">{errors.website}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                        Preferred Language
                      </label>
                      <Input
                        id="language"
                        name="language"
                        value={formData.language as string || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. English, Spanish"
                      />
                    </div>
                  </div>
                  
                  {/* Bio section */}
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio as string || ''}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                {/* Error/Success messages */}
                <div>
                  {errors.form && (
                    <div className="bg-red-50 p-2 px-3 rounded-md">
                      <p className="text-red-500 text-sm">{errors.form}</p>
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-50 p-2 px-3 rounded-md">
                      <p className="text-green-600 text-sm flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        {success}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
        
        {/* Sidebar */}
        <div>
          <ProfileTracker className="sticky top-6" />
          
          <Card className="mt-6 bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 text-base">Profile Completion Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Restaurant owners can manage menus more effectively
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Staff can access restaurant features based on assigned roles
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Personalized recommendations and insights
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Better integration with the MenuFacil ecosystem
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 