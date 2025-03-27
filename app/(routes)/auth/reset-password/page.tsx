'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { useZodForm } from '../../../hooks/useZodForm';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import { resetPasswordSchema } from '@/lib/validation/schemas';
import type { ResetPasswordFormValues } from '@/lib/validation/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/app/components/ui/form';

/**
 * ResetPasswordPage - Password reset form
 * 
 * This component allows users to create a new password after receiving a reset link.
 * It implements modern form validation using Zod schemas with React Hook Form,
 * validates the reset token from URL params, and handles the password reset process.
 * 
 * The form includes password and confirmation inputs with matching validation.
 */
export default function ResetPasswordPage() {
  const { resetUserPassword } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize form with Zod schema validation and default values
  const form = useZodForm({
    schema: resetPasswordSchema,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * Handle form submission for password reset
   * Submits the new password with the reset token
   * Shows success feedback and redirects to login after success
   */
  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!token) return;

    setServerError(null);
    try {
      await resetUserPassword(values.password);
      setIsSuccess(true);
      // Redirect to login page after successful password reset
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setServerError(error.message || 'Failed to reset password. Please try again.');
    }
  };

  /**
   * Extract token from URL parameters on component mount
   * Redirects to login if no token is provided
   */
  useEffect(() => {
    // Extract token from URL on client side
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      // Redirect if no token is provided
      router.push('/auth/login');
    }
  }, [router]);

  // Show success message after password reset
  if (isSuccess) {
    return (
      <>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Password reset successful
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been reset successfully. You will be redirected to login shortly.
          </p>
          <div className="mt-4">
            <Link href="/auth/login" className="font-medium text-brand-accent hover:text-brand-accent/80">
              Go to login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter a new password for your account
        </p>
      </div>

      <div className="bg-white p-8 shadow-lg rounded-xl">
        {/* Display server-side errors */}
        {serverError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}
        
        {/* Password reset form with validation */}
        <Form form={form} onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
          {/* New password field with validation and requirements description */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input 
                    id="password"
                    type="password" 
                    autoComplete="new-password"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm password field with matching validation */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input 
                    id="confirmPassword"
                    type="password" 
                    autoComplete="new-password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button with loading state */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
            className="mt-6"
          >
            Reset password
          </Button>
        </Form>
      </div>
    </>
  );
} 