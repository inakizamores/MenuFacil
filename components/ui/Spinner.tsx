import React from 'react';
import cn from 'classnames';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'primary' | 'secondary' | 'accent' | 'white';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

/**
 * Spinner component for loading states
 * 
 * @example
 * ```tsx
 * <Spinner size="md" variant="primary" />
 * ```
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    white: 'text-white'
  };

  return (
    <div className={cn(
      'inline-block animate-spin rounded-full border-current border-t-transparent',
      sizeClasses[size],
      variantClasses[variant],
      className
    )} role="status" aria-label="loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 