import React, { useMemo } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Transaction, DateRange } from 'src/types/index';
import { filterTransactionsByDateRange } from 'src/lib/calculations';
import { formatCurrency } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

/************************************************************
 * DayOfWeekChart.tsx
 * Vault - Bar/Radar chart for average spending by weekday.
 * - Visualizes average expense per weekday (Mon-Sun).
 * - Used in analytics page for behavioral insights.
 * - Supports bar and radar chart modes.
 ************************************************************/

// Weekday labels (Monday-first, ISO standard)
const WEEKDAYS = [
  { key: 1, label: 'Mon' },
  { key: 2, label: 'Tue' },
  { key: 3, label: 'Wed' },
  { key: 4, label: 'Thu' },
  { key: 5, label: 'Fri' },
  { key: 6, label: 'Sat' },
  { key: 0, label: 'Sun' }, // Sunday as 0 for JS Date
];

// Utility: get weekday (0=Sun, 1=Mon, ..., 6=Sat)
function getWeekday(dateStr: string): number {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return -1;
  return date.getDay();
}

// Chart color palette (matches brand/accent)
const CHART_COLORS = [
  '#3B82F6', // brand blue
  '#F472B6', // accent pink
  '#A78BFA', // bills purple
  '#F59E42', // groceries orange
  '#22C55E', // health green
  '#FACC15', // savings yellow
  '#38BDF8', // travel sky
];

// ---------- Chart Data Transformation ----------

interface DayOfWeekDatum {
  weekday: string; // 'Mon', 'Tue', etc.
  avgExpense: number;
  totalExpense: number;
  count: number;
  color: string;
}

function computeDayOfWeekData(
  transactions: Transaction[],
  dateRange: DateRange,
  currency: string
): DayOfWeekDatum[] {
  // Filter for expense transactions in date range
  const filtered = filterTransactionsByDateRange(
    transactions.filter((tx) => tx.type === 'expense'),
    dateRange
  );

  // Group by weekday
  const sums: Record<number, { total: number; count: number }> = {};
  for (const tx of filtered) {
    const wd = getWeekday(tx.date);
    if (wd === -1) continue;
    if (!sums[wd]) sums[wd] = { total: 0, count: 0 };
    sums[wd].total += Math.abs(tx.amount);
    sums[wd].count += 1;
  }

  // Build data array (Monday-first)
  return WEEKDAYS.map((wd, idx) => {
    const sum = sums[wd.key] || { total: 0, count: 0 };
    return {
      weekday: wd.label,
      avgExpense: sum.count > 0 ? sum.total / sum.count : 0,
      totalExpense: sum.total,
      count: sum.count,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    };
  });
}

// ---------- Tooltip Component ----------

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, currency }) => {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  return (
    <div className="glass p-2 rounded shadow-md border border-neutral-200 dark:border-neutral-700">
      <div className="font-heading text-sm mb-1">{label}</div>
      <div className="text-xs text-neutral-500">
        <span>Avg: </span>
        <span className="font-semibold">{formatCurrency(datum.avgExpense, currency)}</span>
      </div>
      <div className="text-xs text-neutral-500">
        <span>Total: </span>
        <span className="font-semibold">{formatCurrency(datum.totalExpense, currency)}</span>
      </div>
      <div className="text-xs text-neutral-500">
        <span>Count: </span>
        <span className="font-semibold">{datum.count}</span>
      </div>
    </div>
  );
};

// ---------- Main Chart Component ----------

export interface DayOfWeekChartProps {
  mode?: 'bar' | 'radar'; // Chart mode
  dateRange?: DateRange;   // Optional override for date range
  className?: string;
  currency?: string;       // Optional override for currency code
}

const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({
  mode = 'bar',
  dateRange,
  className,
  currency,
}) => {
  // Finance data
  const transactions = useFinanceStore((state) => state.transactions);

  // UI filter date range (fallback)
  const filterDateRange = useUIStore((state) => state.filterDateRange);

  // Currency (fallback to USD)
  const resolvedCurrency = currency || 'USD';

  // Chart data
  const data = useMemo(
    () =>
      computeDayOfWeekData(
        transactions,
        dateRange || filterDateRange,
        resolvedCurrency
      ),
    [transactions, dateRange, filterDateRange, resolvedCurrency]
  );

  // Empty state
  const isEmpty = data.every((d) => d.count === 0);

  // Chart height
  const chartHeight = 320;

  return (
    <div className={cn('w-full max-w-xl mx-auto', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg">Average Spending by Weekday</h3>
        <span className="text-xs text-neutral-500">{mode === 'bar' ? 'Bar' : 'Radar'} Chart</span>
      </div>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <span className="mb-2">No expense data for selected range.</span>
          <span className="text-xs">Try adjusting your filters or add transactions.</span>
        </div>
      ) : mode === 'bar' ? (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            margin={{ top: 24, right: 24, left: 24, bottom: 24 }}
          >
            <XAxis
              dataKey="weekday"
              tick={{ fontSize: 14, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, resolvedCurrency)}
              tick={{ fontSize: 13, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip currency={resolvedCurrency} />}
            />
            <Bar
              dataKey="avgExpense"
              name="Avg Expense"
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            >
              {data.map((entry, idx) => (
                <cell
                  key={`cell-${idx}`}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <RadarChart
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={chartHeight / 2.2}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey="weekday"
              tick={{ fontSize: 14, fill: '#64748B' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, Math.max(...data.map((d) => d.avgExpense)) * 1.2 || 1]}
              tickFormatter={(v) => formatCurrency(v, resolvedCurrency)}
              tick={{ fontSize: 13, fill: '#64748B' }}
            />
            <Radar
              name="Avg Expense"
              dataKey="avgExpense"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.4}
              isAnimationActive={true}
            />
            <Tooltip
              content={<ChartTooltip currency={resolvedCurrency} />}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DayOfWeekChart;