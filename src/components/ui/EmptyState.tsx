import React from 'react';
import { cn } from 'src/lib/utils';
import { Button } from 'src/components/ui/Button';
import { LucideIcon, FilePlus, Search, FolderOpen, PiggyBank, Coins } from 'lucide-react';

/************************************************************
 * EmptyState.tsx
 * Vault - Empty state illustration and CTA component.
 * - Used when no data is present (transactions, budgets, categories, etc.).
 * - Supports illustration, title, description, and optional CTA button.
 ************************************************************/

/**
 * Icon map for different empty state types.
 */
const EMPTY_STATE_ICONS: Record<
  EmptyStateType,
  LucideIcon
> = {
  default: FolderOpen,
  transaction: FilePlus,
  search: Search,
  budget: PiggyBank,
  income: Coins,
  savings: PiggyBank,
  category: FolderOpen,
};

/**
 * EmptyStateType - Types for illustration/semantic.
 */
export type EmptyStateType =
  | 'default'
  | 'transaction'
  | 'search'
  | 'budget'
  | 'income'
  | 'savings'
  | 'category';

/**
 * EmptyStateProps - Props for EmptyState component.
 */
export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  className?: string;
  /**
   * CTA button props:
   * - label: Button text
   * - onClick: Handler
   * - icon: Optional Lucide icon name
   * - variant: Button variant (default: 'brand')
   */
  cta?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'brand' | 'accent' | 'outline' | 'ghost';
    disabled?: boolean;
  };
  /**
   * Optional children for custom content.
   */
  children?: React.ReactNode;
}

/**
 * EmptyState - Renders an illustration, title, description, and optional CTA.
 * - Used for empty lists, search results, onboarding, etc.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  className,
  cta,
  children,
}) => {
  // Resolve icon for illustration
  const Icon = EMPTY_STATE_ICONS[type] || FolderOpen;

  // Default titles/descriptions per type
  const DEFAULTS: Record<EmptyStateType, { title: string; description: string }> = {
    default: {
      title: 'Nothing here yet',
      description: 'Start by adding your first item to see your data.',
    },
    transaction: {
      title: 'No transactions',
      description: 'Add your first transaction to track your finances.',
    },
    search: {
      title: 'No results found',
      description: 'Try adjusting your search or filters.',
    },
    budget: {
      title: 'No budgets',
      description: 'Create a budget to manage your spending.',
    },
    income: {
      title: 'No income records',
      description: 'Add income to see your earnings.',
    },
    savings: {
      title: 'No savings goals',
      description: 'Set a savings goal to start saving.',
    },
    category: {
      title: 'No categories',
      description: 'Add categories to organize your finances.',
    },
  };

  const resolvedTitle = title || DEFAULTS[type].title;
  const resolvedDescription = description || DEFAULTS[type].description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4 fade-in slide-up',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {/* Illustration */}
      <div className="mb-6">
        <Icon
          size={56}
          strokeWidth={1.5}
          className={cn(
            'text-brand/80 dark:text-brand-light/80',
            'drop-shadow-lg animate-wiggle'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h2 className="font-heading text-2xl font-bold mb-2 text-neutral-700 dark:text-neutral-100">
        {resolvedTitle}
      </h2>

      {/* Description */}
      <p className="text-neutral-500 dark:text-neutral-300 mb-6 max-w-md">
        {resolvedDescription}
      </p>

      {/* Optional children for custom content */}
      {children && (
        <div className="mb-6 w-full flex flex-col items-center">{children}</div>
      )}

      {/* CTA Button */}
      {cta && (
        <Button
          variant={cta.variant || 'brand'}
          onClick={cta.onClick}
          icon={cta.icon}
          disabled={cta.disabled}
          className="mt-2"
          aria-label={cta.label}
        >
          {cta.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;