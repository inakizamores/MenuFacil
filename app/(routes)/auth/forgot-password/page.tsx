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
    <>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="bg-white p-8 shadow-lg rounded-xl">
        {/* Display server-side errors */}
        {serverError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}
        
        {/* Display success message when reset link is sent */}
        {isSuccess && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
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
            variant="primary"
            fullWidth
            isLoading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
            className="mt-6"
          >
            Send reset link
          </Button>

          {/* Back to login link */}
          <div className="text-center text-sm mt-4">
            <Link href="/auth/login" className="font-medium text-brand-accent hover:text-brand-accent/80">
              Back to login
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
} 