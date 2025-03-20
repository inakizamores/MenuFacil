import React, { forwardRef, useState } from 'react';
import cn from 'classnames';
import FormFeedback from './FormFeedback';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  touched?: boolean;
  hint?: string;
  showErrorIcon?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  success?: boolean;
  feedback?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    hint,
    touched = false,
    iconLeft,
    iconRight,
    type = 'text',
    required,
    id,
    name,
    success = false,
    feedback,
    showErrorIcon = true,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const showError = Boolean(error && (touched || isFocused));
    const inputId = id || name || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-700 mb-1",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {iconLeft && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {iconLeft}
            </div>
          )}
          
          <input
            id={inputId}
            name={name}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              {
                'border-red-500 focus-visible:ring-red-500 text-red-700 bg-red-50/40': showError,
                'border-green-500 focus-visible:ring-green-500': success && !showError,
                'pl-10': iconLeft,
                'pr-10': iconRight
              },
              className
            )}
            ref={ref}
            required={required}
            aria-invalid={showError ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {iconRight && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {iconRight}
            </div>
          )}
        </div>
        
        {hint && !showError && (
          <p 
            id={`${inputId}-hint`}
            className="mt-1 text-sm text-gray-500"
          >
            {hint}
          </p>
        )}
        
        {showError && (
          <FormFeedback 
            id={`${inputId}-error`}
            type="error"
            message={error}
            icon={showErrorIcon}
          />
        )}
        
        {success && feedback && !showError && (
          <FormFeedback
            type="success"
            message={feedback}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 