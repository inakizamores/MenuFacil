import { InputHTMLAttributes, forwardRef, useState } from 'react';
import cn from 'classnames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  touched?: boolean;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  success?: boolean;
  feedback?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      touched = false,
      helperText,
      className = '',
      leftAddon,
      rightAddon,
      id,
      name,
      required,
      success = false,
      feedback,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || name;
    const showError = Boolean(error && (touched || isFocused));
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };
    
    return (
      <div className={className}>
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
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
              {leftAddon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            className={cn(
              'flex h-9 sm:h-10 w-full rounded-md border bg-background px-3 py-1.5 sm:py-2 text-sm ring-offset-background transition-all duration-200 shadow-sm',
              'placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50',
              {
                'border-destructive focus-visible:ring-destructive text-destructive bg-red-50/40': showError,
                'border-success focus-visible:ring-success': success && !showError,
                'border-input': !showError && !success,
                'pl-9 sm:pl-10': leftAddon,
                'pr-9 sm:pr-10': rightAddon,
                'hover:border-neutral-300': !showError && !success,
                'focus-visible:shadow-md': isFocused && !showError && !success,
              },
              className
            )}
            aria-invalid={showError ? 'true' : 'false'}
            aria-describedby={
              showError 
                ? `${inputId}-error` 
                : helperText 
                  ? `${inputId}-description` 
                  : undefined
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-600">
              {rightAddon}
            </div>
          )}
        </div>
        
        {showError && (
          <p className="mt-1 text-sm text-destructive font-medium" id={`${inputId}-error`}>
            {error}
          </p>
        )}
        
        {success && feedback && !showError && (
          <p className="mt-1 text-sm text-success font-medium" id={`${inputId}-success`}>
            {feedback}
          </p>
        )}
        
        {helperText && !showError && !success && (
          <p className="mt-1 text-sm text-neutral-500" id={`${inputId}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 