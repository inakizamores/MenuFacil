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

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use Zod form with schema validation
  const form = useZodForm({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: '',
    },
  });

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    setIsSuccess(false);
    try {
      await forgotPassword(values.email);
      setIsSuccess(true);
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
          {serverError && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {serverError}
            </div>
          )}
          
          {isSuccess && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
              Password reset link sent! Check your email for instructions.
            </div>
          )}
          
          <Form form={form} onSubmit={form.handleSubmit(handleForgotPassword)} className="space-y-6">
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

            <Button
              type="submit"
              fullWidth
              isLoading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting}
            >
              Send reset link
            </Button>

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