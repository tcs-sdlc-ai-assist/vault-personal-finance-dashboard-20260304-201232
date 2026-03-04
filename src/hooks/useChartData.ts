import { useMemo } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import {
  Transaction,
  Category,
  DateRange,
  TransactionType,
} from 'src/types/index';
import {
  filterTransactionsByDateRange,
  sumExpensesByCategory,
  sumIncomeByCategory,
  groupTransactionsByDate,
} from 'src/lib/calculations';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, CHART_COLORS } from 'src/lib/constants';
import { formatDate } from 'src/lib/formatters';

/************************************************************
 * useChartData.ts
 * Vault - Custom hook for transforming finance data into chart-ready formats.
 * - Returns data for donut (pie), area, and bar charts.
 * - Handles category color mapping, date grouping, and KPI series.
 * - Uses useMemo for performance.
 ************************************************************/

/**
 * DonutChartDatum - Data shape for Recharts Pie/Donut charts.
 */
export interface DonutChartDatum {
  categoryId: string;
  name: string;
  value: number;
  color: string;
  icon?: string;
}

/**
 * AreaChartDatum - Data shape for Recharts Area charts (time series).
 */
export interface AreaChartDatum {
  date: string; // e.g., '2024-06-01'
  expense: number;
  income: number;
  net: number;
}

/**
 * BarChartDatum - Data shape for Recharts Bar charts (category breakdown).
 */
export interface BarChartDatum {
  categoryId: string;
  name: string;
  expense: number;
  income: number;
  color: string;
  icon?: string;
}

/**
 * useChartData
 * - Returns chart-ready data for donut, area, and bar charts.
 * - Filters by UI date range and category.
 * @param dateRange Optional DateRange override (defaults to UI filter)
 * @returns {
 *   donutData: DonutChartDatum[],
 *   areaData: AreaChartDatum[],
 *   barData: BarChartDatum[],
 * }
 */
export default function useChartData(dateRange?: DateRange) {
  // Finance data
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  // UI filters
  const filterDateRange = useUIStore((state) => state.filterDateRange);
  const filterCategoryId = useUIStore((state) => state.filterCategoryId);

  // Memoized chart data
  return useMemo(() => {
    // Use provided dateRange or UI filter
    const range = dateRange || filterDateRange;

    // Filter transactions by date range
    let filteredTx = filterTransactionsByDateRange(transactions, range);

    // Optionally filter by category
    if (filterCategoryId) {
      filteredTx = filteredTx.filter((tx) => tx.categoryId === filterCategoryId);
    }

    // ----- Donut Chart: Expense breakdown by category -----
    const expenseByCategory = sumExpensesByCategory(filteredTx, categories);
    const donutData: DonutChartDatum[] = Object.entries(expenseByCategory)
      .map(([categoryId, value], idx) => {
        const cat = categories.find((c) => c.id === categoryId);
        return {
          categoryId,
          name: cat?.name || categoryId,
          value,
          color: cat?.color
            ? CATEGORY_COLOR_MAP[categoryId] || cat.color
            : CHART_COLORS[idx % CHART_COLORS.length],
          icon: cat?.icon || CATEGORY_ICON_MAP[categoryId] || undefined,
        };
      })
      .filter((d) => d.value > 0);

    // ----- Area Chart: Expense/Income over time -----
    // Group by date (YYYY-MM-DD)
    const txByDate = groupTransactionsByDate(filteredTx);
    // Get sorted unique dates
    const dates = Object.keys(txByDate).sort();
    const areaData: AreaChartDatum[] = dates.map((date) => {
      const txs = txByDate[date];
      const expense = txs
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const income = txs
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      return {
        date: formatDate(date, 'yyyy-MM-dd'),
        expense,
        income,
        net: income - expense,
      };
    });

    // ----- Bar Chart: Expense/Income by category -----
    const incomeByCategory = sumIncomeByCategory(filteredTx, categories);
    const barData: BarChartDatum[] = categories.map((cat, idx) => ({
      categoryId: cat.id,
      name: cat.name,
      expense: expenseByCategory[cat.id] || 0,
      income: incomeByCategory[cat.id] || 0,
      color: cat.color
        ? CATEGORY_COLOR_MAP[cat.id] || cat.color
        : CHART_COLORS[idx % CHART_COLORS.length],
      icon: cat.icon || CATEGORY_ICON_MAP[cat.id] || undefined,
    }));

    return {
      donutData,
      areaData,
      barData,
    };
  }, [
    transactions,
    categories,
    filterDateRange,
    filterCategoryId,
    dateRange,
  ]);
}