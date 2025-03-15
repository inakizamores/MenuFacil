import React from 'react';
import cn from 'classnames';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  return (
    <div className={cn(
      'inline-block animate-spin rounded-full border-current border-t-transparent text-primary',
      sizeClasses[size],
      className
    )} role="status" aria-label="loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 