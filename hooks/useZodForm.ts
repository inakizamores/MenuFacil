import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Custom hook that wraps react-hook-form with Zod schema validation
 * 
 * @param props Configuration object for the form
 * @returns Form methods from react-hook-form
 */
export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> & {
    schema: TSchema;
  }
): UseFormReturn<z.infer<TSchema>> {
  const { schema, ...formProps } = props;
  
  return useForm<z.infer<TSchema>>({
    ...formProps,
    resolver: zodResolver(schema),
  });
} 