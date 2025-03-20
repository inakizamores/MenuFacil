import React, { forwardRef } from 'react';
import cn from 'classnames';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white shadow-sm',
      outlined: 'bg-white border border-gray-200',
    };

    return (
      <div
        className={cn(
          'rounded-lg overflow-hidden',
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-5 border-b border-gray-200', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        className={cn('text-lg font-semibold text-gray-900', className)}
        ref={ref}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        className={cn('text-sm text-gray-500 mt-1', className)}
        ref={ref}
        {...props}
      >
        {children}
      </p>
    );
  }
);

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-5', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-5 bg-gray-50 border-t border-gray-200', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
); 