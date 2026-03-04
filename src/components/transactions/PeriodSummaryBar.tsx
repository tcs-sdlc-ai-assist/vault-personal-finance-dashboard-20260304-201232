import React from 'react';
import { useUIStore } from 'src/stores/useUIStore';
import { useCurrency } from 'src/hooks/useCurrency';
import useDashboardStats from 'src/hooks/useDashboardStats';
import { cn } from 'src/lib/utils';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import Badge from 'src/components/ui/Badge';
import PercentageBadge from 'src/components/ui/PercentageBadge';

/************************************************************
 * PeriodSummaryBar.tsx
 * Vault - Summary bar for transaction period totals.
 * - Shows totals for filtered transactions: income, expense, net.
 * - Responsive, accessible, animated.
 ************************************************************/

/**
 * PeriodSummaryBar
 * - Displays summary KPIs for the current filtered period.
 * - Shows: Total Income, Total Expense, Net Balance, and optionally % change.
 */
const PeriodSummaryBar: React.FC = () => {
  // Get filter date range for label
  const filterDateRange = useUIStore((state) => state.filterDateRange);

  // Dashboard stats for filtered period
  const {
    totalIncome,
    totalExpense,
    netBalance,
    averageExpense,
    averageIncome,
    transactionCount,
  } = useDashboardStats();

  // Currency formatting
  const { format: formatCurrency, code: currencyCode } = useCurrency();

  // Accessibility: summary label
  const periodLabel = (() => {
    if (filterDateRange.preset === 'all') return 'All Time';
    if (filterDateRange.preset === 'custom') {
      return `Custom: ${filterDateRange.startDate} – ${filterDateRange.endDate}`;
    }
    // Capitalize preset label
    return (
      filterDateRange.preset
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .replace('This ', '')
        .replace('Last ', '')
    );
  })();

  // Net badge color
  const netColor =
    netBalance > 0
      ? 'success'
      : netBalance < 0
      ? 'error'
      : 'neutral';

  // Responsive layout: stack on mobile, row on desktop
  return (
    <section
      className={cn(
        'w-full flex flex-col md:flex-row items-center justify-between gap-md bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-sm px-lg py-md mb-lg',
        'glass'
      )}
      aria-label="Period Summary"
      role="region"
    >
      {/* Period label */}
      <div className="flex items-center gap-sm mb-sm md:mb-0">
        <Badge color="info" className="font-heading text-sm px-md py-xs">
          {periodLabel}
        </Badge>
        <span className="text-xs text-neutral-500 ml-xs">
          {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* KPIs: Income, Expense, Net */}
      <div className="flex flex-wrap items-center gap-lg">
        {/* Income */}
        <div className="flex flex-col items-start">
          <span className="text-xs text-neutral-500 mb-xs">Income</span>
          <div className="flex items-center gap-xs">
            <AnimatedNumber
              value={totalIncome}
              format={formatCurrency}
              className="text-success font-bold text-lg"
              aria-label={`Total income: ${formatCurrency(totalIncome)}`}
            />
            <PercentageBadge
              value={averageIncome}
              compare={0}
              positiveColor="success"
              negativeColor="error"
              className="ml-xs"
              tooltip="Average income"
            />
          </div>
        </div>

        {/* Expense */}
        <div className="flex flex-col items-start">
          <span className="text-xs text-neutral-500 mb-xs">Expense</span>
          <div className="flex items-center gap-xs">
            <AnimatedNumber
              value={totalExpense}
              format={formatCurrency}
              className="text-error font-bold text-lg"
              aria-label={`Total expense: ${formatCurrency(totalExpense)}`}
            />
            <PercentageBadge
              value={averageExpense}
              compare={0}
              positiveColor="error"
              negativeColor="success"
              className="ml-xs"
              tooltip="Average expense"
            />
          </div>
        </div>

        {/* Net Balance */}
        <div className="flex flex-col items-start">
          <span className="text-xs text-neutral-500 mb-xs">Net</span>
          <div className="flex items-center gap-xs">
            <AnimatedNumber
              value={netBalance}
              format={formatCurrency}
              className={cn(
                'font-bold text-lg',
                netColor === 'success' && 'text-success',
                netColor === 'error' && 'text-error',
                netColor === 'neutral' && 'text-neutral-500'
              )}
              aria-label={`Net balance: ${formatCurrency(netBalance)}`}
            />
            <Badge
              color={netColor}
              className="ml-xs text-xs font-medium"
              aria-label={
                netBalance > 0
                  ? 'Surplus'
                  : netBalance < 0
                  ? 'Deficit'
                  : 'Balanced'
              }
            >
              {netBalance > 0
                ? 'Surplus'
                : netBalance < 0
                ? 'Deficit'
                : 'Balanced'}
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeriodSummaryBar;