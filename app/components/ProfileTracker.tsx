'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { captureException } from '@/lib/sentry';

// Modified version for this component since we might not have the UI components
const Badge = ({ 
  children, 
  variant, 
  className = ''
}: { 
  children: React.ReactNode, 
  variant: string, 
  className?: string 
}) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    variant === 'success' ? 'bg-green-100 text-green-800' :
    variant === 'outline' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
    'bg-gray-100 text-gray-800'
  } ${className}`}>
    {children}
  </span>
);

// Simple progress bar component
const Progress = ({ value = 0, className = '', indicatorColor = 'bg-blue-500' }: { 
  value: number, 
  className?: string,
  indicatorColor?: string 
}) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div 
      className={`h-2.5 rounded-full ${indicatorColor}`} 
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

/**
 * Component to track and display user profile completion status
 * It shows which fields are completed and which need attention
 */
export function ProfileTracker({ 
  showDetails = true,
  showActions = true,
  className = '' 
}: { 
  showDetails?: boolean; 
  showActions?: boolean;
  className?: string;
}) {
  const { profile, user, completeOnboarding } = useAuth();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completionStatus, setCompletionStatus] = useState<{
    field: string;
    label: string;
    completed: boolean;
    required: boolean;
  }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate profile completion status
  useEffect(() => {
    if (!profile) return;

    // Define required and optional fields to check
    const fieldsToCheck = [
      { field: 'full_name', label: 'Full Name', required: true },
      { field: 'email', label: 'Email', required: true },
      { field: 'phone', label: 'Phone Number', required: false },
      { field: 'avatar_url', label: 'Profile Picture', required: false },
      { field: 'location', label: 'Location', required: false },
      { field: 'bio', label: 'Bio', required: false },
      { field: 'company', label: 'Company', required: false },
      { field: 'website', label: 'Website', required: false },
    ];

    // Check completion status for each field
    const statuses = fieldsToCheck.map(field => ({
      ...field,
      completed: !!profile[field.field as keyof typeof profile]
    }));

    // Calculate completion percentage (count only required fields for percentage)
    const requiredFields = statuses.filter(s => s.required);
    const completedRequiredFields = requiredFields.filter(s => s.completed);
    const completedOptionalFields = statuses.filter(s => !s.required && s.completed);
    
    // Add 10% for each completed required field and 5% for each optional field
    const requiredPercentage = (completedRequiredFields.length / requiredFields.length) * 70;
    const optionalPercentage = Math.min(
      (completedOptionalFields.length / (statuses.length - requiredFields.length)) * 30,
      30
    );
    
    // Add extra 10% if email is verified
    const verificationBonus = profile.verified ? 10 : 0;
    
    const totalPercentage = Math.min(
      Math.round(requiredPercentage + optionalPercentage + verificationBonus),
      100
    );
    
    setCompletionPercentage(totalPercentage);
    setCompletionStatus([
      ...statuses,
      // Add email verification status
      { 
        field: 'verified', 
        label: 'Email Verified', 
        completed: !!profile.verified, 
        required: true 
      }
    ]);
  }, [profile]);

  // Handle marking onboarding as complete
  const handleCompleteOnboarding = async () => {
    if (!user || isProcessing) return;
    
    try {
      setIsProcessing(true);
      const result = await completeOnboarding();
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      captureException(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Completion
          <Badge variant={completionPercentage === 100 ? "success" : "outline"}>
            {completionPercentage}%
          </Badge>
        </CardTitle>
        <CardDescription>
          {profile.onboarding_completed 
            ? 'Your profile setup is complete' 
            : 'Complete your profile to get the most out of MenuFacil'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress 
          value={completionPercentage} 
          className="mb-4" 
          indicatorColor={
            completionPercentage < 50 ? 'bg-red-500' :
            completionPercentage < 80 ? 'bg-amber-500' :
            'bg-green-500'
          }
        />
        
        {showDetails && (
          <div className="grid gap-2 mt-4">
            {completionStatus.map((status) => (
              <div key={status.field} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {status.completed ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : status.required ? (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{status.label}</span>
                  {status.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <Badge variant={status.completed ? "success" : "outline"}>
                  {status.completed ? 'Completed' : 'Incomplete'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {showActions && !profile.onboarding_completed && (
        <CardFooter className="flex justify-between">
          <Link href="/settings/profile">
            <Button variant="outline">
              Update Profile
            </Button>
          </Link>
          <Button 
            onClick={handleCompleteOnboarding}
            disabled={isProcessing || completionPercentage < 100}
          >
            {isProcessing ? 'Processing...' : 'Mark Setup Complete'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 