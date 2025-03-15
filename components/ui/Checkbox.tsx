import React, { forwardRef } from 'react';
import cn from 'classnames';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={props.id}
            className="ml-2 block text-sm text-gray-900"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
); 