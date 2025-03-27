import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Handles page navigation with improved reliability for Next.js App Router
 * 
 * This utility helps ensure navigation works consistently even when we encounter router issues
 * 
 * @param router Next.js router instance
 * @param path Path to navigate to
 * @param options Optional configuration
 */
export const navigateTo = (
  router: AppRouterInstance, 
  path: string, 
  options: { 
    fallback?: boolean; // Whether to use window.location as fallback
    delay?: number; // Delay before navigation in ms
    forceReload?: boolean; // Whether to force a full page reload
  } = {}
): Promise<boolean> => {
  const { fallback = true, delay = 250, forceReload = false } = options;
  
  return new Promise((resolve) => {
    // If specified, add a small delay to ensure React state updates have processed
    setTimeout(() => {
      try {
        // If forceReload is true, use window.location directly
        if (forceReload && typeof window !== 'undefined') {
          console.log(`Force reloading to ${path}`);
          window.location.href = path;
          resolve(true);
          return;
        }

        // Try using Next.js router
        console.log(`Navigating to ${path} using Next.js router`);
        router.push(path);
        
        // Double-check that navigation actually happened
        setTimeout(() => {
          if (typeof window !== 'undefined' && 
              fallback && 
              !window.location.pathname.endsWith(path)) {
            console.log(`Detected failed navigation, falling back to location change for ${path}`);
            window.location.href = path;
          }
          resolve(true);
        }, 200);
      } catch (error) {
        console.error('Router navigation failed:', error);
        
        // If router fails and fallback is enabled, use direct location change
        if (fallback && typeof window !== 'undefined') {
          console.log(`Falling back to window.location for ${path}`);
          window.location.href = path;
          resolve(true);
        } else {
          resolve(false);
        }
      }
    }, delay);
  });
}; 