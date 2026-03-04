import React from 'react';
import { useBudgetProgress, BudgetProgress, OverallBudgetProgress } from 'src/hooks/useBudgetProgress';
import { useCurrency } from 'src/hooks/useCurrency';
import ProgressBar from 'src/components/ui/ProgressBar';
import Card from 'src/components/ui/Card';
import Badge from 'src/components/ui/Badge';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import EmptyState from 'src/components/ui/EmptyState';
import { cn } from 'src/lib/utils';

/************************************************************
 * BudgetProgressWidget.tsx
 * Vault - Widget showing overall and per-category budget progress.
 * - Used in dashboard and budgets page.
 * - Displays total budgeted, spent, remaining, percent used.
 * - Shows per-category progress bars and KPIs.
 ************************************************************/

/**
 * BudgetProgressWidget
 * - Displays overall budget progress and per-category breakdown.
 * - Handles empty state, loading, and responsive layout.
 */
const BudgetProgressWidget: React.FC = () => {
  // Get budget progress (current month or UI filter)
  const { perBudget, overall } = useBudgetProgress();

  // Currency formatting (default app currency)
  const { format, symbol } = useCurrency();

  // Empty state: no budgets
  const isEmpty = perBudget.length === 0;

  return (
    <Card
      className={cn(
        'w-full max-w-3xl mx-auto p-6 bg-glass shadow-glass rounded-lg',
        'flex flex-col gap-6'
      )}
      aria-label="Budget Progress"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-xl font-bold text-brand-dark dark:text-brand-light">
          Budget Progress
        </h2>
        <Badge
          color={overall.percentUsed < 80 ? 'success' : overall.percentUsed < 100 ? 'warning' : 'error'}
          className="text-xs font-medium"
        >
          {overall.percentUsed >= 100
            ? 'Over Budget'
            : `${overall.percentUsed.toFixed(1)}% Used`}
        </Badge>
      </div>

      {/* Overall KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-neutral-500 text-sm">Budgeted</span>
          <AnimatedNumber
            value={overall.totalBudgeted}
            format={format}
            className="text-lg font-bold text-brand"
            aria-label="Total Budgeted"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-neutral-500 text-sm">Spent</span>
          <AnimatedNumber
            value={overall.totalSpent}
            format={format}
            className={cn(
              'text-lg font-bold',
              overall.percentUsed < 80
                ? 'text-success'
                : overall.percentUsed < 100
                ? 'text-warning'
                : 'text-error'
            )}
            aria-label="Total Spent"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-neutral-500 text-sm">Remaining</span>
          <AnimatedNumber
            value={overall.totalRemaining}
            format={format}
            className={cn(
              'text-lg font-bold',
              overall.totalRemaining > 0 ? 'text-brand-dark' : 'text-error'
            )}
            aria-label="Total Remaining"
          />
        </div>
      </div>

      {/* Overall progress bar */}
      <ProgressBar
        value={overall.percentUsed}
        max={100}
        color={
          overall.percentUsed < 80
            ? 'success'
            : overall.percentUsed < 100
            ? 'warning'
            : 'error'
        }
        className="h-4 rounded-full mb-4"
        aria-label="Overall Budget Progress"
      />

      {/* Per-category budget progress */}
      <div className="flex flex-col gap-4">
        {isEmpty ? (
          <EmptyState
            title="No Budgets Set"
            description="Create budgets to track your spending and stay on target."
            icon="PiggyBank"
            className="mt-4"
          />
        ) : (
          perBudget.map((bp) => (
            <div
              key={bp.budget.id}
              className={cn(
                'flex items-center gap-4 p-2 rounded-md bg-neutral-50 dark:bg-neutral-800',
                bp.percent >= 100 && 'ring-2 ring-error/60'
              )}
              aria-label={`Budget for ${bp.category?.name || 'Category'}`}
            >
              {/* Category badge/icon */}
              <Badge
                color={bp.category?.color || 'brand'}
                icon={bp.category?.icon}
                className="min-w-[90px] text-xs font-semibold"
              >
                {bp.category?.name || 'Category'}
              </Badge>

              {/* Progress bar */}
              <div className="flex-1 flex flex-col gap-1">
                <ProgressBar
                  value={bp.percent}
                  max={100}
                  color={
                    bp.percent < 80
                      ? 'success'
                      : bp.percent < 100
                      ? 'warning'
                      : 'error'
                  }
                  className="h-3 rounded-full"
                  aria-label={`Budget progress for ${bp.category?.name || 'Category'}`}
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>
                    Spent:{' '}
                    <CurrencyDisplay
                      amount={bp.spent}
                      currency={symbol}
                      className="font-medium text-neutral-700 dark:text-neutral-200"
                    />
                  </span>
                  <span>
                    Remaining:{' '}
                    <CurrencyDisplay
                      amount={bp.remaining}
                      currency={symbol}
                      className={cn(
                        'font-medium',
                        bp.remaining > 0 ? 'text-brand-dark' : 'text-error'
                      )}
                    />
                  </span>
                  <span>
                    Budget:{' '}
                    <CurrencyDisplay
                      amount={bp.budget.amount}
                      currency={symbol}
                      className="font-medium text-neutral-700 dark:text-neutral-200"
                    />
                  </span>
                </div>
              </div>

              {/* Percent badge */}
              <Badge
                color={
                  bp.percent < 80
                    ? 'success'
                    : bp.percent < 100
                    ? 'warning'
                    : 'error'
                }
                className={cn(
                  'ml-2 text-xs font-semibold min-w-[60px] text-center',
                  bp.percent >= 100 && 'animate-wiggle'
                )}
              >
                {bp.percent >= 100
                  ? 'Over'
                  : `${bp.percent.toFixed(1)}%`}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default BudgetProgressWidget;