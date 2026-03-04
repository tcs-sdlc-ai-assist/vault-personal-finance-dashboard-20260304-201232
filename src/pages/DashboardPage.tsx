import React from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import useDashboardStats from 'src/hooks/useDashboardStats';
import useChartData from 'src/hooks/useChartData';
import useBudgetProgress from 'src/hooks/useBudgetProgress';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { cn } from 'src/lib/utils';
import { formatCurrency, formatDate } from 'src/lib/formatters';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP } from 'src/lib/constants';

// UI components
import Card from 'src/components/ui/Card';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import PercentageBadge from 'src/components/ui/PercentageBadge';
import ProgressBar from 'src/components/ui/ProgressBar';
import Badge from 'src/components/ui/Badge';
import EmptyState from 'src/components/ui/EmptyState';
import Button from 'src/components/ui/Button';

// Chart components (Recharts)
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Icon library
import * as LucideIcons from 'lucide-react';

/************************************************************
 * DashboardPage.tsx
 * Vault - Dashboard overview route/page.
 * - Renders KPI cards, charts (donut, area, bar), recent transactions,
 *   budget widget, and hero background.
 * - Responsive and accessible.
 ************************************************************/

const MAX_RECENT_TX = 5;

function getIcon(name?: string) {
  if (!name) return null;
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon size={20} aria-hidden="true" /> : null;
}

/**
 * DashboardPage - Main dashboard overview.
 */
const DashboardPage: React.FC = () => {
  // Finance and UI state
  const categories = useFinanceStore((state) => state.categories);
  const transactions = useFinanceStore((state) => state.transactions);
  const budgets = useFinanceStore((state) => state.budgets);

  const filterDateRange = useUIStore((state) => state.filterDateRange);

  // KPIs, chart data, budget progress
  const stats = useDashboardStats();
  const chartData = useChartData();
  const budgetProgress = useBudgetProgress();

  // Responsive
  const { isMobile, isTablet, isDesktop } = useMediaQuery();

  // Recent transactions (sorted by date desc)
  const recentTx = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_RECENT_TX);

  // Hero background (gradient + noise overlay)
  // Use Tailwind utility classes and SVG noise
  const heroBgClass = cn(
    'relative w-full h-[220px] md:h-[320px] bg-gradient-blue-pink rounded-xl overflow-hidden mb-8',
    'shadow-xl glass'
  );

  // KPI card config
  const kpiCards = [
    {
      label: 'Net Balance',
      value: stats.netBalance,
      icon: <LucideIcons.Wallet size={24} aria-hidden="true" />,
      color: stats.netBalance >= 0 ? 'success' : 'error',
      tooltip: 'Total income minus total expenses for selected period.',
    },
    {
      label: 'Total Income',
      value: stats.totalIncome,
      icon: <LucideIcons.Coins size={24} aria-hidden="true" />,
      color: 'brand',
      tooltip: 'Sum of all income transactions.',
    },
    {
      label: 'Total Expenses',
      value: stats.totalExpense,
      icon: <LucideIcons.Receipt size={24} aria-hidden="true" />,
      color: 'error',
      tooltip: 'Sum of all expense transactions.',
    },
    {
      label: 'Transactions',
      value: stats.transactionCount,
      icon: <LucideIcons.ListChecks size={24} aria-hidden="true" />,
      color: 'neutral',
      tooltip: 'Number of transactions in selected period.',
    },
  ];

  // Budget widget config
  const overallBudget = budgetProgress.overall;
  const perBudget = budgetProgress.perBudget;

  // Top expense category
  const topCategory =
    stats.topExpenseCategoryId &&
    categories.find((cat) => cat.id === stats.topExpenseCategoryId);

  // Accessibility: page landmark
  return (
    <main
      className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6"
      aria-label="Dashboard Overview"
    >
      {/* Hero background */}
      <section className={heroBgClass} aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-blue-pink opacity-60" />
        <img
          src="/noise.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col justify-center items-start h-full px-6 md:px-12 py-8">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white drop-shadow-lg mb-2">
            Welcome to Vault
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-sans mb-4">
            Your privacy-first personal finance dashboard.
          </p>
          <Button
            variant="accent"
            size="lg"
            className="mt-2"
            onClick={() => window.location.hash = '#/transactions'}
            aria-label="Add Transaction"
          >
            <LucideIcons.PlusCircle className="mr-2" />
            Add Transaction
          </Button>
        </div>
      </section>

      {/* KPI Cards */}
      <section
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8',
          'fade-in slide-up'
        )}
        aria-label="Dashboard KPIs"
      >
        {kpiCards.map((kpi, idx) => (
          <Card
            key={kpi.label}
            className={cn(
              'flex flex-col items-start justify-between p-4 h-full min-h-[120px]',
              'bg-white dark:bg-neutral-800 shadow-md rounded-lg'
            )}
            aria-label={kpi.label}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'rounded-full p-2',
                kpi.color === 'success' && 'bg-success/15 text-success',
                kpi.color === 'error' && 'bg-error/15 text-error',
                kpi.color === 'brand' && 'bg-brand/15 text-brand',
                kpi.color === 'neutral' && 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200'
              )}>
                {kpi.icon}
              </span>
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-300">{kpi.label}</span>
            </div>
            <AnimatedNumber
              value={kpi.value}
              format={kpi.label === 'Transactions'
                ? (v) => v.toLocaleString()
                : (v) => formatCurrency(v)}
              className={cn(
                'text-2xl md:text-3xl font-bold',
                kpi.color === 'success' && 'text-success',
                kpi.color === 'error' && 'text-error',
                kpi.color === 'brand' && 'text-brand',
                kpi.color === 'neutral' && 'text-neutral-700 dark:text-neutral-200'
              )}
            />
            {kpi.label === 'Net Balance' && (
              <PercentageBadge
                value={stats.totalIncome === 0 ? 0 : ((stats.netBalance / stats.totalIncome) * 100)}
                positive={stats.netBalance >= 0}
                className="mt-2"
              />
            )}
          </Card>
        ))}
      </section>

      {/* Charts Section */}
      <section
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8',
          'fade-in slide-up'
        )}
        aria-label="Dashboard Charts"
      >
        {/* Donut Chart: Expense breakdown by category */}
        <Card className="p-4 bg-white dark:bg-neutral-800 shadow-md rounded-lg flex flex-col h-full">
          <h2 className="text-lg font-heading font-bold mb-2">Expenses by Category</h2>
          {chartData.donutData.length === 0 ? (
            <EmptyState
              title="No Expenses"
              description="Add expense transactions to see category breakdown."
              icon="PieChart"
              className="mt-8"
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData.donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {chartData.donutData.map((entry, idx) => (
                    <Cell
                      key={`cell-${entry.categoryId}`}
                      fill={entry.color}
                      aria-label={entry.name}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number, name: string, props: any) =>
                    [formatCurrency(value), name]
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Area Chart: Expense/Income over time */}
        <Card className="p-4 bg-white dark:bg-neutral-800 shadow-md rounded-lg flex flex-col h-full">
          <h2 className="text-lg font-heading font-bold mb-2">Expense & Income Over Time</h2>
          {chartData.areaData.length === 0 ? (
            <EmptyState
              title="No Data"
              description="Add transactions to see time series analytics."
              icon="AreaChart"
              className="mt-8"
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData.areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
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
                  stroke="#3B82F6"
                  fill="#60A5FA"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#22C55E"
                  fill="#4ADE80"
                  name="Net"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      {/* Bar Chart: Expense/Income by category */}
      <section className={cn('mb-8', 'fade-in slide-up')} aria-label="Category Breakdown">
        <Card className="p-4 bg-white dark:bg-neutral-800 shadow-md rounded-lg">
          <h2 className="text-lg font-heading font-bold mb-2">Category Breakdown</h2>
          {chartData.barData.every((d) => d.expense === 0 && d.income === 0) ? (
            <EmptyState
              title="No Data"
              description="Add transactions to see category breakdown."
              icon="BarChart"
              className="mt-8"
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                <Bar dataKey="income" fill="#3B82F6" name="Income" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      {/* Budget Widget */}
      <section className={cn('mb-8', 'fade-in slide-up')} aria-label="Budget Progress">
        <Card className="p-4 bg-white dark:bg-neutral-800 shadow-md rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-heading font-bold">Budget Progress</h2>
            <Button
              variant="brand"
              size="sm"
              onClick={() => window.location.hash = '#/budgets'}
              aria-label="View Budgets"
            >
              <LucideIcons.BarChart2 className="mr-1" />
              View Budgets
            </Button>
          </div>
          {perBudget.length === 0 ? (
            <EmptyState
              title="No Budgets"
              description="Create a budget to track your spending."
              icon="PiggyBank"
              className="mt-8"
            />
          ) : (
            <div>
              {/* Overall progress */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-neutral-600 dark:text-neutral-200">Overall</span>
                  <ProgressBar
                    value={overallBudget.percentUsed}
                    color={overallBudget.percentUsed < 80 ? 'brand' : 'error'}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-neutral-500 dark:text-neutral-300">
                    {overallBudget.percentUsed.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-mono text-neutral-500 dark:text-neutral-300">
                  <span>
                    Spent: <CurrencyDisplay value={overallBudget.totalSpent} />
                  </span>
                  <span>
                    Remaining: <CurrencyDisplay value={overallBudget.totalRemaining} />
                  </span>
                  <span>
                    Budgeted: <CurrencyDisplay value={overallBudget.totalBudgeted} />
                  </span>
                </div>
              </div>
              {/* Per-budget progress */}
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {perBudget.map((bp) => (
                  <li key={bp.budget.id} className="py-2 flex items-center gap-3">
                    <Badge
                      color={bp.category?.color || 'brand'}
                      icon={getIcon(bp.category?.icon)}
                      className="mr-2"
                    >
                      {bp.category?.name || 'Category'}
                    </Badge>
                    <ProgressBar
                      value={bp.percent}
                      color={bp.percent < 80 ? 'brand' : 'error'}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono text-neutral-500 dark:text-neutral-300">
                      {bp.percent.toFixed(1)}%
                    </span>
                    <span className="text-sm font-mono text-neutral-500 dark:text-neutral-300">
                      <CurrencyDisplay value={bp.spent} />
                      {' / '}
                      <CurrencyDisplay value={bp.budget.amount} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </section>

      {/* Recent Transactions */}
      <section className={cn('mb-8', 'fade-in slide-up')} aria-label="Recent Transactions">
        <Card className="p-4 bg-white dark:bg-neutral-800 shadow-md rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-heading font-bold">Recent Transactions</h2>
            <Button
              variant="brand"
              size="sm"
              onClick={() => window.location.hash = '#/transactions'}
              aria-label="View All Transactions"
            >
              <LucideIcons.ListChecks className="mr-1" />
              View All
            </Button>
          </div>
          {recentTx.length === 0 ? (
            <EmptyState
              title="No Transactions"
              description="Add a transaction to get started."
              icon="PlusCircle"
              className="mt-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {recentTx.map((tx) => {
                const category = categories.find((cat) => cat.id === tx.categoryId);
                return (
                  <li
                    key={tx.id}
                    className="py-2 flex items-center gap-3"
                    aria-label={`Transaction ${tx.description || category?.name || tx.categoryId}`}
                  >
                    <Badge
                      color={category?.color || 'brand'}
                      icon={getIcon(category?.icon)}
                      className="mr-2"
                    >
                      {category?.name || 'Category'}
                    </Badge>
                    <span className="flex-1 text-sm font-sans text-neutral-700 dark:text-neutral-200 truncate">
                      {tx.description || category?.name || tx.categoryId}
                    </span>
                    <span className={cn(
                      'text-sm font-mono',
                      tx.type === 'expense' ? 'text-error' : 'text-success'
                    )}>
                      {tx.type === 'expense' ? '-' : '+'}
                      <CurrencyDisplay value={tx.amount} />
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-300 ml-2">
                      {formatDate(tx.date, 'MMM d')}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* Top Expense Category */}
      {topCategory && (
        <section className={cn('mb-8', 'fade-in slide-up')} aria-label="Top Expense Category">
          <Card className="p-4 bg-white dark:bg-neutral-800 shadow-md rounded-lg flex items-center gap-4">
            <Badge
              color={topCategory.color}
              icon={getIcon(topCategory.icon)}
              className="mr-2"
            >
              Top Expense: {topCategory.name}
            </Badge>
            <span className="text-lg font-mono text-error font-bold">
              <CurrencyDisplay value={
                chartData.donutData.find((d) => d.categoryId === topCategory.id)?.value || 0
              } />
            </span>
          </Card>
        </section>
      )}
    </main>
  );
};

export default DashboardPage;