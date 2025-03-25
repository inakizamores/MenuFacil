import React, { forwardRef } from 'react';
import cn from 'classnames';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow',
      primary: 'bg-primary-gradient-horizontal text-white hover:shadow-md active:bg-primary-700 active:shadow-sm',
      secondary: 'bg-secondary text-white hover:bg-secondary-600 active:bg-secondary-700 shadow-sm hover:shadow',
      accent: 'bg-accent text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm hover:shadow',
      outline: 'border border-primary-300 bg-transparent text-primary hover:bg-primary-50 hover:border-primary-400',
      danger: 'bg-destructive text-destructive-foreground hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow',
      ghost: 'bg-transparent hover:bg-primary-50 text-primary hover:text-primary-700 active:bg-primary-100',
      link: 'text-accent underline-offset-4 hover:underline hover:text-accent-700'
    };

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-10 px-4 py-2 rounded-md',
      lg: 'h-12 px-6 py-3 text-lg rounded-lg',
      icon: 'h-9 w-9 p-0 rounded-full'
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button'; 