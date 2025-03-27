'use client';

import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { useZodForm } from '../../../hooks/useZodForm';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { useState } from 'react';
import { registerSchema } from '@/lib/validation/schemas';
import type { RegisterFormValues } from '@/lib/validation/schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';

/**
 * RegisterPage - User registration form
 * 
 * This component implements a comprehensive registration form with modern validation using
 * Zod schemas and React Hook Form. It includes validation for name, email, password,
 * password confirmation, and terms acceptance with real-time feedback.
 * 
 * The form uses the Form component system for consistent validation UI and accessibility.
 */
export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize form with Zod schema validation and default values
  const form = useZodForm({
    schema: registerSchema,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  /**
   * Handle form submission for user registration
   * Attempts to register a new user with the provided information
   * Handles any server errors that occur during registration
   */
  const handleRegister = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      // Successful registration is handled by the auth context (redirect)
    } catch (error: any) {
      setServerError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <>
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-brand-accent hover:text-brand-accent/80 transition-colors duration-200">
            sign in to an existing account
          </Link>
        </p>
      </div>

      <div className="bg-white p-5 sm:p-8 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl">
        {/* Display server-side errors during registration */}
        {serverError && (
          <div className="mb-4 sm:mb-6 rounded-md bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-700">
            {serverError}
          </div>
        )}
        
        {/* Registration form with comprehensive validation */}
        <Form form={form} onSubmit={form.handleSubmit(handleRegister)} className="space-y-4 sm:space-y-6">
          {/* Full name field with validation */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Full name</FormLabel>
                <FormControl>
                  <Input 
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    className="text-sm mt-1"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Email field with validation */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Email address</FormLabel>
                <FormControl>
                  <Input 
                    id="email"
                    type="email" 
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="text-sm mt-1"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Password field with validation and requirements description */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
                <FormControl>
                  <Input 
                    id="password"
                    type="password" 
                    autoComplete="new-password"
                    className="text-sm mt-1"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-xs mt-1">
                  Must be at least 8 characters with uppercase, lowercase, numbers & special characters.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Confirm password field with matching validation */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Confirm password</FormLabel>
                <FormControl>
                  <Input 
                    id="confirmPassword"
                    type="password" 
                    autoComplete="new-password"
                    className="text-sm mt-1"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Terms acceptance checkbox with required validation */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-2 pt-1">
                <FormControl>
                  <input
                    type="checkbox"
                    id="terms" 
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 sm:mt-1 rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="m-0 text-xs sm:text-sm">
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-brand-accent hover:text-brand-accent/80 transition-colors duration-200">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-brand-accent hover:text-brand-accent/80 transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </FormLabel>
                  <FormMessage className="text-xs" />
                </div>
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
            className="mt-4 sm:mt-6 py-2 text-sm"
          >
            Create account
          </Button>
        </Form>
      </div>
    </>
  );
} 