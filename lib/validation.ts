// Basic validation functions to use with useForm hook

/**
 * Combines multiple validation rules into a single function
 */
export function combineValidators(rules: Record<string, any[]>) {
  return rules;
}

// Collection of validation rules
export const validate = {
  // Required field validation
  required: (message = 'This field is required') => (value: any) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    if (Array.isArray(value) && value.length === 0) {
      return message;
    }
    return null;
  },

  // Minimum length validation
  minLength: (min: number, message?: string) => (value: string) => {
    if (!value || value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `Cannot exceed ${max} characters`;
    }
    return null;
  },

  // Email format validation
  email: (message = 'Invalid email address') => (value: string) => {
    if (!value) return null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  // Number validation
  number: (message = 'Must be a number') => (value: any) => {
    if (value === undefined || value === null || value === '') return null;
    if (isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  // Minimum number validation
  min: (min: number, message?: string) => (value: any) => {
    if (value === undefined || value === null || value === '') return null;
    if (Number(value) < min) {
      return message || `Must be at least ${min}`;
    }
    return null;
  },

  // Maximum number validation
  max: (max: number, message?: string) => (value: any) => {
    if (value === undefined || value === null || value === '') return null;
    if (Number(value) > max) {
      return message || `Cannot exceed ${max}`;
    }
    return null;
  },

  // Pattern validation
  pattern: (pattern: RegExp, message = 'Invalid format') => (value: string) => {
    if (!value) return null;
    if (!pattern.test(value)) {
      return message;
    }
    return null;
  },

  // URL format validation
  url: (message = 'Invalid URL') => (value: string) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch (e) {
      return message;
    }
  },

  // Custom validation
  custom: (validator: (value: any) => string | null) => validator,

  // Match another field
  matches: (field: string, message?: string) => (value: any, allValues: Record<string, any>) => {
    if (!value) return null;
    if (value !== allValues[field]) {
      return message || `Does not match ${field}`;
    }
    return null;
  }
}; 