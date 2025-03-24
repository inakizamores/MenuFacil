import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
 * Ensures a value is a valid UUID string
 * This helps with type compatibility between Supabase types and our application
 * @param id The ID to convert to a UUID string
 * @returns The validated UUID string
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