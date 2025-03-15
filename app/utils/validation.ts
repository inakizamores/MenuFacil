// Regular expressions for validation
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Password must contain at least 8 characters, including one uppercase letter, 
  // one lowercase letter, one number, and one special character
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  // Phone number with optional country code and spaces/hyphens
  phone: /^(\+?\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/,
  // URL pattern
  url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
};

type ValidationFunction<T = any> = (value: any, formValues?: T) => string | null;

export const validate = {
  required: (value: any): string | null => {
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
  
  minLength: (min: number): ValidationFunction => (value: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    return value.length >= min 
      ? null 
      : `This field must be at least ${min} characters long`;
  },
  
  maxLength: (max: number): ValidationFunction => (value: string): string | null => {
    if (!value) return null; // Let required validator handle empty values
    return value.length <= max 
      ? null 
      : `This field must be at most ${max} characters long`;
  },
  
  min: (min: number): ValidationFunction => (value: number): string | null => {
    if (value === undefined || value === null) return null;
    return value >= min 
      ? null 
      : `This value must be at least ${min}`;
  },
  
  max: (max: number): ValidationFunction => (value: number): string | null => {
    if (value === undefined || value === null) return null;
    return value <= max 
      ? null 
      : `This value must be at most ${max}`;
  },
  
  integer: (value: any): string | null => {
    if (value === undefined || value === null || value === '') return null;
    return Number.isInteger(Number(value)) 
      ? null 
      : 'Please enter an integer value';
  },
  
  decimal: (value: any): string | null => {
    if (value === undefined || value === null || value === '') return null;
    return !isNaN(Number(value)) && Number(value) % 1 !== 0 
      ? null 
      : 'Please enter a decimal value';
  },
};

// Combine multiple validators into a single validator function
export function combineValidators(...validators: ValidationFunction[]): ValidationFunction {
  return (value: any, formValues?: any): string | null => {
    for (const validator of validators) {
      const error = validator(value, formValues);
      if (error) {
        return error;
      }
    }
    return null;
  };
} 