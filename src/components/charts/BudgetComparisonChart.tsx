import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Budget, Category } from 'src/types/index';
import { formatCurrency } from 'src/lib/formatters';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP } from 'src/lib/constants';
import { cn } from 'src/lib/utils';

/************************************************************
 * BudgetComparisonChart.tsx
 * Vault - Grouped bar chart for budget vs. actual spending.
 * - Visualizes budgeted vs. spent per category.
 * - Used in budgets page.
 * - Responsive, accessible, and animated.
 ************************************************************/

/**
 * BudgetComparisonDatum - Data shape for chart.
 */
interface BudgetComparisonDatum {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
  color: string;
  icon?: string;
}

/**
 * BudgetComparisonChart Props
 * - Optionally accepts budgets, spentByCategory, categories, currency.
 * - If not provided, uses store state.
 */
interface BudgetComparisonChartProps {
  budgets?: Budget[];
  spentByCategory?: Record<string, number>;
  categories?: Category[];
  currency?: string;
  className?: string;
  height?: number;
}

/**
 * CustomTooltip - Tooltip for Recharts bar chart.
 */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  currency?: string;
}> = ({ active, payload, label, currency }) => {
  if (!active || !payload || payload.length === 0) return null;
  const budgeted = payload.find((p) => p.dataKey === 'budgeted')?.value ?? 0;
  const spent = payload.find((p) => p.dataKey === 'spent')?.value ?? 0;
  return (
    <div className="glass p-3 rounded-lg shadow-glass border border-neutral-200 dark:border-neutral-700">
      <div className="font-heading text-sm mb-1">{label}</div>
      <div className="flex flex-col gap-1 text-xs">
        <span>
          <span className="font-medium text-brand">Budgeted:</span>{' '}
          {formatCurrency(budgeted, currency)}
        </span>
        <span>
          <span className="font-medium text-category-groceries">Spent:</span>{' '}
          {formatCurrency(spent, currency)}
        </span>
        <span>
          <span className="font-medium">Remaining:</span>{' '}
          {formatCurrency(budgeted - spent, currency)}
        </span>
      </div>
    </div>
  );
};

/**
 * BudgetComparisonChart
 * - Grouped bar chart for budget vs. actual spending per category.
 * - Responsive, accessible, and animated.
 */
const BudgetComparisonChart: React.FC<BudgetComparisonChartProps> = ({
  budgets,
  spentByCategory,
  categories,
  currency,
  className,
  height = 320,
}) => {
  // Store state fallback
  const storeBudgets = useFinanceStore((state) => state.budgets);
  const storeCategories = useFinanceStore((state) => state.categories);
  const storeTransactions = useFinanceStore((state) => state.transactions);
  const filterDateRange = useUIStore((state) => state.filterDateRange);

  // Currency fallback
  const appCurrency = currency || 'USD';

  // Prepare budgets and categories
  const usedBudgets = budgets ?? storeBudgets;
  const usedCategories = categories ?? storeCategories;

  // Compute spent per category (within budget period)
  const computedSpentByCategory: Record<string, number> = React.useMemo(() => {
    if (spentByCategory) return spentByCategory;
    // For each budget, sum expense transactions in its category and period
    const result: Record<string, number> = {};
    for (const budget of usedBudgets) {
      const relevantTx = storeTransactions.filter(
        (tx) =>
          tx.type === 'expense' &&
          tx.categoryId === budget.categoryId &&
          tx.date >= budget.startDate &&
          tx.date <= budget.endDate
      );
      result[budget.categoryId] =
        relevantTx.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    }
    return result;
  }, [spentByCategory, usedBudgets, storeTransactions]);

  // Prepare chart data: one entry per budgeted category
  const chartData: BudgetComparisonDatum[] = React.useMemo(() => {
    return usedBudgets.map((budget) => {
      const category = usedCategories.find((cat) => cat.id === budget.categoryId);
      return {
        categoryId: budget.categoryId,
        categoryName: category?.name || budget.categoryId,
        budgeted: budget.amount,
        spent: computedSpentByCategory[budget.categoryId] ?? 0,
        color:
          category?.color
            ? CATEGORY_COLOR_MAP[budget.categoryId] || category.color
            : '#64748B',
        icon: category?.icon || CATEGORY_ICON_MAP[budget.categoryId] || undefined,
      };
    });
  }, [usedBudgets, usedCategories, computedSpentByCategory]);

  // Empty state
  if (!chartData.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-48', className)}>
        <span className="text-neutral-500 dark:text-neutral-400 text-sm mb-2">
          No budgets found for this period.
        </span>
      </div>
    );
  }

  // Max value for Y axis
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.budgeted, d.spent)),
    100
  );

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 24, right: 24, left: 24, bottom: 32 }}
          barGap={8}
          barCategoryGap={24}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="categoryName"
            tick={{ fontSize: 13, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 13, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            domain={[0, Math.ceil(maxValue * 1.1)]}
            tickFormatter={(v) => formatCurrency(v, appCurrency)}
          />
          <Tooltip
            content={
              <CustomTooltip currency={appCurrency} />
            }
            wrapperStyle={{ zIndex: 40 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            height={36}
            wrapperStyle={{ fontSize: 14, color: '#334155' }}
          />
          <Bar
            dataKey="budgeted"
            name="Budgeted"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
            className="animate-slideUp"
          >
            <LabelList
              dataKey="budgeted"
              position="top"
              formatter={(v: number) => formatCurrency(v, appCurrency)}
              style={{ fontSize: 12, fill: '#3B82F6', fontWeight: 500 }}
            />
          </Bar>
          <Bar
            dataKey="spent"
            name="Spent"
            fill="#F59E42"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
            className="animate-slideUp"
          >
            <LabelList
              dataKey="spent"
              position="top"
              formatter={(v: number) => formatCurrency(v, appCurrency)}
              style={{ fontSize: 12, fill: '#F59E42', fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetComparisonChart;