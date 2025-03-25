import React, { ButtonHTMLAttributes } from 'react';
import cn from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow',
    secondary: 'bg-secondary text-white hover:bg-secondary-600 active:bg-secondary-700 shadow-sm hover:shadow',
    accent: 'bg-accent text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm hover:shadow',
    outline: 'border border-primary-300 bg-transparent text-primary hover:bg-primary-50 hover:border-primary-400',
    ghost: 'bg-transparent hover:bg-primary-50 text-primary hover:text-primary-700 active:bg-primary-100',
    link: 'bg-transparent text-accent underline-offset-4 hover:underline hover:text-accent-700 p-0',
    gradient: 'bg-primary-gradient-horizontal text-white hover:shadow-md active:bg-primary-700 active:shadow-sm',
  };
  
  const sizeStyles = {
    sm: 'h-8 px-3 py-1.5 text-xs rounded-md',
    md: 'h-10 px-4 py-2 text-sm rounded-md',
    lg: 'h-12 px-6 py-3 text-base rounded-lg',
    icon: 'h-9 w-9 p-0 rounded-full',
  };
  
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 inline-block animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {children}
    </button>
  );
} 