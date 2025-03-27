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
  // Main landing page with marketing content and hero section
  '/': { page: '/' },
  
  // Marketing root routes - now using simple pages instead of nested (routes)/(marketing) structure
  '/about': { page: '/about' },
  '/contact': { page: '/contact' },
  '/home': { page: '/home' },
  
  // Auth routes
  '/auth/login': { page: '/auth/login' },
  '/auth/register': { page: '/auth/register' },
  '/auth/forgot-password': { page: '/auth/forgot-password' },
  '/auth/reset-password': { page: '/auth/reset-password' },
  
  // Unified Dashboard routes
  '/dashboard': { page: '/dashboard' },
  '/dashboard/restaurants': { page: '/dashboard/restaurants' },
  '/dashboard/restaurants/create': { page: '/dashboard/restaurants/create' },
  '/dashboard/restaurants/[restaurantId]': { page: '/dashboard/restaurants/[restaurantId]' },
  '/dashboard/restaurants/[restaurantId]/edit': { page: '/dashboard/restaurants/[restaurantId]/edit' },
  
  // Staff management routes
  '/dashboard/staff': { page: '/dashboard/staff' },
  '/dashboard/staff/create': { page: '/dashboard/staff/create' },
  '/dashboard/staff/[staffId]': { page: '/dashboard/staff/[staffId]' },
  '/dashboard/staff/[staffId]/edit': { page: '/dashboard/staff/[staffId]/edit' },
  
  // Menu management routes
  '/dashboard/menus': { page: '/dashboard/menus' },
  '/dashboard/menus/create': { page: '/dashboard/menus/create' },
  '/dashboard/menus/[menuId]': { page: '/dashboard/menus/[menuId]' },
  '/dashboard/menus/[menuId]/edit': { page: '/dashboard/menus/[menuId]/edit' },
  '/dashboard/menus/[menuId]/publish': { page: '/dashboard/menus/[menuId]/publish' },
  
  // Category management routes
  '/dashboard/menus/categories': { page: '/dashboard/menus/categories' },
  '/dashboard/menus/categories/create': { page: '/dashboard/menus/categories/create' },
  '/dashboard/menus/categories/[categoryId]': { page: '/dashboard/menus/categories/[categoryId]' },
  '/dashboard/menus/categories/[categoryId]/edit': { page: '/dashboard/menus/categories/[categoryId]/edit' },
  
  // QR code management routes
  '/dashboard/qr-codes': { page: '/dashboard/qr-codes' },
  '/dashboard/qr-codes/create': { page: '/dashboard/qr-codes/create' },
  '/dashboard/qr-codes/[qrCodeId]': { page: '/dashboard/qr-codes/[qrCodeId]' },
  '/dashboard/qr-codes/[qrCodeId]/edit': { page: '/dashboard/qr-codes/[qrCodeId]/edit' },
  
  // Analytics routes
  '/dashboard/analytics': { page: '/dashboard/analytics' },
  '/dashboard/analytics/menus': { page: '/dashboard/analytics/menus' },
  '/dashboard/analytics/qr-codes': { page: '/dashboard/analytics/qr-codes' },
  
  // Settings routes
  '/dashboard/settings': { page: '/dashboard/settings' },
  '/dashboard/settings/profile': { page: '/dashboard/settings/profile' },
  '/dashboard/settings/account': { page: '/dashboard/settings/account' },
  
  // Legacy routes that should be redirected by middleware
  '/dashboard/restaurants/[restaurantId]/menus': { page: '/dashboard/restaurants/[restaurantId]/menus' },
  '/dashboard/restaurants/[restaurantId]/menus/create': { page: '/dashboard/restaurants/[restaurantId]/menus/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/edit' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/publish': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/publish' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/create': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/edit' },
  
  // Public menu view
  '/menus/[menuId]': { page: '/menus/[menuId]' },
  
  // Test pages
  '/variants-test': { page: '/variants-test' },
  
  // Admin Dashboard routes
  '/admindashboard': { page: '/admindashboard' },
  '/admindashboard/users': { page: '/admindashboard/users' },
  '/admindashboard/restaurants': { page: '/admindashboard/restaurants' },
  '/admindashboard/settings': { page: '/admindashboard/settings' },
  '/admindashboard/analytics': { page: '/admindashboard/analytics' },
  '/admindashboard/security': { page: '/admindashboard/security' },
  '/admindashboard/plans': { page: '/admindashboard/plans' },
  '/admindashboard/notifications': { page: '/admindashboard/notifications' },
  '/admindashboard/system-health': { page: '/admindashboard/system-health' },
  '/admindashboard/alerts': { page: '/admindashboard/alerts' },
  '/admindashboard/activity': { page: '/admindashboard/activity' },
}; 