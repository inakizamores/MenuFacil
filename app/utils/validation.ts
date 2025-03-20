// Regular expressions for validation
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Password must contain at least 8 characters, including one uppercase letter, 
  // one lowercase letter, one number, and one special character
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  // Phone number with optional country code and spaces/hyphens
  phone: /^(\+?\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/,
  // URL pattern
  url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/,
  // Postal/Zip code (supports common formats)
  postalCode: /^[0-9]{5}(-[0-9]{4})?$|^[A-Za-z][0-9][A-Za-z]\s?[0-9][A-Za-z][0-9]$/,
  // Price (currency) validation
  price: /^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9]{1,2})?$/,
};

type ValidationValue = string | number | boolean | null | undefined | string[] | Record<string, unknown>;
type ValidationFunction<T = Record<string, ValidationValue>> = (value: ValidationValue, formValues?: T) => string | null;

export const validate = {
  // Makes a field optional - always returns null (no error)
  optional: (_value: ValidationValue): string | null => null,

  required: (value: ValidationValue): string | null => {
    if (value === undefined || value === null) return 'This field is required';
    
    if (typeof value === 'string' && value.trim() === '') {
      return 'This field is required';
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return 'Please select at least one option';
    }
    
    return null;
  },
  
  email: (value: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    return patterns.email.test(value) ? null : 'Please enter a valid email address';
  },
  
  password: (value: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (!patterns.password.test(value)) {
      return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    return null;
  },
  
  phone: (value: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    return patterns.phone.test(value) ? null : 'Please enter a valid phone number';
  },
  
  url: (value: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    return patterns.url.test(value) ? null : 'Please enter a valid URL';
  },
  
  minLength: (min: number): ValidationFunction => (value: ValidationValue): string | null => {
    if (!value || typeof value !== 'string') return null; // Let required validator handle empty values
    return value.length >= min 
      ? null 
      : `This field must be at least ${min} characters long`;
  },
  
  maxLength: (max: number): ValidationFunction => (value: ValidationValue): string | null => {
    if (!value || typeof value !== 'string') return null; // Let required validator handle empty values
    return value.length <= max 
      ? null 
      : `This field must be at most ${max} characters long`;
  },
  
  min: (min: number): ValidationFunction => (value: ValidationValue): string | null => {
    if (value === undefined || value === null || typeof value !== 'number') return null;
    return value >= min 
      ? null 
      : `This value must be at least ${min}`;
  },
  
  max: (max: number): ValidationFunction => (value: ValidationValue): string | null => {
    if (value === undefined || value === null || typeof value !== 'number') return null;
    return value <= max 
      ? null 
      : `This value must be at most ${max}`;
  },
  
  integer: (value: ValidationValue): string | null => {
    if (value === undefined || value === null || value === '') return null;
    return Number.isInteger(Number(value)) 
      ? null 
      : 'Please enter an integer value';
  },
  
  decimal: (value: ValidationValue): string | null => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return !isNaN(num) && num % 1 !== 0 
      ? null 
      : 'Please enter a decimal value';
  },

  // New validators
  postalCode: (value: string): string | null => {
    if (!value) return null;
    return patterns.postalCode.test(value) ? null : 'Please enter a valid postal/zip code';
  },

  price: (value: string | number): string | null => {
    if (value === undefined || value === null || value === '') return null;
    
    // Convert to string if it's a number
    const stringValue = typeof value === 'number' ? value.toString() : value;
    
    // Remove currency symbol and commas for validation
    const normalizedValue = stringValue.replace(/[$,]/g, '');
    
    // Check if it's a valid number with up to 2 decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue)) {
      return 'Please enter a valid price';
    }
    
    return null;
  },

  match: (fieldName: string, message?: string): ValidationFunction => 
    (value: ValidationValue, formValues?: Record<string, ValidationValue>): string | null => {
      if (!formValues) return null;
      return value === formValues[fieldName] 
        ? null 
        : message || `This field must match ${fieldName}`;
    },

  notMatch: (fieldName: string, message?: string): ValidationFunction => 
    (value: ValidationValue, formValues?: Record<string, ValidationValue>): string | null => {
      if (!formValues) return null;
      return value !== formValues[fieldName] 
        ? null 
        : message || `This field cannot be the same as ${fieldName}`;
    },

  pattern: (regex: RegExp, message: string): ValidationFunction => 
    (value: ValidationValue): string | null => {
      if (!value || typeof value !== 'string') return null;
      return regex.test(value) ? null : message;
    },

  custom: (validationFn: (value: ValidationValue, formValues?: Record<string, ValidationValue>) => boolean, message: string): ValidationFunction => 
    (value: ValidationValue, formValues?: Record<string, ValidationValue>): string | null => {
      return validationFn(value, formValues) ? null : message;
    }
};

// Combine multiple validators into a single validator function
export function combineValidators(...validators: ValidationFunction[]): ValidationFunction {
  return (value: ValidationValue, formValues?: Record<string, ValidationValue>): string | null => {
    for (const validator of validators) {
      const error = validator(value, formValues);
      if (error) {
        return error;
      }
    }
    return null;
  };
}

// Create a validation rule for each field with a custom error message
export const createValidator = (validatorFn: ValidationFunction, message: string): ValidationFunction => {
  return (value: ValidationValue, formValues?: Record<string, ValidationValue>): string | null => {
    const error = validatorFn(value, formValues);
    return error ? message : null;
  };
};

// Create form validation rules from a map of validator arrays
export function createValidationRules<T>(rules: Record<keyof T, ValidationFunction[]>): Record<keyof T, ValidationFunction> {
  const validationRules: Record<string, ValidationFunction> = {};
  
  for (const field in rules) {
    if (Object.prototype.hasOwnProperty.call(rules, field)) {
      validationRules[field] = combineValidators(...rules[field]);
    }
  }
  
  return validationRules as Record<keyof T, ValidationFunction>;
}

// Create form validation rules from a Zod schema (leaving for backward compatibility)
export function createValidationRulesFromSchema<T>(schema: unknown): Record<keyof T, ValidationFunction> {
  const rules: Record<string, ValidationFunction> = {};
  
  if (typeof schema !== 'object' || schema === null || !('shape' in schema)) {
    return rules as Record<keyof T, ValidationFunction>;
  }
  
  const zodSchema = schema as { shape: Record<string, unknown>; pick: (fields: Record<string, boolean>) => { parse: (data: Record<string, unknown>) => void } };
  
  // Extract field names from schema
  const fieldNames = Object.keys(zodSchema.shape || {});
  
  for (const field of fieldNames) {
    rules[field] = (value: ValidationValue) => {
      try {
        // Create a partial schema just for this field
        const partialSchema = zodSchema.pick({ [field]: true });
        
        // Validate just this field
        partialSchema.parse({ [field]: value });
        return null;
      } catch (error) {
        // Extract error message from Zod validation error
        if (error && typeof error === 'object' && 'errors' in error) {
          const zodError = error as { errors: Array<{ message: string }> };
          if (zodError.errors && zodError.errors.length > 0) {
            return zodError.errors[0].message;
          }
        }
        return 'Invalid value';
      }
    };
  }
  
  return rules as Record<keyof T, ValidationFunction>;
} 