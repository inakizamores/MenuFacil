'use client';

import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { useForm } from '../../../hooks/useForm';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import { useState } from 'react';
import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { createValidationRules } from '@/lib/validation/index';
import type { ForgotPasswordFormValues } from '@/lib/validation/schemas';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues: ForgotPasswordFormValues = {
    email: '',
  };

  // Create validation rules from Zod schema
  const validationRules = createValidationRules(forgotPasswordSchema);

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

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<ForgotPasswordFormValues>(initialValues, validationRules, handleForgotPassword);

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
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
            />

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Send reset link
              </Button>
            </div>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 