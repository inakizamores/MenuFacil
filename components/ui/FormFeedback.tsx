import React from 'react';
import cn from 'classnames';

export type FeedbackType = 'error' | 'success' | 'info' | 'warning';

interface FormFeedbackProps {
  type?: FeedbackType;
  message?: string | null;
  className?: string;
  visible?: boolean;
  icon?: boolean;
  id?: string;
}

/**
 * FormFeedback component
 * A reusable component to show form validation feedback messages
 */
export const FormFeedback: React.FC<FormFeedbackProps> = ({
  type = 'error',
  message,
  className,
  visible = true,
  icon = true,
  id,
}) => {
  if (!message || !visible) return null;

  const typeStyles = {
    error: 'text-destructive',
    success: 'text-success',
    info: 'text-info',
    warning: 'text-warning',
  };

  const iconElements = {
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      id={id}
      className={cn(
        'mt-1 flex items-center text-sm font-medium transition-all duration-250',
        typeStyles[type],
        className
      )}
      role={type === 'error' ? 'alert' : undefined}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {icon && iconElements[type]}
      <span>{message}</span>
    </div>
  );
};

export default FormFeedback; 