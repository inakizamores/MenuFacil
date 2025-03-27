'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ProfileTracker } from '@/app/components/ProfileTracker';
import { ArrowLeft, ArrowRight, Check, Building, MapPin, Globe, Phone, Image as ImageIcon } from 'lucide-react';
import { captureException } from '@/lib/sentry';
import { UserProfile } from '@/app/context/auth-context';

/**
 * Onboarding steps
 */
type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: Array<keyof UserProfile>;
};

/**
 * Onboarding page component
 * Guides users through completing their profile information
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, updateProfile, completeOnboarding, isLoading } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Define the onboarding steps
  const steps: Step[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Let\'s start with your basic information',
      icon: <Check className="h-6 w-6" />,
      fields: ['full_name', 'email']
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'How can others reach you?',
      icon: <Phone className="h-6 w-6" />,
      fields: ['phone', 'location']
    },
    {
      id: 'business',
      title: 'Business Information',
      description: 'Tell us about your business',
      icon: <Building className="h-6 w-6" />,
      fields: ['company', 'position']
    },
    {
      id: 'additional',
      title: 'Additional Information',
      description: 'Anything else you\'d like to share?',
      icon: <Globe className="h-6 w-6" />,
      fields: ['website', 'bio']
    },
    {
      id: 'complete',
      title: 'Complete Your Profile',
      description: 'Review your profile and complete the setup',
      icon: <Check className="h-6 w-6" />,
      fields: []
    }
  ];

  // Initialize form data with user profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        company: profile.company || '',
        position: profile.position || '',
        website: profile.website || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, user]);

  const currentStep = steps[currentStepIndex];

  // Navigate to previous step
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Navigate to next step after validation
  const handleNextStep = async () => {
    // Validate current step fields
    const stepErrors: Record<string, string> = {};
    currentStep.fields.forEach(field => {
      if (field === 'full_name' && (!formData[field] || (formData[field] as string).trim().length < 2)) {
        stepErrors[field] = 'Name must be at least 2 characters';
      }
      if (field === 'email' && (!formData[field] || !validateEmail(formData[field] as string))) {
        stepErrors[field] = 'Valid email is required';
      }
      if (field === 'website' && formData[field] && !validateUrl(formData[field] as string)) {
        stepErrors[field] = 'Must be a valid URL (include http:// or https://)';
      }
    });

    // Update errors state
    setErrors(stepErrors);

    // If there are no errors, proceed or save
    if (Object.keys(stepErrors).length === 0) {
      if (currentStepIndex < steps.length - 1) {
        // Move to next step
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // Final step - save all data and complete onboarding
        await handleSaveProfile(true);
      }
    }
  };

  // Save profile data to database
  const handleSaveProfile = async (complete = false) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      // Save profile data
      const result = await updateProfile(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // If final step, mark onboarding as complete
      if (complete) {
        const completeResult = await completeOnboarding();
        
        if (!completeResult.success) {
          throw new Error(completeResult.error);
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      captureException(error);
      setErrors({ form: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Helper validation functions
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Calculate progress percentage
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-6">
      {/* Main form area */}
      <Card className="shadow-md">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              {currentStep.icon}
            </div>
            <CardTitle>{currentStep.title}</CardTitle>
          </div>
          <CardDescription>{currentStep.description}</CardDescription>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div
              className="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full ${
                    index < currentStepIndex ? 'bg-blue-600' :
                    index === currentStepIndex ? 'border-2 border-blue-600' :
                    'border-2 border-gray-300'
                  }`}
                ></div>
                <span className="text-xs mt-1 hidden md:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 pb-4">
          {currentStepIndex === steps.length - 1 ? (
            // Final review step
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Review Your Information</h3>
              
              <div className="grid grid-cols-1 gap-4 mt-4">
                {Object.entries(formData).map(([key, value]) => 
                  value ? (
                    <div key={key} className="flex border-b pb-2">
                      <div className="font-medium w-1/3 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </div>
                      <div className="flex-1 text-gray-700">
                        {key === 'bio' 
                          ? <p className="whitespace-pre-line">{value}</p>
                          : <p>{value.toString()}</p>
                        }
                      </div>
                    </div>
                  ) : null
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <p className="text-blue-700">
                  By completing your profile, you'll be able to access all features of MenuFacil. 
                  You can always update your profile information later.
                </p>
              </div>
            </div>
          ) : (
            // Form step
            <div className="space-y-4">
              {currentStep.fields.map(field => (
                <div key={field} className="space-y-2">
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-700 capitalize"
                  >
                    {field.toString().replace(/_/g, ' ')}
                    {(field === 'full_name' || field === 'email') && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  
                  {field === 'bio' ? (
                    <Textarea
                      id={field}
                      name={field}
                      value={formData[field] as string || ''}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder={`Enter your ${field.toString().replace(/_/g, ' ')}`}
                      className={`w-full ${errors[field] ? 'border-red-500' : ''}`}
                    />
                  ) : (
                    <Input
                      id={field}
                      name={field}
                      type={field === 'email' ? 'email' : 'text'}
                      value={formData[field] as string || ''}
                      onChange={handleInputChange}
                      placeholder={`Enter your ${field.toString().replace(/_/g, ' ')}`}
                      className={errors[field] ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
              
              {errors.form && (
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-red-500 text-sm">{errors.form}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            onClick={handlePrevStep}
            variant="outline"
            disabled={currentStepIndex === 0 || isSubmitting}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStepIndex < steps.length - 1 && (
              <Button
                onClick={() => handleSaveProfile(false)}
                variant="outline"
                disabled={isSubmitting}
              >
                Save Progress
              </Button>
            )}
            
            <Button
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : currentStepIndex < steps.length - 1 ? (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Profile tracker sidebar */}
      <div>
        <ProfileTracker showActions={false} className="sticky top-6" />
        
        <Card className="mt-6 bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm">
              Complete your profile to get the most out of MenuFacil. All fields marked with * are required.
            </p>
            <div className="mt-4 text-sm text-blue-700">
              <p className="mb-2">Why complete your profile?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Personalize your experience</li>
                <li>Enable all platform features</li>
                <li>Improve restaurant management</li>
                <li>Better customer service</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 