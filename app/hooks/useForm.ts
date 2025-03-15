import { ChangeEvent, FormEvent, useState } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], formValues: T) => string | null;
};

type FormErrors<T> = {
  [K in keyof T]?: string | null;
};

type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>,
  onSubmit?: (values: T) => void | Promise<void>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = (name: keyof T, value: any): string | null => {
    const validator = validationRules[name];
    return validator ? validator(value, values) : null;
  };

  // Validate all fields
  const validateForm = (): FormErrors<T> => {
    const newErrors: FormErrors<T> = {};
    
    for (const key in validationRules) {
      if (validationRules.hasOwnProperty(key)) {
        const fieldKey = key as keyof T;
        const error = validateField(fieldKey, values[fieldKey]);
        if (error) {
          newErrors[fieldKey] = error;
        }
      }
    }
    
    return newErrors;
  };

  // Check if the form is valid
  const isFormValid = (): boolean => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Special handling for checkboxes
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : value;
    
    setFieldValue(name as keyof T, val);
  };

  // Set a field value programmatically
  const setFieldValue = (field: keyof T, value: any) => {
    setValues(prevValues => ({
      ...prevValues,
      [field]: value
    }));
    
    // Validate the field if it's been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: error
      }));
    }
  };

  // Handle input blur
  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setFieldTouched(name as keyof T, true);
  };

  // Set a field as touched programmatically
  const setFieldTouched = (field: keyof T, isTouched: boolean) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [field]: isTouched
    }));
    
    // Validate the field when it's touched
    if (isTouched) {
      const error = validateField(field, values[field]);
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: error
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: FormTouched<T> = {};
    Object.keys(values).forEach(key => {
      allTouched[key as keyof T] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // If form is valid and onSubmit handler is provided, call it
    if (Object.keys(formErrors).length === 0 && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset the form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid: isFormValid(),
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
  };
} 