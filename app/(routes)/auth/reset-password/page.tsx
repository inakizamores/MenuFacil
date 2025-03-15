'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { useForm } from '../../../hooks/useForm';
import { validate, combineValidators } from '../../../utils/validation';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const { resetUserPassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get token from URL
  const token = searchParams.get('token');
  
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Invalid reset link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The password reset link is invalid or has expired.
          </p>
          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              Request a new password reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initialValues: ResetPasswordFormValues = {
    password: '',
    confirmPassword: '',
  };

  // Custom validator for password matching
  const validatePasswordMatch = (value: string, formValues: ResetPasswordFormValues): string | null => {
    return value === formValues.password ? null : 'Passwords must match';
  };

  const validationRules = {
    password: combineValidators(validate.required, validate.password),
    confirmPassword: combineValidators(validate.required, validatePasswordMatch),
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await resetUserPassword(values.password);
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setServerError(error.message || 'Failed to reset password. Please try again.');
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
  } = useForm<ResetPasswordFormValues>(initialValues, validationRules, handleResetPassword);

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
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />

            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 