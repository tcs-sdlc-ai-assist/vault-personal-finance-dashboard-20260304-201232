import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useChartData from 'src/hooks/useChartData';
import { useCurrency } from 'src/hooks/useCurrency';
import { CHART_COLORS } from 'src/lib/constants';
import { cn } from 'src/lib/utils';

/************************************************************
 * IncomeVsExpenseChart.tsx
 * Vault - Grouped bar chart for income vs. expense trends.
 * - Uses Recharts BarChart for visualizing income and expense over time.
 * - Used in analytics page.
 * - Fully responsive, accessible, and theme-aware.
 ************************************************************/

/**
 * Props for IncomeVsExpenseChart
 * - Optionally accepts a dateRange override for filtering.
 */
interface IncomeVsExpenseChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
    preset?: string;
  };
  className?: string;
  height?: number;
}

/**
 * Custom tooltip for grouped bar chart.
 */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  currencyFormat: (amount: number) => string;
}> = ({ active, payload, label, currencyFormat }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass p-3 rounded-lg shadow-glass border border-neutral-200 dark:border-neutral-700 min-w-[160px]">
      <div className="font-heading font-bold text-brand mb-1">{label}</div>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: entry.color }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
              {entry.dataKey === 'income' ? 'Income' : 'Expense'}:
            </span>
            <span className={cn(
              'ml-auto font-mono text-sm',
              entry.dataKey === 'income' ? 'text-success' : 'text-error'
            )}>
              {currencyFormat(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * IncomeVsExpenseChart
 * - Renders a grouped bar chart of income vs. expense over time.
 * - Responsive, accessible, and theme-aware.
 */
const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({
  dateRange,
  className,
  height = 320,
}) => {
  // Get chart data (areaData: [{ date, expense, income, net }])
  const { areaData } = useChartData(dateRange);

  // Currency formatter
  const { format: currencyFormat } = useCurrency();

  // Accessibility: chart title
  const chartTitle = 'Income vs. Expense Trends';

  // Colors
  const incomeColor = CHART_COLORS[4] || '#22C55E'; // green
  const expenseColor = CHART_COLORS[2] || '#EF4444'; // red

  // If no data, show empty state
  if (!areaData || areaData.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center h-[200px] text-neutral-400',
        className
      )}>
        <span className="text-lg font-heading mb-2">No data available</span>
        <span className="text-sm">Add transactions to see trends.</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full bg-glass rounded-lg shadow-glass p-4',
        className
      )}
      aria-label={chartTitle}
      role="region"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="font-heading text-lg text-brand">{chartTitle}</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={areaData}
          margin={{ top: 16, right: 24, left: 8, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            height={40}
          />
          <YAxis
            tickFormatter={currencyFormat}
            tick={{ fontSize: 12, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={
              <CustomTooltip currencyFormat={currencyFormat} />
            }
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill={incomeColor}
            radius={[4, 4, 0, 0]}
            minPointSize={2}
            maxBarSize={32}
            isAnimationActive={true}
            aria-label="Income"
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill={expenseColor}
            radius={[4, 4, 0, 0]}
            minPointSize={2}
            maxBarSize={32}
            isAnimationActive={true}
            aria-label="Expense"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeVsExpenseChart;