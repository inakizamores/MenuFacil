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
              "block text-sm font-medium text-brand-text mb-1",
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {iconLeft && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-600">
              {iconLeft}
            </div>
          )}
          
          <input
            id={inputId}
            name={name}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-250 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
              {
                'border-destructive focus-visible:ring-destructive text-destructive bg-red-50/40': showError,
                'border-success focus-visible:ring-success': success && !showError,
                'pl-10': iconLeft,
                'pr-10': iconRight,
                'hover:border-neutral-300': !showError && !success,
                'focus-visible:shadow-md': isFocused && !showError && !success,
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-600">
              {iconRight}
            </div>
          )}
        </div>
        
        {hint && !showError && (
          <p 
            id={`${inputId}-hint`}
            className="mt-1 text-sm text-neutral-500"
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