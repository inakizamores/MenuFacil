import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Structure for a single breadcrumb item
 */
type BreadcrumbItem = {
  /** The text to display for this breadcrumb */
  label: string;
  /** The URL the breadcrumb links to */
  href: string;
};

/**
 * Props for the Breadcrumb component
 */
interface BreadcrumbProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Breadcrumb Component
 * 
 * A navigation component that displays a visual representation of a user's
 * location within the app's hierarchy. The last item is displayed as text 
 * rather than a link to indicate the current page.
 * 
 * @example
 * ```tsx
 * <Breadcrumb 
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Restaurants', href: '/restaurants' },
 *     { label: 'Menu', href: '/restaurants/123/menu' }
 *   ]}
 * />
 * ```
 */
export const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  if (!items.length) return null;

  return (
    <nav className={`flex text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" aria-hidden="true" />
              )}
              
              {isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">{item.label}</span>
              ) : (
                <Link 
                  href={item.href} 
                  className="text-gray-600 hover:text-gray-900 hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}; 