import React from 'react';
import useChartData from 'src/hooks/useChartData';
import useDashboardStats from 'src/hooks/useDashboardStats';
import useBudgetProgress from 'src/hooks/useBudgetProgress';
import useCurrency from 'src/hooks/useCurrency';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { cn } from 'src/lib/utils';
import { formatDate } from 'src/lib/formatters';
import { DATE_RANGE_PRESETS } from 'src/lib/constants';
import { DonutChartDatum, AreaChartDatum, BarChartDatum } from 'src/hooks/useChartData';
import { BudgetProgress } from 'src/hooks/useBudgetProgress';
import { AnimatedNumber } from 'src/components/ui/AnimatedNumber';
import { CurrencyDisplay } from 'src/components/ui/CurrencyDisplay';
import { DateDisplay } from 'src/components/ui/DateDisplay';
import { PercentageBadge } from 'src/components/ui/PercentageBadge';
import { ProgressBar } from 'src/components/ui/ProgressBar';
import { Card } from 'src/components/ui/Card';
import { Badge } from 'src/components/ui/Badge';
import { EmptyState } from 'src/components/ui/EmptyState';
import { Input } from 'src/components/ui/Input';
import { Select } from 'src/components/ui/Select';
import { Tooltip } from 'src/components/ui/Tooltip';
import { Skeleton } from 'src/components/ui/Skeleton';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { Info, BarChart2, PieChart as PieIcon, TrendingUp, CalendarDays } from 'lucide-react';

/************************************************************
 * AnalyticsPage.tsx
 * Vault - Analytics and reports page.
 * - Renders dashboard KPIs, donut (pie), area, and bar charts.
 * - Shows budget progress, top categories, and summary tables.
 * - Fully responsive and accessible.
 ************************************************************/

const CHART_HEIGHT = 320;
const COLORS = [
  '#3B82F6', '#F472B6', '#A78BFA', '#F59E42', '#22C55E', '#FACC15', '#38BDF8', '#64748B', '#EF4444', '#FDE68A', '#4ADE80',
];

function AnalyticsPage() {
  // UI filters
  const filterDateRange = useUIStore((state) => state.filterDateRange);
  const setFilterDatePreset = useUIStore((state) => state.setFilterDatePreset);
  const filterDatePreset = useUIStore((state) => state.filterDatePreset);

  // Currency info
  const { format: formatCurrency, symbol } = useCurrency();

  // Chart and KPI data
  const { donutData, areaData, barData } = useChartData();
  const dashboardStats = useDashboardStats();
  const { perBudget, overall } = useBudgetProgress();

  // Finance data
  const categories = useFinanceStore((state) => state.categories);

  // Loading state (simulate for demo, or if data is empty)
  const loading =
    !donutData ||
    !areaData ||
    !barData ||
    !dashboardStats ||
    !perBudget ||
    !overall;

  // Empty state
  const isEmpty =
    donutData.length === 0 &&
    areaData.length === 0 &&
    barData.length === 0;

  // Top expense category
  const topCategory =
    dashboardStats.topExpenseCategoryId &&
    categories.find((cat) => cat.id === dashboardStats.topExpenseCategoryId);

  // Handle date preset change
  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterDatePreset(e.target.value as typeof filterDatePreset);
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-heading font-bold text-brand-dark dark:text-brand-light">
          <BarChart2 className="inline-block mr-2 text-brand" size={28} />
          Analytics & Reports
        </h1>
        <div className="flex items-center gap-2">
          <Select
            value={filterDatePreset}
            onChange={handlePresetChange}
            aria-label="Date Range Preset"
          >
            {DATE_RANGE_PRESETS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </Select>
          <Tooltip content="Select date range for analytics">
            <CalendarDays className="text-neutral-400" size={20} />
          </Tooltip>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="flex flex-col items-center justify-center p-6">
          <span className="text-sm font-medium text-neutral-500 mb-1">Total Income</span>
          <AnimatedNumber
            value={dashboardStats.totalIncome}
            format={formatCurrency}
            className="text-2xl font-bold text-success"
          />
          <CurrencyDisplay value={dashboardStats.totalIncome} className="mt-1 text-success" />
        </Card>
        <Card className="flex flex-col items-center justify-center p-6">
          <span className="text-sm font-medium text-neutral-500 mb-1">Total Expense</span>
          <AnimatedNumber
            value={dashboardStats.totalExpense}
            format={formatCurrency}
            className="text-2xl font-bold text-error"
          />
          <CurrencyDisplay value={dashboardStats.totalExpense} className="mt-1 text-error" />
        </Card>
        <Card className="flex flex-col items-center justify-center p-6">
          <span className="text-sm font-medium text-neutral-500 mb-1">Net Balance</span>
          <AnimatedNumber
            value={dashboardStats.netBalance}
            format={formatCurrency}
            className={cn(
              'text-2xl font-bold',
              dashboardStats.netBalance >= 0 ? 'text-success' : 'text-error'
            )}
          />
          <CurrencyDisplay
            value={dashboardStats.netBalance}
            className={cn(
              'mt-1',
              dashboardStats.netBalance >= 0 ? 'text-success' : 'text-error'
            )}
          />
        </Card>
        <Card className="flex flex-col items-center justify-center p-6">
          <span className="text-sm font-medium text-neutral-500 mb-1">Transactions</span>
          <AnimatedNumber
            value={dashboardStats.transactionCount}
            format={(v) => v.toLocaleString()}
            className="text-2xl font-bold text-brand"
          />
          <span className="mt-1 text-xs text-neutral-400">in selected range</span>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Donut/Pie Chart: Expense breakdown by category */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <PieIcon className="text-brand mr-2" size={22} />
            <span className="font-semibold text-lg">Expense Breakdown</span>
            <Tooltip content="Shows expenses by category">
              <Info className="ml-2 text-neutral-400" size={18} />
            </Tooltip>
          </div>
          {loading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : donutData.length === 0 ? (
            <EmptyState
              title="No Expenses"
              description="Add transactions to see expense breakdown."
            />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {donutData.map((entry, idx) => (
                    <Cell key={entry.categoryId} fill={entry.color || COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number, name: string, props: any) =>
                    [`${formatCurrency(value)}`, name]
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            {donutData.map((entry, idx) => (
              <Badge
                key={entry.categoryId}
                color={entry.color || COLORS[idx % COLORS.length]}
                icon={entry.icon}
                className="mr-2"
              >
                {entry.name}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Area Chart: Expense/Income over time */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-brand mr-2" size={22} />
            <span className="font-semibold text-lg">Expense & Income Over Time</span>
            <Tooltip content="Shows expense and income trends">
              <Info className="ml-2 text-neutral-400" size={18} />
            </Tooltip>
          </div>
          {loading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : areaData.length === 0 ? (
            <EmptyState
              title="No Data"
              description="Add transactions to see trends over time."
            />
          ) : (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label, 'MMM d, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  fill="#F87171"
                  name="Expense"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22C55E"
                  fill="#4ADE80"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#3B82F6"
                  fill="#60A5FA"
                  name="Net"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Bar Chart: Expense/Income by category */}
      <Card className="p-6 mb-12">
        <div className="flex items-center mb-4">
          <BarChart2 className="text-brand mr-2" size={22} />
          <span className="font-semibold text-lg">Expense & Income by Category</span>
          <Tooltip content="Shows breakdown by category">
            <Info className="ml-2 text-neutral-400" size={18} />
          </Tooltip>
        </div>
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : barData.length === 0 ? (
          <EmptyState
            title="No Data"
            description="Add transactions to see category breakdown."
          />
        ) : (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} />
              <Legend />
              <RechartsTooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="expense" fill="#EF4444" name="Expense" />
              <Bar dataKey="income" fill="#22C55E" name="Income" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Budget Progress */}
      <Card className="p-6 mb-12">
        <div className="flex items-center mb-4">
          <PieIcon className="text-brand mr-2" size={22} />
          <span className="font-semibold text-lg">Budget Progress</span>
          <Tooltip content="Shows progress for each budget">
            <Info className="ml-2 text-neutral-400" size={18} />
          </Tooltip>
        </div>
        {loading ? (
          <Skeleton className="h-[120px] w-full" />
        ) : perBudget.length === 0 ? (
          <EmptyState
            title="No Budgets"
            description="Create budgets to track your spending."
          />
        ) : (
          <div className="space-y-4">
            {perBudget.map((bp) => (
              <div key={bp.budget.id} className="flex items-center gap-4">
                <Badge
                  color={bp.category?.color}
                  icon={bp.category?.icon}
                  className="min-w-[80px]"
                >
                  {bp.category?.name || 'Category'}
                </Badge>
                <ProgressBar
                  value={bp.percent}
                  color={bp.category?.color}
                  className="flex-1"
                  aria-label={`Budget progress for ${bp.category?.name}`}
                />
                <span className="text-xs text-neutral-500 ml-2">
                  {formatCurrency(bp.spent)} / {formatCurrency(bp.budget.amount)}
                </span>
                <PercentageBadge
                  value={bp.percent}
                  className={cn(
                    'ml-2',
                    bp.percent > 100 ? 'bg-error text-white' : 'bg-success text-white'
                  )}
                />
              </div>
            ))}
          </div>
        )}
        {/* Overall budget summary */}
        {!loading && perBudget.length > 0 && (
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-500">Overall:</span>
            <ProgressBar
              value={overall.percentUsed}
              color="brand"
              className="flex-1"
              aria-label="Overall budget progress"
            />
            <span className="text-xs text-neutral-500 ml-2">
              {formatCurrency(overall.totalSpent)} / {formatCurrency(overall.totalBudgeted)}
            </span>
            <PercentageBadge
              value={overall.percentUsed}
              className={cn(
                'ml-2',
                overall.percentUsed > 100 ? 'bg-error text-white' : 'bg-brand text-white'
              )}
            />
          </div>
        )}
      </Card>

      {/* Top Expense Category */}
      <Card className="p-6 mb-12">
        <div className="flex items-center mb-4">
          <PieIcon className="text-brand mr-2" size={22} />
          <span className="font-semibold text-lg">Top Expense Category</span>
          <Tooltip content="Category with highest expense in selected range">
            <Info className="ml-2 text-neutral-400" size={18} />
          </Tooltip>
        </div>
        {loading ? (
          <Skeleton className="h-[60px] w-full" />
        ) : !topCategory ? (
          <EmptyState
            title="No Expenses"
            description="Add transactions to see top expense category."
          />
        ) : (
          <div className="flex items-center gap-4">
            <Badge
              color={topCategory.color}
              icon={topCategory.icon}
              className="min-w-[80px]"
            >
              {topCategory.name}
            </Badge>
            <span className="text-lg font-bold text-error">
              {formatCurrency(
                donutData.find((d) => d.categoryId === topCategory.id)?.value || 0
              )}
            </span>
            <span className="text-xs text-neutral-500 ml-2">
              in {filterDateRange.startDate} - {filterDateRange.endDate}
            </span>
          </div>
        )}
      </Card>

      {/* Summary Table: Expense by Category */}
      <Card className="p-6 mb-12">
        <div className="flex items-center mb-4">
          <PieIcon className="text-brand mr-2" size={22} />
          <span className="font-semibold text-lg">Expense Summary Table</span>
          <Tooltip content="Detailed expense breakdown by category">
            <Info className="ml-2 text-neutral-400" size={18} />
          </Tooltip>
        </div>
        {loading ? (
          <Skeleton className="h-[120px] w-full" />
        ) : donutData.length === 0 ? (
          <EmptyState
            title="No Expenses"
            description="Add transactions to see summary table."
          />
        ) : (
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="text-left text-neutral-500 font-medium">Category</th>
                <th className="text-right text-neutral-500 font-medium">Amount</th>
                <th className="text-right text-neutral-500 font-medium">Percent</th>
              </tr>
            </thead>
            <tbody>
              {donutData.map((entry, idx) => {
                const total = dashboardStats.totalExpense;
                const percent = total > 0 ? (entry.value / total) * 100 : 0;
                return (
                  <tr key={entry.categoryId}>
                    <td className="flex items-center gap-2 py-1">
                      <Badge
                        color={entry.color || COLORS[idx % COLORS.length]}
                        icon={entry.icon}
                        className="min-w-[80px]"
                      >
                        {entry.name}
                      </Badge>
                    </td>
                    <td className="text-right py-1 font-mono font-semibold text-error">
                      {formatCurrency(entry.value)}
                    </td>
                    <td className="text-right py-1">
                      <PercentageBadge value={percent} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default AnalyticsPage;