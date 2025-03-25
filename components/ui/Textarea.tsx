'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import FormFeedback from './FormFeedback';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
  success?: boolean;
  feedback?: string;
  touched?: boolean;
}

/**
 * Textarea component for multiline text input with consistent styling
 * 
 * @param className - Additional classes to apply to the textarea
 * @param error - Error message to display below the textarea
 * @param label - Optional label for the textarea
 * @param hint - Optional hint text to display below the textarea
 * @param success - Whether the textarea has valid input
 * @param feedback - Success message to display when success is true
 * @param touched - Whether the field has been interacted with
 * @param props - Standard textarea HTML attributes
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, success, feedback, touched = false, id, required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const showError = Boolean(error && (touched || isFocused));
    const textareaId = id || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className={cn(
              "block text-sm font-medium text-brand-text mb-1",
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
            "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-250",
            showError && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive bg-red-50/40",
            success && !showError && "border-success focus-visible:ring-success focus-visible:border-success",
            !showError && !success && "hover:border-neutral-300",
            isFocused && !showError && !success && "focus-visible:shadow-md",
            className
          )}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={
            showError
              ? `${textareaId}-error`
              : hint
              ? `${textareaId}-hint`
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
          ref={ref}
          {...props}
        />
        
        {hint && !showError && (
          <p 
            id={`${textareaId}-hint`}
            className="mt-1 text-sm text-neutral-500"
          >
            {hint}
          </p>
        )}
        
        {showError && (
          <FormFeedback 
            id={`${textareaId}-error`}
            type="error"
            message={error}
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

Textarea.displayName = 'Textarea';

export { Textarea }; 