'use client';

import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { useZodForm } from '../../../hooks/useZodForm';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import { useState } from 'react';
import { forgotPasswordSchema } from '@/lib/validation/schemas';
import type { ForgotPasswordFormValues } from '@/lib/validation/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';

/**
 * ForgotPasswordPage - Password reset request form
 * 
 * This component allows users to request a password reset by entering their email.
 * It implements modern form validation using Zod schemas and React Hook Form,
 * with clear success/error feedback to improve user experience.
 */
export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form with Zod schema validation and default values
  const form = useZodForm({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handle form submission for password reset request
   * Sends a password reset link to the provided email address
   * Shows appropriate success/error feedback to the user
   */
  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    setIsSuccess(false);
    try {
      await forgotPassword(values.email);
      setIsSuccess(true); // Show success message when email is sent
    } catch (error: any) {
      setServerError(error.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {/* Display server-side errors */}
          {serverError && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {serverError}
            </div>
          )}
          
          {/* Display success message when reset link is sent */}
          {isSuccess && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
              Password reset link sent! Check your email for instructions.
            </div>
          )}
          
          {/* Forgot password form with email validation */}
          <Form form={form} onSubmit={form.handleSubmit(handleForgotPassword)} className="space-y-6">
            {/* Email field with validation */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input 
                      id="email"
                      type="email" 
                      autoComplete="email"
                      placeholder="your@email.com"
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
              fullWidth
              isLoading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting}
            >
              Send reset link
            </Button>

            {/* Back to login link */}
            <div className="text-center text-sm">
              <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                Back to login
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
} 