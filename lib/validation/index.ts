import { z } from 'zod';

// Export all schemas from the schemas file
export * from './schemas';

/**
 * Helper function to create validation rules from Zod schema for useForm hook
 * 
 * This function takes a Zod schema and converts it into validation rules that are compatible
 * with the useForm hook. It handles both field-level validation and cross-field validation
 * (refinements) defined in the schema.
 * 
 * Usage example:
 * ```typescript
 * // Create a schema with Zod
 * const menuSchema = z.object({
 *   name: z.string().min(2, 'Name is too short'),
 *   price: z.number().positive('Price must be positive')
 * });
 * 
 * // Convert to validation rules for useForm
 * const validationRules = createValidationRules(menuSchema);
 * 
 * // Use with the form hook
 * const { values, errors, ... } = useForm(initialValues, validationRules, handleSubmit);
 * ```
 * 
 * For menu form implementation, follow this pattern and create a menuSchema in schemas.ts
 * that validates all required menu fields (name, description, currency, is_published, etc.)
 * 
 * @param schema Zod schema to convert to validation rules
 * @returns An object with validation rules compatible with useForm
 */
export function createValidationRules<T extends z.ZodType>(schema: T) {
  const rules: Record<string, (value: any, formValues: any) => string | null> = {};
  
  // Get the shape of the schema if it's an object
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    
    // Create validation rule for each field in the schema
    Object.keys(shape).forEach(key => {
      rules[key] = (value: any, formValues: any) => {
        try {
          // Create a partial schema with just this field
          const partialResults = schema.pick({ [key]: true }).safeParse({ [key]: value });
          
          // If validation passed for this field, check refinements on the whole form
          if (partialResults.success) {
            // Only validate refinements if all fields that might be referenced are present
            const hasAllFields = Object.keys(shape).every(
              k => k === key || formValues[k] !== undefined
            );
            
            if (hasAllFields) {
              const refineResults = schema.safeParse(formValues);
              
              // If refinement failed, check if the error is for this field
              if (!refineResults.success) {
                const fieldErrors = refineResults.error.flatten().fieldErrors[key];
                if (fieldErrors && fieldErrors.length > 0) {
                  return fieldErrors[0];
                }
              }
            }
            
            return null;
          }
          
          // If basic validation failed, return the error message
          const fieldErrors = partialResults.error.flatten().fieldErrors[key];
          return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
        } catch (error) {
          // Fallback error message
          return 'Invalid value';
        }
      };
    });
  }
  
  return rules;
}

/**
 * Hook to transform Zod validation errors into a format compatible with form libraries
 * 
 * This function takes a Zod validation error and formats it into a structure that's
 * easier to use with form components, mapping field names to their first error message.
 * 
 * For menu validation, this is useful when performing server-side validation or
 * when validating the entire form at once before submission.
 * 
 * @param error Zod validation error
 * @returns Object with field names as keys and error messages as values
 */
export function formatZodErrors(error: z.ZodError) {
  const formattedErrors: Record<string, string> = {};
  
  const { fieldErrors } = error.flatten();
  
  Object.entries(fieldErrors).forEach(([field, errors]) => {
    if (errors && errors.length > 0) {
      formattedErrors[field] = errors[0];
    }
  });
  
  return formattedErrors;
}

/**
 * Validate a form against a Zod schema
 * 
 * This function validates data against a Zod schema and returns a structured result
 * with either the validated data or formatted errors.
 * 
 * For menu forms, you can use this to validate the entire form on submission:
 * ```typescript
 * const result = validateForm(menuSchema, formData);
 * if (result.success) {
 *   // Use result.data for submission
 * } else {
 *   // Handle errors in result.errors
 * }
 * ```
 * 
 * @param schema Zod schema to validate against
 * @param data Form data to validate
 * @returns Object with validation result and errors if any
 */
export function validateForm<T extends z.ZodType>(
  schema: T, 
  data: unknown
): { success: boolean; data?: z.infer<T>; errors?: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { 
    success: false, 
    errors: formatZodErrors(result.error)
  };
} 