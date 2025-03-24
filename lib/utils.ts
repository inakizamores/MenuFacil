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