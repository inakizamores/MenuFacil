import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

type ValidationFunction<T> = (value: any, values: T) => string | null;

type ValidationRules<T> = {
  [K in keyof T]?: ValidationFunction<T>[];
};

// This is the validation schema format used in the menu item pages
type ValidationSchema<T> = {
  [K in keyof T]?: (value: any) => string | null;
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  validationSchema?: ValidationSchema<T>; // Support for older pattern
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  validationSchema = {},
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      // First check validation rules (array-based)
      const fieldRules = validationRules[name];
      if (fieldRules) {
        for (const rule of fieldRules) {
          const error = rule(value, values);
          if (error) return error;
        }
      }

      // Then check validation schema (function-based)
      const schemaValidator = validationSchema[name];
      if (schemaValidator) {
        const error = schemaValidator(value);
        if (error) return error;
      }

      return null;
    },
    [validationRules, validationSchema, values]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const fieldKey = key as keyof T;
      const error = validateField(fieldKey, values[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Handle input change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;
      
      // Handle checkbox inputs
      const newValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : value;

      // Handle nested object paths (e.g., "address.street")
      if (name.includes('.')) {
        const parts = name.split('.');
        const [parentKey, childKey] = parts;
        
        setValues((prevValues) => ({
          ...prevValues,
          [parentKey]: {
            ...prevValues[parentKey],
            [childKey]: newValue,
          },
        }));
      } else {
        setValues((prevValues) => ({
          ...prevValues,
          [fieldName]: newValue,
        }));
      }
    },
    []
  );

  // Set a specific field value
  const setFieldValue = useCallback(
    (name: keyof T | string, value: any) => {
      // Handle nested object paths (e.g., "address.street")
      if (typeof name === 'string' && name.includes('.')) {
        const parts = name.split('.');
        const [parentKey, childKey] = parts;
        
        setValues((prevValues) => ({
          ...prevValues,
          [parentKey]: {
            ...prevValues[parentKey],
            [childKey]: value,
          },
        }));
      } else {
        setValues((prevValues) => ({
          ...prevValues,
          [name]: value,
        }));
      }
    },
    []
  );

  // Set entire form values
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
  }, []);

  // Handle field blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof T;
      
      setTouched((prevTouched) => ({
        ...prevTouched,
        [fieldName]: true,
      }));

      const error = validateField(fieldName, values[fieldName]);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: error || undefined,
      }));
    },
    [validateField, values]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        },
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      const isValid = validateForm();
      if (!isValid || !onSubmit) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, values, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues: setFormValues,
    resetForm,
  };
} 