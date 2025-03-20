'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Define initial values
  const initialValues: ResetPasswordFormValues = {
    password: '',
    confirmPassword: '',
  };

  // Define password match validation function
  const validatePasswordMatch = (value: string, formValues: ResetPasswordFormValues): string | null => {
    if (value !== formValues.password) {
      return 'Passwords do not match';
    }
    return null;
  };

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

  // Define validation rules
  const validationRules = {
    password: combineValidators(validate.required, validate.password),
    confirmPassword: combineValidators(validate.required, validatePasswordMatch),
  };

  // Initialize form
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<ResetPasswordFormValues>(initialValues, validationRules, handleResetPassword);

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