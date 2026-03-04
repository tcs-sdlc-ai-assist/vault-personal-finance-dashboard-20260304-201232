import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useTheme } from '@emotion/react'; // If theme is used, otherwise remove
import useChartData, { AreaChartDatum } from 'src/hooks/useChartData';
import { useCurrency } from 'src/hooks/useCurrency';
import { cn } from 'src/lib/utils';
import { formatDate } from 'src/lib/formatters';

/************************************************************
 * SpendingTrendChart.tsx
 * Vault - Area chart for daily spending trend analytics.
 * - Animated, responsive, accessible.
 * - Uses Recharts for visualization.
 * - Shows expense, income, and net balance over time.
 ************************************************************/

/**
 * SpendingTrendChartProps
 * - Optionally accepts a dateRange override.
 */
interface SpendingTrendChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
    preset?: string;
  };
  className?: string;
  height?: number;
}

/**
 * CustomTooltip - Accessible tooltip for Recharts AreaChart.
 */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  currencyFormat: (amount: number) => string;
}> = ({ active, payload, label, currencyFormat }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="glass rounded-lg shadow-glass px-4 py-2 text-sm"
      role="tooltip"
      aria-live="polite"
      aria-label={`Spending trend details for ${formatDate(label, 'MMM d, yyyy')}`}
    >
      <div className="font-heading font-bold mb-1">{formatDate(label, 'MMM d, yyyy')}</div>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-block w-3 h-3 rounded-full',
                entry.dataKey === 'expense'
                  ? 'bg-error'
                  : entry.dataKey === 'income'
                  ? 'bg-success'
                  : 'bg-brand'
              )}
              aria-hidden="true"
            />
            <span className="capitalize">{entry.dataKey}</span>
            <span className="ml-auto font-mono">
              {currencyFormat(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * SpendingTrendChart
 * - Area chart for daily spending trend.
 * - Animated, responsive, accessible.
 */
const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  dateRange,
  className,
  height = 320,
}) => {
  // Chart data (filtered by dateRange if provided)
  const { areaData } = useChartData(dateRange);

  // Currency formatter (uses app default)
  const { format: currencyFormat } = useCurrency();

  // Accessibility: aria-label for chart
  const ariaLabel =
    'Spending trend area chart showing daily expense, income, and net balance';

  // If no data, show empty state
  if (!areaData || areaData.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-[200px] bg-neutral-100 rounded-lg text-neutral-500',
          className
        )}
        aria-label="No spending trend data available"
        role="presentation"
      >
        No spending trend data available.
      </div>
    );
  }

  return (
    <div
      className={cn('w-full', className)}
      aria-label={ariaLabel}
      role="region"
      tabIndex={0}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={areaData}
          margin={{ top: 24, right: 24, left: 0, bottom: 24 }}
        >
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 2" stroke="#CBD5E1" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDate(date, 'MMM d')}
            fontSize={12}
            stroke="#64748B"
            axisLine={false}
            tickLine={false}
            minTickGap={12}
          />
          <YAxis
            tickFormatter={currencyFormat}
            fontSize={12}
            stroke="#64748B"
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={
              <CustomTooltip currencyFormat={currencyFormat} />
            }
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            height={36}
            wrapperStyle={{ fontSize: 13, fontFamily: 'Montserrat, Inter, sans-serif' }}
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#EF4444"
            fill="url(#expenseGradient)"
            strokeWidth={2}
            dot={{ r: 2 }}
            isAnimationActive={true}
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#22C55E"
            fill="url(#incomeGradient)"
            strokeWidth={2}
            dot={{ r: 2 }}
            isAnimationActive={true}
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="net"
            name="Net"
            stroke="#3B82F6"
            fill="url(#netGradient)"
            strokeWidth={2}
            dot={{ r: 2 }}
            isAnimationActive={true}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingTrendChart;