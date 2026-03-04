import React from 'react';
import { cn } from 'src/lib/utils';
import { useUIStore } from 'src/stores/useUIStore';
import { useMediaQuery } from 'src/hooks/useMediaQuery';
import { LucideIcon, Home, List, Wallet, Folder, Settings } from 'lucide-react';
import { CATEGORY_ICON_MAP } from 'src/lib/constants';

/************************************************************
 * SidebarNav.tsx
 * Vault - Sidebar navigation list and active state.
 * - Renders navigation items for each route.
 * - Handles active state, accessibility, and responsive design.
 ************************************************************/

/**
 * Route definition for sidebar navigation.
 */
interface NavRoute {
  key: string;
  label: string;
  icon: LucideIcon;
  hash: string;
  ariaLabel?: string;
}

/**
 * Sidebar navigation routes.
 * - Order matches dashboard priorities.
 */
const NAV_ROUTES: NavRoute[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    hash: '#/dashboard',
    ariaLabel: 'Dashboard',
  },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: List,
    hash: '#/transactions',
    ariaLabel: 'Transactions',
  },
  {
    key: 'budgets',
    label: 'Budgets',
    icon: Wallet,
    hash: '#/budgets',
    ariaLabel: 'Budgets',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: Folder,
    hash: '#/categories',
    ariaLabel: 'Categories',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    hash: '#/settings',
    ariaLabel: 'Settings',
  },
];

/**
 * NavItem - Single navigation item component.
 */
interface NavItemProps {
  route: NavRoute;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ route, active, onClick }) => {
  const Icon = route.icon;
  return (
    <a
      href={route.hash}
      aria-label={route.ariaLabel || route.label}
      className={cn(
        'flex items-center gap-xs px-md py-sm rounded-md font-medium transition-colors',
        'text-neutral-700 dark:text-neutral-100',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        active &&
          'bg-brand/15 text-brand dark:bg-brand/20 dark:text-brand shadow-sm'
      )}
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon
        className={cn(
          'w-5 h-5 mr-sm',
          active ? 'text-brand' : 'text-neutral-400 dark:text-neutral-300'
        )}
        aria-hidden="true"
      />
      <span>{route.label}</span>
    </a>
  );
};

/**
 * SidebarNav - Sidebar navigation list.
 * - Handles active state based on location hash.
 * - Responsive: hides on mobile, shows on tablet/desktop.
 */
const SidebarNav: React.FC = () => {
  // Detect current route from hash
  const [activeKey, setActiveKey] = React.useState<string>(() => {
    const hash = window.location.hash.replace(/^#\//, '');
    return hash || 'dashboard';
  });

  // Listen for hash changes to update active state
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\//, '');
      setActiveKey(hash || 'dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Responsive: hide sidebar on mobile
  const { isMobile } = useMediaQuery();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  // Accessibility: close sidebar on nav click (mobile)
  const handleNavClick = () => {
    if (isMobile) {
      useUIStore.getState().setSidebarOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        'flex flex-col gap-xs',
        'w-full',
        'mt-lg',
        !sidebarOpen && isMobile && 'hidden'
      )}
      aria-label="Sidebar Navigation"
    >
      {NAV_ROUTES.map((route) => (
        <NavItem
          key={route.key}
          route={route}
          active={activeKey === route.key}
          onClick={handleNavClick}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;