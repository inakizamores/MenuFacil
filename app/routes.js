/**
 * Routes Map for Vercel Deployment
 * 
 * This file helps Vercel identify all routes in the application
 * to prevent errors with missing client reference manifests.
 * 
 * The client-reference-manifest error occurs when Vercel can't properly 
 * identify and build all the static routes during deployment.
 * 
 * Important:
 * - Every route in the application should be listed here
 * - This prevents ENOENT errors on deployment for non-existent files
 * - Marketing routes are now defined at the root level to avoid nested groups issues
 */

export const routeMap = {
  // Marketing root routes - now using simple pages instead of nested (routes)/(marketing) structure
  '/': { page: '/' },
  '/about': { page: '/about' },
  '/contact': { page: '/contact' },
  
  // Auth routes
  '/dashboard': { page: '/dashboard' },
  '/auth/login': { page: '/auth/login' },
  '/auth/register': { page: '/auth/register' },
  '/auth/forgot-password': { page: '/auth/forgot-password' },
  '/auth/reset-password': { page: '/auth/reset-password' },
  
  // Dashboard and restaurant management routes
  '/dashboard/restaurants': { page: '/dashboard/restaurants' },
  '/dashboard/restaurants/create': { page: '/dashboard/restaurants/create' },
  '/dashboard/restaurants/[restaurantId]': { page: '/dashboard/restaurants/[restaurantId]' },
  '/dashboard/restaurants/[restaurantId]/edit': { page: '/dashboard/restaurants/[restaurantId]/edit' },
  
  // Menu management routes
  '/dashboard/restaurants/[restaurantId]/menus': { page: '/dashboard/restaurants/[restaurantId]/menus' },
  '/dashboard/restaurants/[restaurantId]/menus/create': { page: '/dashboard/restaurants/[restaurantId]/menus/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/edit' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/publish': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/publish' },
  
  // Category management routes
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/create': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/edit' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/create': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/create' },
  
  // Menu item management routes
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/items/create': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/items/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/[itemId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/[itemId]/edit' },
  
  // Public menu view
  '/menus/[menuId]': { page: '/menus/[menuId]' },
  
  // Test pages
  '/variants-test': { page: '/variants-test' },
}; 