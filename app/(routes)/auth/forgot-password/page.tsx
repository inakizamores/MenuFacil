'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { useForm } from '../../../hooks/useForm';
import { validate, combineValidators } from '../../../utils/validation';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues: ForgotPasswordFormValues = {
    email: '',
  };

  const validationRules = {
    email: combineValidators(validate.required, validate.email),
  };

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await forgotPassword(values.email);
      setIsSuccess(true);
    } catch (error: any) {
      setServerError(error.message || 'Failed to send reset email. Please try again.');
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

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a password reset link to your email address.
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-gray-700">
                Please check your inbox and follow the instructions to reset your password.
                If you don't see the email, check your spam folder.
              </p>
              <div className="pt-4">
                <Link 
                  href="/auth/login" 
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
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
          Or{' '}
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            return to login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {serverError && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {serverError}
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

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Send reset link
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 