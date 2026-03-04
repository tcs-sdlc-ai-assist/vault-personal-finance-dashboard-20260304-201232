import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useChartData } from 'src/hooks/useChartData';
import { useCurrency } from 'src/hooks/useCurrency';
import { cn } from 'src/lib/utils';
import { CATEGORY_COLOR_MAP } from 'src/lib/constants';
import { formatCurrency } from 'src/lib/formatters';
import { Category } from 'src/types/index';
import { Badge } from 'src/components/ui/Badge';
import { Skeleton } from 'src/components/ui/Skeleton';

/************************************************************
 * TopCategoriesChart.tsx
 * Vault - Horizontal bar chart for top spending categories.
 * - Uses Recharts BarChart for analytics page.
 * - Shows top N categories by expense (descending).
 * - Responsive, accessible, and styled with theme colors.
 ************************************************************/

/**
 * Props for TopCategoriesChart
 * @param maxCategories Maximum number of categories to display (default: 8)
 * @param height Chart height (default: 320)
 * @param showLegend Whether to show category legend (default: true)
 * @param dateRange Optional date range override for filtering
 */
export interface TopCategoriesChartProps {
  maxCategories?: number;
  height?: number;
  showLegend?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
    preset?: string;
  };
  className?: string;
}

/**
 * Horizontal bar chart for top spending categories.
 * - Shows expense per category, descending.
 * - Uses category color, icon, and name.
 * - Responsive and accessible.
 */
const TopCategoriesChart: React.FC<TopCategoriesChartProps> = ({
  maxCategories = 8,
  height = 320,
  showLegend = true,
  dateRange,
  className,
}) => {
  // Chart data: expense breakdown by category
  const { barData } = useChartData(dateRange);

  // Currency formatter
  const { format: currencyFormat } = useCurrency();

  // Filter: only categories with expense > 0, sort descending
  const topCategories = React.useMemo(() => {
    return barData
      .filter((d) => d.expense > 0)
      .sort((a, b) => b.expense - a.expense)
      .slice(0, maxCategories);
  }, [barData, maxCategories]);

  // Loading state (show skeleton if no data yet)
  if (!barData || barData.length === 0) {
    return <Skeleton className={cn('h-[', height, 'px] w-full rounded-lg')} />;
  }

  // Accessible chart title
  const chartTitle = 'Top Spending Categories';

  return (
    <div className={cn('w-full bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4', className)}>
      <div className="flex items-center mb-2">
        <span className="font-heading text-lg font-bold text-neutral-700 dark:text-neutral-100" id="top-categories-chart-title">
          {chartTitle}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={topCategories}
          layout="vertical"
          aria-label={chartTitle}
          role="img"
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tickFormatter={currencyFormat}
            fontSize={14}
            stroke="#64748B"
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            fontSize={14}
            stroke="#64748B"
            width={120}
            tick={({ x, y, payload }) => {
              // Custom Y-axis tick: icon + name
              const category = topCategories.find((c) => c.name === payload.value);
              return (
                <g transform={`translate(${x},${y})`}>
                  {category?.icon && (
                    <foreignObject x={-32} y={-12} width={24} height={24}>
                      <Badge
                        icon={category.icon}
                        color={category.color}
                        size="sm"
                        aria-label={category.name}
                      />
                    </foreignObject>
                  )}
                  <text
                    x={0}
                    y={0}
                    dy={6}
                    fill="#334155"
                    fontWeight={600}
                    fontSize={14}
                    aria-label={category?.name}
                  >
                    {payload.value}
                  </text>
                </g>
              );
            }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) =>
              [currencyFormat(value), name]
            }
            contentStyle={{
              background: 'var(--color-glass)',
              borderRadius: 12,
              boxShadow: '0 4px 32px 0 rgba(16, 24, 40, 0.12)',
              color: '#334155',
              fontWeight: 500,
              fontSize: 14,
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
          />
          <Bar
            dataKey="expense"
            radius={[0, 20, 20, 0]}
            minPointSize={4}
            isAnimationActive={true}
            aria-label="Expense"
          >
            {topCategories.map((entry, idx) => (
              <Cell
                key={`cell-${entry.categoryId}`}
                fill={CATEGORY_COLOR_MAP[entry.categoryId] || entry.color || '#3B82F6'}
                aria-label={entry.name}
              />
            ))}
            <LabelList
              dataKey="expense"
              position="right"
              formatter={(value: number) => currencyFormat(value)}
              style={{
                fontWeight: 600,
                fontSize: 14,
                fill: '#334155',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-2">
          {topCategories.map((cat) => (
            <Badge
              key={cat.categoryId}
              icon={cat.icon}
              color={cat.color}
              label={cat.name}
              className="mr-2"
              aria-label={cat.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopCategoriesChart;