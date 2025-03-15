'use client';

import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { useForm } from '../../../hooks/useForm';
import { validate, combineValidators } from '../../../utils/validation';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import { useState } from 'react';

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialValues: RegisterFormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  };

  // Custom validator for password matching
  const validatePasswordMatch = (value: string, formValues: RegisterFormValues): string | null => {
    return value === formValues.password ? null : 'Passwords must match';
  };

  // Custom validator for terms acceptance
  const validateTerms = (value: boolean): string | null => {
    return value ? null : 'You must accept the terms and conditions';
  };

  const validationRules = {
    name: combineValidators(validate.required),
    email: combineValidators(validate.required, validate.email),
    password: combineValidators(validate.required, validate.password),
    confirmPassword: combineValidators(validate.required, validatePasswordMatch),
    terms: validateTerms,
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch (error: any) {
      setServerError(error.message || 'Registration failed. Please try again.');
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
  } = useForm<RegisterFormValues>(initialValues, validationRules, handleRegister);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
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
              label="Full name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
            />

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

            <Input
              label="Password"
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
              label="Confirm password"
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

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={values.terms}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
                  errors.terms && touched.terms ? 'border-red-500' : ''
                }`}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && touched.terms && (
              <p className="mt-1 text-xs text-red-600">{errors.terms}</p>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 