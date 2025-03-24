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

export default function ResetPasswordPage() {
  const { resetUserPassword } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Use Zod form with schema validation
  const form = useZodForm({
    schema: resetPasswordSchema,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Define reset password handler
  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!token) return;

    setServerError(null);
    try {
      await resetUserPassword(values.password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setServerError(error.message || 'Failed to reset password. Please try again.');
    }
  };

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

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Password reset successful
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your password has been reset successfully. You will be redirected to login shortly.
          </p>
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter a new password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {serverError && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {serverError}
            </div>
          )}
          
          <Form form={form} onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
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
                  <FormDescription>
                    Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button
              type="submit"
              fullWidth
              isLoading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting}
            >
              Reset password
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
} 