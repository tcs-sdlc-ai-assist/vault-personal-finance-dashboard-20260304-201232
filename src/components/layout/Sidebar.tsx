import React, { useMemo } from 'react';
import { cn } from 'src/lib/utils';
import { useUIStore } from 'src/stores/useUIStore';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { LucideIcon, Home, List, PieChart, Layers, Settings, LogOut } from 'lucide-react';
import { CATEGORY_ICON_MAP } from 'src/lib/constants';

/************************************************************
 * Sidebar.tsx
 * Vault - Responsive, animated sidebar navigation for desktop/tablet.
 * - Collapsible, animated, and accessible.
 * - Shows navigation links, app branding, and quota info.
 * - Handles sidebar open/close state via UI store.
 ************************************************************/

// ---------- Navigation Links ----------

interface NavLink {
  label: string;
  icon: LucideIcon;
  route: string;
  ariaLabel?: string;
}

const NAV_LINKS: NavLink[] = [
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
    icon: PieChart,
    route: '/budgets',
    ariaLabel: 'Manage Budgets',
  },
  {
    label: 'Categories',
    icon: Layers,
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

// ---------- Sidebar Component ----------

interface SidebarProps {
  className?: string;
}

const SIDEBAR_WIDTH = {
  expanded: 'w-64',
  collapsed: 'w-20',
};

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  // UI state
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  // Responsive: show/hide based on breakpoint
  const { isDesktop, isTablet, isMobile } = useMediaQuery();

  // Collapsed state: only on desktop/tablet, not mobile
  const [collapsed, setCollapsed] = React.useState(false);

  // Handle collapse toggle
  const handleCollapse = () => setCollapsed((prev) => !prev);

  // Accessibility: close sidebar on mobile/tablet
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  // Current route (hash-based)
  const currentRoute = useMemo(() => {
    const hash = window.location.hash.replace(/^#/, '') || '/dashboard';
    return hash;
  }, [window.location.hash]);

  // Branding
  const Brand = (
    <div className="flex items-center gap-2 px-4 py-3">
      <img
        src="/favicon.svg"
        alt="Vault Logo"
        className="w-8 h-8"
        aria-hidden="true"
      />
      {!collapsed && (
        <span className="font-heading font-bold text-lg text-brand">
          Vault
        </span>
      )}
    </div>
  );

  // Quota info (optional, can be shown at bottom)
  // For demo, show a simple progress bar
  const quota = useUIStore((state) => state.quota) || {
    usedBytes: 0,
    maxBytes: 5 * 1024 * 1024,
    percentUsed: 0,
  };

  const QuotaBar = (
    <div className={cn('px-4 py-2', !collapsed && 'mt-auto')}>
      <div className="flex items-center gap-2">
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-brand rounded-full transition-all"
            style={{ width: `${quota.percentUsed}%` }}
            aria-label={`Storage used: ${quota.percentUsed.toFixed(1)}%`}
          />
        </div>
        {!collapsed && (
          <span className="text-xs text-neutral-500">
            {quota.percentUsed.toFixed(1)}%
          </span>
        )}
      </div>
      {!collapsed && (
        <span className="text-xs text-neutral-400 mt-1 block">
          Storage
        </span>
      )}
    </div>
  );

  // Sidebar animation classes
  const sidebarAnim = collapsed
    ? 'transition-all duration-200 ease-in-out w-20'
    : 'transition-all duration-200 ease-in-out w-64';

  // Sidebar container classes
  const sidebarClass = cn(
    'fixed top-0 left-0 h-screen bg-white dark:bg-neutral-900 shadow-lg z-dropdown flex flex-col',
    sidebarAnim,
    className
  );

  // Navigation link renderer
  const renderNavLink = (link: NavLink) => {
    const isActive = currentRoute === link.route || (currentRoute === '/' && link.route === '/dashboard');
    return (
      <a
        key={link.route}
        href={`#${link.route}`}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium',
          isActive
            ? 'bg-brand/10 text-brand'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
          collapsed && 'justify-center px-2'
        )}
        aria-label={link.ariaLabel || link.label}
        tabIndex={0}
      >
        <link.icon
          className={cn(
            'w-6 h-6',
            isActive ? 'text-brand' : 'text-neutral-400'
          )}
            aria-hidden="true"
        />
        {!collapsed && <span>{link.label}</span>}
      </a>
    );
  };

  // Collapse button
  const CollapseButton = (
    <button
      type="button"
      className={cn(
        'absolute -right-3 top-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-md p-1 transition-all z-dropdown',
        'hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand'
      )}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onClick={handleCollapse}
      tabIndex={0}
    >
      {/* Use Lucide icon for collapse/expand */}
      <svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        className={cn(
          'transition-transform',
          collapsed ? 'rotate-180' : ''
        )}
        aria-hidden="true"
      >
        <path
          d="M7 10l5-5v10l-5-5z"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  // Sidebar main render
  return (
    <aside
      className={sidebarClass}
      aria-label="Sidebar navigation"
      role="navigation"
    >
      {/* Branding */}
      {Brand}

      {/* Collapse button (desktop/tablet only) */}
      {(isDesktop || isTablet) && CollapseButton}

      {/* Navigation links */}
      <nav className={cn('flex flex-col gap-1 mt-4')}>
        {NAV_LINKS.map(renderNavLink)}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quota info */}
      {QuotaBar}

      {/* Logout (for demo, not functional) */}
      {!collapsed && (
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-2 mt-2 rounded-lg text-neutral-400 hover:text-error hover:bg-error/10 transition-colors"
          aria-label="Logout"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            // No backend, so just show a toast or nothing
          }}
        >
          <LogOut className="w-6 h-6" aria-hidden="true" />
          <span>Logout</span>
        </a>
      )}
    </aside>
  );
};

export default Sidebar;