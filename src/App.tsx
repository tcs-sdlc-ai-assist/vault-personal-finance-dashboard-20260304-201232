import React, { Suspense, lazy } from 'react';
import { useEffect } from 'react';
import { useUIStore } from './stores/useUIStore';
import Layout from './components/layout/Layout';
import Toast from './components/ui/Toast';
import ConfirmDialog from './components/ui/ConfirmDialog';
import Skeleton from './components/ui/Skeleton';

// Lazy load route components for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Categories = lazy(() => import('./pages/Categories'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Simple SPA router using hash (no backend, no react-router)
type Route =
  | '/'
  | '/dashboard'
  | '/transactions'
  | '/budgets'
  | '/categories'
  | '/settings';

const ROUTES: Record<Route, React.LazyExoticComponent<React.FC>> = {
  '/': Dashboard,
  '/dashboard': Dashboard,
  '/transactions': Transactions,
  '/budgets': Budgets,
  '/categories': Categories,
  '/settings': Settings,
};

function getRoute(): Route {
  // Hash-based routing: #/dashboard, #/transactions, etc.
  const hash = window.location.hash.replace(/^#/, '') || '/';
  if (hash in ROUTES) return hash as Route;
  return '/not-found';
}

const routeComponent = (route: Route | '/not-found') => {
  if (route === '/not-found') return NotFound;
  return ROUTES[route] || NotFound;
};

/**
 * App - Top-level SPA shell.
 * - Handles routing, layout, page transitions, and global providers.
 * - Uses hash-based routing for client-side navigation.
 * - Provides Toast and ConfirmDialog globally.
 */
const App: React.FC = () => {
  const [route, setRoute] = React.useState<Route | '/not-found'>(getRoute());
  const { toast, confirmDialog } = useUIStore();

  // Listen for hash changes to update route
  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Accessibility: scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  // Animate page transitions (using CSS classes)
  const PageComponent = routeComponent(route);

  return (
    <Layout>
      {/* Suspense for lazy-loaded pages */}
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <div
          key={route}
          className="fade-in slide-up min-h-screen"
          aria-live="polite"
          aria-atomic="true"
        >
          <PageComponent />
        </div>
      </Suspense>

      {/* Global Toast notifications */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={toast.close}
      />

      {/* Global Confirm Dialog for destructive actions */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    </Layout>
  );
};

export default App;