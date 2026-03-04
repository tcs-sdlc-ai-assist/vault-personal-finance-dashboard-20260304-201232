import { useMemo } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { sumTransactions, filterTransactionsByDateRange } from 'src/lib/calculations';
import { Transaction, DateRange } from 'src/types/index';

/************************************************************
 * useDashboardStats.ts
 * Vault - Custom hook for derived dashboard KPIs.
 * - Computes total income, total expense, net balance, largest expense,
 *   average expense, average income, transaction count, and top expense category.
 * - Uses useMemo for performance.
 ************************************************************/

/**
 * DashboardStats - KPIs for dashboard analytics.
 */
export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  largestExpense: Transaction | null;
  averageExpense: number;
  averageIncome: number;
  topExpenseCategoryId: string | null;
}

/**
 * useDashboardStats
 * - Computes dashboard KPIs for the given date range.
 * - If no range provided, uses UI filterDateRange.
 * @param dateRange Optional DateRange to override UI filter
 * @returns DashboardStats object
 */
export default function useDashboardStats(dateRange?: DateRange): DashboardStats {
  // Finance data
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  // UI filter date range (fallback)
  const filterDateRange = useUIStore((state) => state.filterDateRange);

  // Memoized stats calculation
  return useMemo(() => {
    // Use provided dateRange or UI filter
    const range = dateRange || filterDateRange;

    // Filter transactions by date range
    const filteredTx = filterTransactionsByDateRange(transactions, range);

    // Separate by type
    const expenseTx = filteredTx.filter((tx) => tx.type === 'expense');
    const incomeTx = filteredTx.filter((tx) => tx.type === 'income');

    // KPIs
    const totalIncome = sumTransactions(incomeTx, 'income');
    const totalExpense = sumTransactions(expenseTx, 'expense');
    const netBalance = totalIncome - totalExpense;
    const transactionCount = filteredTx.length;

    // Largest expense
    let largestExpense: Transaction | null = null;
    if (expenseTx.length > 0) {
      largestExpense = expenseTx.reduce((max, tx) =>
        Math.abs(tx.amount) > Math.abs(max.amount) ? tx : max
      );
    }

    // Average expense/income
    const averageExpense = expenseTx.length > 0 ? totalExpense / expenseTx.length : 0;
    const averageIncome = incomeTx.length > 0 ? totalIncome / incomeTx.length : 0;

    // Top expense category (by sum)
    let topExpenseCategoryId: string | null = null;
    if (expenseTx.length > 0) {
      const categorySums: Record<string, number> = {};
      for (const tx of expenseTx) {
        categorySums[tx.categoryId] = (categorySums[tx.categoryId] || 0) + Math.abs(tx.amount);
      }
      // Find category with max sum
      topExpenseCategoryId =
        Object.entries(categorySums).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    }

    return {
      totalIncome,
      totalExpense,
      netBalance,
      transactionCount,
      largestExpense,
      averageExpense,
      averageIncome,
      topExpenseCategoryId,
    };
  }, [
    transactions,
    categories,
    dateRange,
    filterDateRange,
  ]);
}