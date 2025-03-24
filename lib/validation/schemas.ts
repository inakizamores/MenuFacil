import { z } from 'zod';

/**
 * Zod schema for login form validation
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Type definition derived from login schema
 */
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Zod schema for registration form validation
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z
    .string({ required_error: 'Please confirm your password' })
    .min(1, 'Please confirm your password'),
  terms: z
    .boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms and conditions'
    }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

/**
 * Type definition derived from register schema
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Zod schema for password reset request form
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
});

/**
 * Type definition derived from forgot password schema
 */
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Zod schema for password reset form
 */
export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z
    .string({ required_error: 'Please confirm your password' })
    .min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

/**
 * Type definition derived from reset password schema
 */
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Zod schema for restaurant form validation
 * 
 * This schema validates restaurant creation and editing forms with the following features:
 * - Required name field with minimum length validation
 * - Optional description field with appropriate trimming
 * - Color validation for primary and secondary colors using hex format
 * - Address fields with optional validation
 * - Specialized validation for postal/zip codes supporting both US and Canadian formats
 * - Phone number validation with international format support
 * - Email validation for contact information
 * - URL validation for website
 * 
 * Note: When using this schema with the database, remember that the field names
 * in the schema use camelCase (e.g., primaryColor) while the database uses
 * snake_case (e.g., primary_color). The form components should handle this mapping.
 * 
 * The UUID owner_id field is not included in this schema as it's handled separately
 * in the form submission logic and comes from the authenticated user.
 */
export const restaurantSchema = z.object({
  name: z
    .string({ required_error: 'Restaurant name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  description: z
    .string()
    .trim()
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color code')
    .default('#4F46E5'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color code')
    .default('#818CF8'),
  address: z
    .string()
    .trim()
    .optional(),
  city: z
    .string()
    .trim()
    .optional(),
  state: z
    .string()
    .trim()
    .optional(),
  postalCode: z
    .string()
    .trim()
    .optional()
    .refine(
      val => !val || /^[0-9]{5}(-[0-9]{4})?$|^[A-Za-z][0-9][A-Za-z]\s?[0-9][A-Za-z][0-9]$/.test(val),
      { message: 'Please enter a valid postal/zip code' }
    ),
  country: z
    .string()
    .trim()
    .optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      val => !val || /^(\+?\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/.test(val),
      { message: 'Please enter a valid phone number' }
    ),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional(),
  website: z
    .string()
    .trim()
    .url('Please enter a valid URL')
    .optional(),
});

/**
 * Type definition derived from restaurant schema
 */
export type RestaurantFormValues = z.infer<typeof restaurantSchema>;

/**
 * Zod schema for menu form validation
 * 
 * This schema validates menu creation and editing forms with the following features:
 * - Required name field with minimum length validation
 * - Optional description field with appropriate trimming
 * - Boolean fields for menu status (isActive, isDefault)
 * - Optional custom CSS validation
 * 
 * Note: When using this schema with the database, remember that the field names
 * in the schema use camelCase (e.g., isActive) while the database uses
 * snake_case (e.g., is_active). The form components should handle this mapping.
 * 
 * The restaurant_id and template_id fields are not included in this schema as they're
 * handled separately in the form submission logic.
 */
export const menuSchema = z.object({
  name: z
    .string({ required_error: 'Menu name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  description: z
    .string()
    .trim()
    .optional(),
  isActive: z
    .boolean()
    .default(true),
  isDefault: z
    .boolean()
    .default(false),
  customCss: z
    .string()
    .trim()
    .optional(),
  currency: z
    .string()
    .trim()
    .optional()
    .default('USD'),
});

/**
 * Type definition derived from menu schema
 */
export type MenuFormValues = z.infer<typeof menuSchema>; 