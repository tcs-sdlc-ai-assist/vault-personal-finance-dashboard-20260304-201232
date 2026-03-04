import { useMemo } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Budget, Transaction, Category, DateRange } from 'src/types/index';
import { filterTransactionsByDateRange, calculateBudgetProgress } from 'src/lib/calculations';
import { formatDate } from 'src/lib/formatters';

/************************************************************
 * useBudgetProgress.ts
 * Vault - Custom hook for budget progress calculation.
 * - Computes per-category and overall budget progress for the current month.
 * - Used in budget widgets, dashboard, and settings.
 * - Returns progress, spent, remaining, percent for each budget and overall.
 ************************************************************/

/**
 * BudgetProgress - Progress info for a single budget.
 */
export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percent: number;
  category?: Category;
}

/**
 * OverallBudgetProgress - Aggregated progress for all budgets in the current month.
 */
export interface OverallBudgetProgress {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  percentUsed: number;
}

/**
 * useBudgetProgress
 * - Computes budget progress for each active budget in the current month.
 * - Also returns overall progress (sum of all budgets).
 * - Optionally accepts a date range override (defaults to UI filter or current month).
 * @param dateRange Optional DateRange override
 * @returns {
 *   perBudget: BudgetProgress[],
 *   overall: OverallBudgetProgress,
 * }
 */
export default function useBudgetProgress(dateRange?: DateRange) {
  // Finance data
  const budgets = useFinanceStore((state) => state.budgets);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  // UI filter date range (fallback)
  const filterDateRange = useUIStore((state) => state.filterDateRange);

  // Memoized calculation
  return useMemo(() => {
    // Determine date range: use provided, UI filter, or default to current month
    let range: DateRange;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      range = dateRange;
    } else if (filterDateRange && filterDateRange.startDate && filterDateRange.endDate) {
      range = filterDateRange;
    } else {
      // Default: current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      range = {
        preset: 'thisMonth',
        startDate: formatDate(start, 'yyyy-MM-dd'),
        endDate: formatDate(end, 'yyyy-MM-dd'),
      };
    }

    // Filter transactions within date range
    const txInRange = filterTransactionsByDateRange(transactions, range);

    // Filter budgets active in range (isActive and period covers range)
    const activeBudgets = budgets.filter((budget) => {
      if (!budget.isActive) return false;
      // Budget covers at least part of the range
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);
      const rangeStart = new Date(range.startDate);
      const rangeEnd = new Date(range.endDate);
      return (
        budgetEnd >= rangeStart &&
        budgetStart <= rangeEnd
      );
    });

    // Per-budget progress
    const perBudget: BudgetProgress[] = activeBudgets.map((budget) => {
      // Only consider transactions in budget's category and budget's period
      const relevantTx = txInRange.filter(
        (tx) =>
          tx.type === 'expense' &&
          tx.categoryId === budget.categoryId &&
          tx.date >= budget.startDate &&
          tx.date <= budget.endDate
      );
      const progress = calculateBudgetProgress(budget, relevantTx);
      const category = categories.find((cat) => cat.id === budget.categoryId);
      return {
        budget,
        spent: progress.spent,
        remaining: progress.remaining,
        percent: progress.percent,
        category,
      };
    });

    // Overall progress: sum of all budgets in range
    const totalBudgeted = perBudget.reduce((sum, bp) => sum + bp.budget.amount, 0);
    const totalSpent = perBudget.reduce((sum, bp) => sum + bp.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const percentUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    const overall: OverallBudgetProgress = {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      percentUsed,
    };

    return {
      perBudget,
      overall,
    };
  }, [
    budgets,
    transactions,
    categories,
    dateRange,
    filterDateRange,
  ]);
}