/**
 * This file helps Vercel identify all routes in the application
 * to prevent errors with missing client reference manifests
 */

export const routeMap = {
  '/': { page: '/' },
  '/dashboard': { page: '/dashboard' },
  '/auth/login': { page: '/auth/login' },
  '/auth/register': { page: '/auth/register' },
  '/auth/forgot-password': { page: '/auth/forgot-password' },
  '/auth/reset-password': { page: '/auth/reset-password' },
  '/dashboard/restaurants': { page: '/dashboard/restaurants' },
  '/dashboard/restaurants/create': { page: '/dashboard/restaurants/create' },
  '/dashboard/restaurants/[restaurantId]': { page: '/dashboard/restaurants/[restaurantId]' },
  '/dashboard/restaurants/[restaurantId]/edit': { page: '/dashboard/restaurants/[restaurantId]/edit' },
  '/dashboard/restaurants/[restaurantId]/menus': { page: '/dashboard/restaurants/[restaurantId]/menus' },
  '/dashboard/restaurants/[restaurantId]/menus/create': { page: '/dashboard/restaurants/[restaurantId]/menus/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/edit' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/publish': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/publish' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/create': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/edit' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/create': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/items/create': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/items/create' },
  '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/[itemId]/edit': { page: '/dashboard/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]/[itemId]/edit' },
  '/menus/[menuId]': { page: '/menus/[menuId]' },
  '/variants-test': { page: '/variants-test' },
}; 