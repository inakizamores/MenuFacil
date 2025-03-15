import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

type ValidationFunction<T> = (value: any, values: T) => string | null;
type ValidationRule<T> = ValidationFunction<T>;
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>[]>>;

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const fieldRules = validationRules[name];
      if (!fieldRules) return null;

      for (const rule of fieldRules) {
        const error = rule(value, values);
        if (error) return error;
      }

      return null;
    },
    [validationRules, values]
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

  // Handle field change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      const fieldName = name as keyof T;
      
      let fieldValue: any = value;
      
      // Handle checkbox
      if (type === 'checkbox') {
        fieldValue = (e.target as HTMLInputElement).checked;
      }
      
      setValues((prevValues) => ({
        ...prevValues,
        [fieldName]: fieldValue,
      }));

      // Validate on change for better UX
      if (touched[fieldName]) {
        const error = validateField(fieldName, fieldValue);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: error || undefined,
        }));
      }
    },
    [touched, validateField]
  );

  // Handle direct field value setting
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      const fieldName = name as keyof T;
      
      setValues((prevValues) => ({
        ...prevValues,
        [fieldName]: value,
      }));

      // Validate on change for better UX
      if (touched[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: error || undefined,
        }));
      }
    },
    [touched, validateField]
  );

  // Set all form values
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
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