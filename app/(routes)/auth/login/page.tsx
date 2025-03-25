'use client';

import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { useZodForm } from '../../../hooks/useZodForm';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import { useState } from 'react';
import { loginSchema } from '@/lib/validation/schemas';
import type { LoginFormValues } from '@/lib/validation/schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';

/**
 * LoginPage - Authentication form for user login
 * 
 * This component implements a modern form with comprehensive validation using Zod schemas
 * and React Hook Form. It provides real-time validation feedback and proper accessibility.
 * The form includes email, password inputs and remember me checkbox, with validation
 * for each field according to the loginSchema.
 */
export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize form with Zod schema validation and default values
  const form = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  /**
   * Handle form submission for user login
   * Attempts to log in with provided credentials and handles any errors
   */
  const handleLogin = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      console.log('Attempting login with:', values.email);
      await login({
        email: values.email,
        password: values.password,
      });
      console.log('Login successful');
      // Successful login is handled by the auth context (redirect)
    } catch (error: any) {
      console.error('Login error:', error);
      setServerError(error.message || 'Login failed. Please try again.');
    }
  };

  // Combine errors from auth context and local state
  const errorMessage = serverError || authError;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {/* Display server-side errors (e.g., invalid credentials) */}
          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          
          {/* Form with accessibility and validation using Form component */}
          <Form form={form} onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
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

            {/* Password field with validation */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      id="password"
                      type="password" 
                      autoComplete="current-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              {/* Remember me checkbox */}
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        id="rememberMe" 
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="m-0">Remember me</FormLabel>
                  </FormItem>
                )}
              />

              {/* Forgot password link */}
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit button with loading state */}
            <Button
              type="submit"
              fullWidth
              isLoading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting}
            >
              Sign in
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
} 