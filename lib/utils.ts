import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UUID } from 'crypto';

/**
 * Utility function to merge class names with Tailwind classes
 * 
 * This function combines clsx and tailwind-merge to allow for conditional
 * class names and proper handling of Tailwind CSS class conflicts.
 * 
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'text-white')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility functions for the MenuFácil application
 */

/**
 * ===== UUID HANDLING UTILITIES =====
 * 
 * The following functions handle UUID type compatibility issues between 
 * string IDs (commonly used in the application) and the UUID type
 * (required by Supabase database types).
 * 
 * These utilities solve TypeScript errors related to owner_id and other
 * ID fields that require proper UUID typing when interacting with the database.
 */

/**
 * Ensures a value is a valid UUID string
 * This helps with type compatibility between Supabase types and our application
 * @param id The ID to convert to a UUID string
 * @returns The validated UUID string
 * @throws Error if the ID is null, undefined, or not a valid UUID format
 */
export function ensureUUID(id: string | undefined | null): string {
  if (!id) {
    throw new Error('Invalid UUID: Value is null or undefined');
  }
  
  // Simple validation of UUID format (not comprehensive but catches obvious issues)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }
  
  return id;
}

/**
 * Safely attempts to convert a value to a UUID string without throwing errors
 * Returns a default value if conversion fails
 * @param id The ID to safely convert
 * @param defaultValue The default value to return if conversion fails
 * @returns The UUID string or default value
 */
export function safeUUID(id: unknown, defaultValue: string = ''): string {
  try {
    if (typeof id !== 'string') {
      return defaultValue;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) ? id : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Converts a string ID to a typed UUID for use with database types
 * This solves TypeScript errors when assigning string IDs to UUID typed fields
 * in database operations (e.g., owner_id: toUUID(user.id) instead of as unknown as UUID)
 * 
 * @param id String ID to convert to UUID type
 * @returns The ID as a proper UUID type
 * @throws Error if the ID is null, undefined, or not a valid UUID format
 * 
 * @example
 * // In restaurant creation
 * const newRestaurant = await createRestaurant({
 *   // ...other fields,
 *   owner_id: toUUID(user.id), // Properly typed as UUID
 * });
 */
export function toUUID(id: string | null | undefined): UUID {
  if (!id) {
    throw new Error('Cannot convert null or undefined to UUID');
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }
  
  // Cast the string to UUID type for TypeScript
  return id as unknown as UUID;
}

/**
 * Safely converts a string ID to a typed UUID, with proper error handling
 * Returns null if the conversion fails
 * Use this when you need a UUID type but the input might be invalid
 * 
 * @param id String ID to safely convert to UUID type
 * @returns The ID as a UUID type or null if invalid
 */
export function safeToUUID(id: string | null | undefined): UUID | null {
  try {
    if (!id) return null;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;
    
    return id as unknown as UUID;
  } catch {
    return null;
  }
}

/**
 * Converts a UUID type to a string representation
 * This is useful when you need to use the UUID in situations expecting strings
 * (e.g., URL parameters, localStorage, or user-facing displays)
 * 
 * @param uuid UUID type to convert to string
 * @returns The UUID as a string or null if the input is invalid
 */
export function uuidToString(uuid: UUID | null | undefined): string | null {
  if (!uuid) return null;
  return String(uuid);
}

/**
 * ===== STRING AND DATE FORMATTING UTILITIES =====
 */

/**
 * Formats a date string to a localized format
 * @param dateString ISO date string
 * @param locale Locale for formatting
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string = 'en'): string {
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Creates a slug from a string (for URLs, etc.)
 * @param text The text to slugify
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/&/g, '-and-')     // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')   // Remove all non-word characters
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
} 