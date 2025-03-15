import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  touched?: boolean;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      touched,
      helperText,
      className = '',
      leftAddon,
      rightAddon,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;
    const showError = !!error && touched;
    
    // Input base classes
    const inputBaseClasses = 'block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm';
    
    // Add error styling or default styling
    const inputClasses = showError
      ? `${inputBaseClasses} border-red-300 text-red-900 placeholder-red-300`
      : `${inputBaseClasses} border-gray-300 placeholder-gray-400`;
    
    // Add left/right addon padding
    const inputPaddingClasses = 
      leftAddon && rightAddon 
        ? 'pl-10 pr-10' 
        : leftAddon 
          ? 'pl-10' 
          : rightAddon 
            ? 'pr-10' 
            : '';
    
    return (
      <div className={className}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={`block text-sm font-medium ${
              showError ? 'text-red-700' : 'text-gray-700'
            }`}
          >
            {label}
          </label>
        )}
        
        <div className={`mt-1 relative rounded-md shadow-sm`}>
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftAddon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            name={name}
            className={`${inputClasses} ${inputPaddingClasses}`}
            aria-invalid={showError ? 'true' : 'false'}
            aria-describedby={showError ? `${inputId}-error` : helperText ? `${inputId}-description` : undefined}
            {...props}
          />
          
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightAddon}
            </div>
          )}
        </div>
        
        {showError && (
          <p className="mt-2 text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}
        
        {helperText && !showError && (
          <p className="mt-2 text-sm text-gray-500" id={`${inputId}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 