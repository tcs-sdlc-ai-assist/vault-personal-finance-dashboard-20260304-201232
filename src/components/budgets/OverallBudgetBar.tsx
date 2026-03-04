import React from 'react';
import { useBudgetProgress } from 'src/hooks/useBudgetProgress';
import { useCurrency } from 'src/hooks/useCurrency';
import ProgressBar from 'src/components/ui/ProgressBar';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import PercentageBadge from 'src/components/ui/PercentageBadge';
import { cn } from 'src/lib/utils';

/************************************************************
 * OverallBudgetBar.tsx
 * Vault - Overall monthly budget progress bar for Budgets page.
 * - Shows total budgeted, spent, remaining, and percent used.
 * - Color-coded, animated, accessible.
 ************************************************************/

/**
 * OverallBudgetBar
 * - Displays overall progress for all active budgets in the current month.
 * - Uses useBudgetProgress hook for calculation.
 * - Color codes: green (<80%), yellow (80-100%), red (>100%)
 */
const OverallBudgetBar: React.FC = () => {
  // Get overall budget progress for current month
  const { overall } = useBudgetProgress();

  // Currency formatting (default app currency)
  const { format, symbol } = useCurrency();

  // Determine color based on percent used
  let color = 'success';
  if (overall.percentUsed >= 100) {
    color = 'error';
  } else if (overall.percentUsed >= 80) {
    color = 'warning';
  }

  // Accessibility: progress label
  const progressLabel = `Overall budget used: ${overall.percentUsed.toFixed(1)}%`;

  // Edge case: no budgets
  if (overall.totalBudgeted === 0) {
    return (
      <div className="w-full py-4 px-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center shadow-sm">
        <span className="text-neutral-500 text-sm font-medium mb-2">
          No budgets set for this month.
        </span>
        <span className="text-neutral-400 text-xs">
          Add a budget to track your spending progress.
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full py-4 px-6 rounded-lg bg-white dark:bg-neutral-900 shadow-md flex flex-col gap-4',
        'glass'
      )}
      aria-label="Overall budget progress"
    >
      <div className="flex items-center justify-between">
        <span className="font-heading text-lg font-bold text-neutral-700 dark:text-neutral-100">
          Overall Budget Progress
        </span>
        <PercentageBadge
          value={overall.percentUsed}
          className={cn(
            color === 'success' && 'bg-success/15 text-success-dark',
            color === 'warning' && 'bg-warning/15 text-warning-dark',
            color === 'error' && 'bg-error/15 text-error-dark'
          )}
        />
      </div>
      <ProgressBar
        value={overall.percentUsed}
        color={color}
        label={progressLabel}
        animated
        className="h-4"
      />
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Budgeted</span>
          <CurrencyDisplay
            value={overall.totalBudgeted}
            className="font-semibold text-neutral-700 dark:text-neutral-100"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Spent</span>
          <AnimatedNumber
            value={overall.totalSpent}
            format={format}
            className={cn(
              'font-semibold',
              color === 'success' && 'text-success-dark',
              color === 'warning' && 'text-warning-dark',
              color === 'error' && 'text-error-dark'
            )}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Remaining</span>
          <CurrencyDisplay
            value={overall.totalRemaining}
            className={cn(
              'font-semibold',
              overall.totalRemaining > 0
                ? 'text-neutral-700 dark:text-neutral-100'
                : 'text-error-dark'
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default OverallBudgetBar;