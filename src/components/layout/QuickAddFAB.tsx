import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from 'src/lib/utils';
import { useUIStore } from 'src/stores/useUIStore';
import useMediaQuery from 'src/hooks/useMediaQuery';

/************************************************************
 * QuickAddFAB.tsx
 * Vault - Floating Action Button for quick-add transaction.
 * - Responsive: visible on mobile/tablet, hidden on desktop.
 * - Accessible: keyboard, screen reader, focus ring.
 * - Triggers transaction modal via UI store.
 ************************************************************/

/**
 * QuickAddFAB
 * - Floating action button for quick-add transaction.
 * - Shows on mobile/tablet (below lg breakpoint).
 * - Opens transaction modal on click.
 */
const QuickAddFAB: React.FC = () => {
  const { isMobile, isTablet } = useMediaQuery();
  const setModalOpen = useUIStore((state) => state.setModalOpen);

  // Only show FAB on mobile/tablet
  const showFAB = isMobile || isTablet;

  // Handler: open transaction modal
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setModalOpen(true, 'transaction');
  };

  // Keyboard accessibility: open modal on Enter/Space
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setModalOpen(true, 'transaction');
    }
  };

  if (!showFAB) return null;

  return (
    <button
      type="button"
      aria-label="Quick Add Transaction"
      title="Quick Add Transaction"
      className={cn(
        'fixed z-[30] bottom-6 right-6',
        'bg-brand text-white rounded-full shadow-lg shadow-brand/20',
        'w-14 h-14 flex items-center justify-center',
        'transition-colors duration-300',
        'hover:bg-brand-dark focus:bg-brand-dark',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        'active:scale-95',
        'animate-fadeIn',
        // Glassmorphism effect
        'backdrop-blur-md',
        // Responsive: hide on desktop
        'lg:hidden'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <Plus className="w-7 h-7" aria-hidden="true" />
      <span className="sr-only">Add Transaction</span>
    </button>
  );
};

export default QuickAddFAB;