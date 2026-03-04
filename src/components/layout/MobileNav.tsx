import React from 'react';
import { cn } from 'src/lib/utils';
import { useUIStore } from 'src/stores/useUIStore';
import { useMediaQuery } from 'src/hooks/useMediaQuery';
import { Home, List, Wallet, Tag, Settings } from 'lucide-react';

/************************************************************
 * MobileNav.tsx
 * Vault - Bottom navigation bar for mobile layouts.
 * - Visible only on mobile/small screens (below md breakpoint).
 * - Adapts to current route and highlights active nav item.
 * - Accessible, sticky, and animated.
 ************************************************************/

// Navigation items definition
interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  route: string;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    route: '/dashboard',
    ariaLabel: 'Go to Dashboard',
  },
  {
    label: 'Transactions',
    icon: List,
    route: '/transactions',
    ariaLabel: 'View Transactions',
  },
  {
    label: 'Budgets',
    icon: Wallet,
    route: '/budgets',
    ariaLabel: 'View Budgets',
  },
  {
    label: 'Categories',
    icon: Tag,
    route: '/categories',
    ariaLabel: 'Manage Categories',
  },
  {
    label: 'Settings',
    icon: Settings,
    route: '/settings',
    ariaLabel: 'App Settings',
  },
];

// Helper: get current route from hash
function getCurrentRoute(): string {
  const hash = window.location.hash.replace(/^#/, '') || '/dashboard';
  // Normalize to route (strip query/fragment)
  const route = hash.split('?')[0].split('#')[0];
  // If route is '/', treat as '/dashboard'
  return route === '/' ? '/dashboard' : route;
}

/**
 * MobileNav - Bottom navigation bar for mobile layouts.
 * - Sticky to bottom, adapts to current route.
 * - Only visible below md breakpoint.
 */
const MobileNav: React.FC = () => {
  const { isMobile } = useMediaQuery();
  const [activeRoute, setActiveRoute] = React.useState<string>(getCurrentRoute());

  // Listen for hash changes to update active route
  React.useEffect(() => {
    const onHashChange = () => {
      setActiveRoute(getCurrentRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Hide on desktop/tablet
  if (!isMobile) return null;

  // Handler: navigate to route (hash-based)
  const handleNav = (route: string) => {
    window.location.hash = route;
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-dropdown',
        'bg-glass backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700',
        'flex justify-between items-center px-2 py-1',
        'shadow-glass',
        'md:hidden',
        'animate-slideUp'
      )}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeRoute === item.route;
        return (
          <button
            key={item.route}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2 px-1',
              'transition-colors duration-200',
              isActive
                ? 'text-brand font-semibold'
                : 'text-neutral-500 hover:text-brand',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'
            )}
            aria-label={item.ariaLabel}
            aria-current={isActive ? 'page' : undefined}
            tabIndex={0}
            onClick={() => handleNav(item.route)}
          >
            <Icon
              size={24}
              className={cn(
                'mb-1',
                isActive ? 'text-brand' : 'text-neutral-400'
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'text-xs',
                isActive ? 'text-brand' : 'text-neutral-500'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;