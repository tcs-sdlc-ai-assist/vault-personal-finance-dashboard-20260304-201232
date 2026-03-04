import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'react-transition-group';
import { useChartData, DonutChartDatum } from 'src/hooks/useChartData';
import { useCurrency } from 'src/hooks/useCurrency';
import { cn } from 'src/lib/utils';
import { CATEGORY_ICON_MAP } from 'src/lib/constants';
import { formatCurrency } from 'src/lib/formatters';
import { Tooltip as UiTooltip } from 'src/components/ui/Tooltip';
import { Badge } from 'src/components/ui/Badge';
import { AnimatedNumber } from 'src/components/ui/AnimatedNumber';
import { EmptyState } from 'src/components/ui/EmptyState';
import { LucideIcon, createElement } from 'lucide-react';

/************************************************************
 * SpendingByCategoryChart.tsx
 * Vault - Donut chart for spending by category (expense breakdown).
 * - Uses Recharts PieChart for animated, interactive donut.
 * - Accessible, responsive, and supports tooltips and legends.
 * - Shows category color, icon, and amount.
 ************************************************************/

/**
 * SpendingByCategoryChartProps
 * - Optional: dateRange override, currency code, height, className.
 */
export interface SpendingByCategoryChartProps {
  dateRange?: Parameters<typeof useChartData>[0];
  currencyCode?: string;
  height?: number | string;
  className?: string;
}

/**
 * SpendingByCategoryChart
 * - Renders a donut chart of spending by category.
 * - Animated, interactive, accessible.
 */
const SpendingByCategoryChart: React.FC<SpendingByCategoryChartProps> = ({
  dateRange,
  currencyCode,
  height = 320,
  className,
}) => {
  // Chart data: donutData = [{ categoryId, name, value, color, icon }]
  const { donutData } = useChartData(dateRange);

  // Currency formatting
  const { format } = useCurrency(currencyCode);

  // Total spent (sum of all donut values)
  const totalSpent = donutData.reduce((sum, d) => sum + d.value, 0);

  // Accessibility: ARIA labels
  const chartLabel = 'Spending by Category Donut Chart';

  // Edge case: no data
  if (!donutData.length || totalSpent === 0) {
    return (
      <EmptyState
        title="No Spending Data"
        description="You have no expenses in this period. Add transactions to see your spending breakdown."
        className={cn('w-full', className)}
      />
    );
  }

  // Legend: show category color, icon, name, amount, percent
  const renderLegend = () => (
    <ul className="flex flex-wrap gap-2 mt-4 justify-center" aria-label="Category Legend">
      {donutData.map((d) => {
        const percent = totalSpent > 0 ? (d.value / totalSpent) * 100 : 0;
        // Icon: lucide-react
        let Icon: LucideIcon | undefined;
        if (d.icon && typeof d.icon === 'string' && CATEGORY_ICON_MAP[d.categoryId]) {
          try {
            Icon = require('lucide-react')[d.icon];
          } catch {
            Icon = undefined;
          }
        }
        return (
          <li
            key={d.categoryId}
            className="flex items-center gap-2 px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800"
            style={{ borderLeft: `4px solid ${d.color}` }}
            aria-label={`${d.name}: ${format(d.value)} (${percent.toFixed(1)}%)`}
          >
            {Icon && (
              <span className="mr-1 text-[18px]" aria-hidden="true">
                {createElement(Icon, { color: d.color, size: 18 })}
              </span>
            )}
            <span className="font-medium">{d.name}</span>
            <Badge
              color={d.color}
              className="ml-2"
              aria-label={`Spent: ${format(d.value)}`}
            >
              <AnimatedNumber value={d.value} format={format} />
            </Badge>
            <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
              {percent.toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );

  // Custom tooltip for Recharts
  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const d: DonutChartDatum = payload[0].payload;
      const percent = totalSpent > 0 ? (d.value / totalSpent) * 100 : 0;
      return (
        <UiTooltip
          open
          content={
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{d.name}</span>
              <span>
                {format(d.value)} ({percent.toFixed(1)}%)
              </span>
            </div>
          }
        />
      );
    }
    return null;
  };

  // Pie chart ARIA: role="img", aria-label
  return (
    <div
      className={cn('w-full flex flex-col items-center', className)}
      role="region"
      aria-label={chartLabel}
      tabIndex={0}
    >
      <div className="font-heading text-lg font-bold mb-2 text-center">
        Spending by Category
      </div>
      <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 text-center">
        Total Spent:{' '}
        <span className="font-semibold text-brand">
          <AnimatedNumber value={totalSpent} format={format} />
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={donutData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
            isAnimationActive
            aria-label={chartLabel}
          >
            {donutData.map((entry, idx) => (
              <Cell
                key={`cell-${entry.categoryId}`}
                fill={entry.color}
                aria-label={`${entry.name}: ${format(entry.value)}`}
                tabIndex={0}
              />
            ))}
          </Pie>
          <RechartsTooltip
            content={renderTooltip}
            wrapperStyle={{ zIndex: 40 }}
            cursor={{ fill: 'rgba(59,130,246,0.08)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {renderLegend()}
    </div>
  );
};

export default SpendingByCategoryChart;