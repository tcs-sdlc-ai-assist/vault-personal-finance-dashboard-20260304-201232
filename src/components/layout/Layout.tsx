import React from 'react';
import Sidebar from './Sidebar';
import { cn } from 'src/lib/utils';
import { useUIStore } from 'src/stores/useUIStore';
import useMediaQuery from 'src/hooks/useMediaQuery';

/************************************************************
 * Layout.tsx
 * Vault - SPA layout container and navigation shell.
 * - Provides sidebar navigation (desktop/tablet), bottom nav (mobile), top bar, and main content area.
 * - Handles responsive adaptation and accessibility.
 ************************************************************/

/**
 * LayoutProps - Children are rendered in the main content area.
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout
 * - Main SPA shell: sidebar, top bar, content area.
 * - Responsive: sidebar (desktop/tablet), bottom nav (mobile).
 * - Handles sidebar open/close state, accessibility, and focus management.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Responsive breakpoints
  const {
    isMobile,
    isTablet,
    isDesktop,
    width,
    currentBreakpoint,
  } = useMediaQuery();

  // Sidebar state (open/closed for mobile/tablet)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  // Accessibility: trap focus when sidebar is open on mobile
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  // Top bar: brand, actions, responsive menu button
  const TopBar = (
    <header
      className={cn(
        'sticky top-0 z-dropdown bg-glass backdrop-blur flex items-center justify-between px-4 py-3 shadow-md',
        'md:px-6 md:py-4',
        'dark:bg-glass'
      )}
      role="banner"
      aria-label="Vault Top Bar"
    >
      {/* Brand/logo */}
      <div className="flex items-center gap-2">
        <img
          src="/favicon.svg"
          alt="Vault Logo"
          className="w-8 h-8"
          aria-hidden="true"
        />
        <span className="font-heading text-xl font-bold text-brand dark:text-brand-light">
          Vault
        </span>
      </div>
      {/* Responsive menu button (mobile/tablet) */}
      {(isMobile || isTablet) && (
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-md p-2 text-brand bg-neutral-100 hover:bg-brand hover:text-neutral-50 transition focus-visible:ring-2 focus-visible:ring-brand',
            'dark:bg-neutral-800 dark:hover:bg-brand-dark dark:text-brand-light'
          )}
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
          aria-controls="vault-sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {/* Hamburger or X icon */}
          {sidebarOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}
    </header>
  );

  // Main layout structure
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      {/* Top bar */}
      {TopBar}

      <div className="flex flex-1 w-full relative">
        {/* Sidebar (desktop/tablet) */}
        {(isDesktop || isTablet) && (
          <Sidebar
            open={isDesktop ? true : sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            breakpoint={currentBreakpoint}
          />
        )}

        {/* Sidebar overlay (mobile/tablet, when open) */}
        {isMobile && sidebarOpen && (
          <>
            {/* Sidebar drawer */}
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              breakpoint={currentBreakpoint}
            />
            {/* Overlay */}
            <div
              className="fixed inset-0 z-modal bg-overlay backdrop-blur-sm animate-fadeIn"
              aria-label="Sidebar overlay"
              onClick={() => setSidebarOpen(false)}
              tabIndex={-1}
            />
          </>
        )}

        {/* Main content area */}
        <main
          className={cn(
            'flex-1 min-h-screen px-4 py-6 md:px-8 md:py-8',
            isDesktop
              ? 'ml-[260px]' // Sidebar width
              : isTablet && sidebarOpen
              ? 'ml-[220px]'
              : ''
          )}
          role="main"
          aria-label="Vault Main Content"
          tabIndex={0}
        >
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile only) */}
      {isMobile && !sidebarOpen && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-dropdown bg-glass backdrop-blur border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-around h-16 shadow-md animate-slideUp"
          role="navigation"
          aria-label="Vault Bottom Navigation"
        >
          {/* Minimal bottom nav: Dashboard, Transactions, Budgets, Categories, Settings */}
          <a
            href="#/dashboard"
            className={cn(
              'flex flex-col items-center justify-center px-2 py-1 text-brand hover:text-brand-dark transition',
              window.location.hash === '#/dashboard' ? 'font-bold' : ''
            )}
            aria-current={window.location.hash === '#/dashboard' ? 'page' : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 13h2v-2H3v2zm4 0h2v-6H7v6zm4 0h2v-10h-2v10zm4 0h2v-4h-2v4z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
          <a
            href="#/transactions"
            className={cn(
              'flex flex-col items-center justify-center px-2 py-1 text-brand hover:text-brand-dark transition',
              window.location.hash === '#/transactions' ? 'font-bold' : ''
            )}
            aria-current={window.location.hash === '#/transactions' ? 'page' : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3v18m9-9H3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs mt-1">Transactions</span>
          </a>
          <a
            href="#/budgets"
            className={cn(
              'flex flex-col items-center justify-center px-2 py-1 text-brand hover:text-brand-dark transition',
              window.location.hash === '#/budgets' ? 'font-bold' : ''
            )}
            aria-current={window.location.hash === '#/budgets' ? 'page' : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 7h16M4 11h16M4 15h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs mt-1">Budgets</span>
          </a>
          <a
            href="#/categories"
            className={cn(
              'flex flex-col items-center justify-center px-2 py-1 text-brand hover:text-brand-dark transition',
              window.location.hash === '#/categories' ? 'font-bold' : ''
            )}
            aria-current={window.location.hash === '#/categories' ? 'page' : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs mt-1">Categories</span>
          </a>
          <a
            href="#/settings"
            className={cn(
              'flex flex-col items-center justify-center px-2 py-1 text-brand hover:text-brand-dark transition',
              window.location.hash === '#/settings' ? 'font-bold' : ''
            )}
            aria-current={window.location.hash === '#/settings' ? 'page' : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.94-2.5a1 1 0 0 0 .06-1.5l-1.42-1.42a1 1 0 0 0-1.5.06l-1.42 1.42a1 1 0 0 0 .06 1.5l1.42 1.42a1 1 0 0 0 1.5-.06l1.42-1.42zM4.06 13a1 1 0 0 0-.06 1.5l1.42 1.42a1 1 0 0 0 1.5-.06l1.42-1.42a1 1 0 0 0-.06-1.5l-1.42-1.42a1 1 0 0 0-1.5.06l-1.42 1.42z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </a>
        </nav>
      )}
    </div>
  );
};

export default Layout;