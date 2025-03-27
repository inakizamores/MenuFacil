'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import RouteProtection from '@/app/components/RouteProtection';
import LogoutButton from '@/app/components/LogoutButton';
import { 
  getUserRoleDisplay, 
  isRestaurantStaff, 
  isRestaurantOwner, 
  isSystemAdmin 
} from '@/types/user-roles';
import { useStaffRestaurant } from '@/app/hooks/useStaffRestaurant';

// Icons (using Heroicons classes with Tailwind)
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const RestaurantsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v10a1 1 0 001 1h14a1 1 0 001-1V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
  </svg>
);

const MenusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);

const QRCodesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm1 7a1 1 0 011-1h4a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" />
    <path d="M11 4a1 1 0 100 2h4a1 1 0 100-2h-4zM11 10a1 1 0 100 2h4a1 1 0 100-2h-4zM13 15a1 1 0 102 0v-3a1 1 0 00-2 0v3z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const MobileMenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

type NavItem = {
  name: string;
  href: string;
  icon: React.FC;
  requiredRoles?: Array<'owner' | 'admin' | 'staff'>;
  subItems?: Array<{ name: string; href: string }>;
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { 
    name: 'Restaurants', 
    href: '/dashboard/restaurants', 
    icon: RestaurantsIcon, 
    requiredRoles: ['owner', 'admin'] 
  },
  { 
    name: 'Menus', 
    href: '/dashboard/menus', 
    icon: MenusIcon 
  },
  { 
    name: 'QR Codes', 
    href: '/dashboard/qr-codes', 
    icon: QRCodesIcon 
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: AnalyticsIcon, 
    requiredRoles: ['owner', 'admin'] 
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: SettingsIcon,
    subItems: [
      { name: 'General', href: '/dashboard/settings' },
      { name: 'Profile', href: '/dashboard/settings/profile' }
    ]
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtection>
      <DashboardUI>{children}</DashboardUI>
    </RouteProtection>
  );
}

function DashboardUI({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  const { restaurant } = useStaffRestaurant();
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const router = useRouter();
  
  // Use the user ID as a key to force component refresh when user changes
  const userKey = user?.id || 'no-user';

  // Check user roles
  const isOwner = isRestaurantOwner(user);
  const isAdmin = isSystemAdmin(user);
  const isStaff = isRestaurantStaff(user);
  
  // Redirect admin users to admin dashboard
  useEffect(() => {
    // If user is a system admin, redirect to admin dashboard
    if (user && isAdmin && pathname.startsWith('/dashboard')) {
      console.log('Admin user detected in regular dashboard, redirecting to admin dashboard');
      router.push('/admindashboard');
    }
  }, [user, isAdmin, pathname, router]);

  // Handle expanding/collapsing sidebar items
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Check if current path is or is a child of the given path
  const isActivePath = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    if (!item.requiredRoles) return true;
    
    // Check if user has any of the required roles
    if (isRestaurantOwner(user) && item.requiredRoles.includes('owner')) return true;
    if (isSystemAdmin(user) && item.requiredRoles.includes('admin')) return true;
    if (isRestaurantStaff(user) && item.requiredRoles.includes('staff')) return true;
    
    return false;
  });

  // For staff members, get their associated restaurant name
  useEffect(() => {
    // Reset state on user change
    setRestaurantName(null);
    
    if (user && isRestaurantStaff(user)) {
      if (restaurant) {
        setRestaurantName(restaurant.name);
      } else if (typeof window !== 'undefined') {
        // Fallback to localStorage if hook data isn't available yet
        const storedName = localStorage.getItem('staffRestaurantName');
        if (storedName) {
          setRestaurantName(storedName);
        }
      }
    }
    
    // Add cleanup function
    return () => {
      setRestaurantName(null);
    };
  }, [user, restaurant, userKey]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop with blur */}
        <div 
          className="fixed inset-0 bg-brand-text/10 backdrop-blur-sm transition-opacity duration-250"
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true"
        ></div>
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl-brand transition-transform duration-250">
          <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center">
              <img 
                src="/images/logos/primary/primary-logo-clean.svg"
                alt="MenuFacil"
                className="h-10 w-auto animate-logoFadeIn"
              />
            </Link>
            <button
              className="rounded-md text-brand-text p-1 hover:bg-brand-primary/5 hover:text-brand-accent transition-colors duration-250 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="h-0 flex-1 overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {filteredNavigation.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    // Item with subitems
                    <>
                      <button
                        className={`
                          w-full group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-250
                          ${isActivePath(item.href)
                            ? 'bg-primary-gradient-horizontal text-white shadow-md'
                            : 'text-brand-text hover:bg-brand-background hover:text-brand-accent'}
                        `}
                        onClick={() => toggleExpand(item.name)}
                      >
                        <div className="flex items-center">
                          <span className={`mr-3 transition-colors duration-250 ${isActivePath(item.href) ? 'text-white' : 'text-brand-text group-hover:text-brand-accent'}`}>
                            {<item.icon />}
                          </span>
                          {item.name}
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 transition-transform duration-200 ${expandedItems[item.name] ? 'rotate-180' : ''}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Subitems */}
                      {expandedItems[item.name] && (
                        <div className="mt-1 ml-6 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`
                                block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-250
                                ${pathname === subItem.href
                                  ? 'bg-primary-gradient-horizontal text-white shadow-md'
                                  : 'text-brand-text hover:bg-brand-background hover:text-brand-accent'}
                              `}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Regular item without subitems
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-250
                        ${pathname === item.href
                          ? 'bg-primary-gradient-horizontal text-white shadow-md'
                          : 'text-brand-text hover:bg-brand-background hover:text-brand-accent'}
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className={`mr-3 transition-colors duration-250 ${pathname === item.href ? 'text-white' : 'text-brand-text group-hover:text-brand-accent'}`}>
                        {<item.icon />}
                      </span>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white shadow-md pt-5">
          <div className="flex flex-shrink-0 items-center px-6 pb-5">
            <Link href="/dashboard" className="flex items-center">
              <img 
                src="/images/logos/primary/primary-logo-clean.svg"
                alt="MenuFacil"
                className="h-10 w-auto animate-logoFadeIn"
              />
            </Link>
          </div>
          <div className="mt-5 flex flex-grow flex-col">
            <nav className="flex-1 space-y-2 px-4 pb-4">
              {filteredNavigation.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    // Item with subitems
                    <>
                      <button
                        className={`
                          w-full group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-250
                          ${isActivePath(item.href)
                            ? 'bg-primary-gradient-horizontal text-white shadow-md'
                            : 'text-brand-text hover:bg-brand-background hover:text-brand-accent'}
                        `}
                        onClick={() => toggleExpand(item.name)}
                      >
                        <div className="flex items-center">
                          <span className={`mr-3 transition-colors duration-250 ${isActivePath(item.href) ? 'text-white' : 'text-brand-text group-hover:text-brand-accent'}`}>
                            {<item.icon />}
                          </span>
                          {item.name}
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 transition-transform duration-200 ${expandedItems[item.name] ? 'rotate-180' : ''}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Subitems */}
                      {expandedItems[item.name] && (
                        <div className="mt-1 ml-6 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`
                                block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-250
                                ${pathname === subItem.href
                                  ? 'bg-primary-gradient-horizontal text-white shadow-md'
                                  : 'text-brand-text hover:bg-brand-background hover:text-brand-accent'}
                              `}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Regular item without subitems
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-250
                        ${pathname === item.href
                          ? 'bg-primary-gradient-horizontal text-white shadow-md'
                          : 'text-brand-text hover:bg-brand-background hover:text-brand-accent'}
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className={`mr-3 transition-colors duration-250 ${pathname === item.href ? 'text-white' : 'text-brand-text group-hover:text-brand-accent'}`}>
                        {<item.icon />}
                      </span>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-0">
            <div className="flex items-center w-full bg-brand-background/30 rounded-lg m-4 p-4 shadow-sm hover:shadow-md transition-all duration-250 hover:bg-brand-background/50">
              <div className="flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-md border-2 border-white">
                    <span className="text-lg font-semibold">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-brand-text">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                {isRestaurantStaff(user) ? (
                  <>
                    <p className="text-xs font-medium text-brand-accent mb-1">Restaurant Staff</p>
                    {restaurantName && (
                      <p className="text-xs text-brand-text/70 mb-1 truncate max-w-[160px]">{restaurantName}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs font-medium text-brand-accent mb-1">
                    {getUserRoleDisplay(user)}
                  </p>
                )}
                <LogoutButton
                  className="text-xs font-medium text-brand-text hover:text-brand-accent transition-colors duration-250 mt-1"
                  showIcon={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-md backdrop-blur-sm bg-white/90">
          <button
            className="border-r border-gray-200 px-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MobileMenuIcon />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-brand-text hidden sm:block">
                {pathname === '/dashboard' ? 'Dashboard' : 
                 pathname.startsWith('/dashboard/restaurants') ? 'Restaurants' : 
                 pathname.startsWith('/dashboard/menus') ? 'Menus' : 
                 pathname.startsWith('/dashboard/qr-codes') ? 'QR Codes' : 
                 pathname.startsWith('/dashboard/analytics') ? 'Analytics' : 
                 pathname.startsWith('/dashboard/settings') ? 'Settings' : 'Dashboard'}
              </h1>
            </div>
            <div className="ml-4 flex items-center lg:hidden">
              <div className="flex items-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full border-2 border-brand-background shadow-sm"
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent text-white shadow-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="ml-2 flex flex-col">
                  {isRestaurantStaff(user) ? (
                    <>
                      <span className="text-xs text-brand-text">Restaurant Staff</span>
                      {restaurantName && (
                        <span className="text-xs text-brand-text truncate max-w-[100px]">{restaurantName}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-brand-text">
                      {getUserRoleDisplay(user)}
                    </span>
                  )}
                  <LogoutButton
                    className="text-xs font-medium text-brand-text/70 hover:text-brand-accent transition-colors duration-250"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 