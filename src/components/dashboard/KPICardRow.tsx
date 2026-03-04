import React from 'react';
import { useDashboardStats } from 'src/hooks/useDashboardStats';
import { useCurrency } from 'src/hooks/useCurrency';
import { formatNumber } from 'src/lib/formatters';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import PercentageBadge from 'src/components/ui/PercentageBadge';
import Card from 'src/components/ui/Card';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import Badge from 'src/components/ui/Badge';
import { cn } from 'src/lib/utils';
import { LucideArrowUpRight, LucideArrowDownRight, LucideTrendingUp, LucideTrendingDown } from 'lucide-react';

/************************************************************
 * KPICardRow.tsx
 * Vault - Row of 4 KPI cards for dashboard top section.
 * - KPIs: Net Balance, Total Income, Total Expense, Largest Expense
 * - Staggered entrance animation for impressive dashboard feel.
 * - Responsive and accessible.
 ************************************************************/

/**
 * KPICardRow - Dashboard KPI card row.
 * - Shows Net Balance, Income, Expense, Largest Expense.
 * - Staggered fade-in/slide-up animation.
 */
const KPICardRow: React.FC = () => {
  // Dashboard KPIs
  const stats = useDashboardStats();
  const currency = useCurrency();

  // Animation delays (ms)
  const delays = [0, 80, 160, 240];

  // Card data
  const cards = [
    {
      key: 'netBalance',
      label: 'Net Balance',
      value: stats.netBalance,
      icon: stats.netBalance >= 0 ? <LucideTrendingUp className="text-success" /> : <LucideTrendingDown className="text-error" />,
      color: stats.netBalance >= 0 ? 'success' : 'error',
      description: 'Income minus expenses',
      badge: (
        <PercentageBadge
          value={
            stats.totalIncome + stats.totalExpense > 0
              ? stats.netBalance / (stats.totalIncome + stats.totalExpense)
              : 0
          }
          positive={stats.netBalance >= 0}
        />
      ),
    },
    {
      key: 'totalIncome',
      label: 'Total Income',
      value: stats.totalIncome,
      icon: <LucideArrowUpRight className="text-brand" />,
      color: 'brand',
      description: 'All income in period',
      badge: (
        <Badge color="brand" className="font-mono">
          {formatNumber(stats.averageIncome)} avg
        </Badge>
      ),
    },
    {
      key: 'totalExpense',
      label: 'Total Expense',
      value: stats.totalExpense,
      icon: <LucideArrowDownRight className="text-error" />,
      color: 'error',
      description: 'All expenses in period',
      badge: (
        <Badge color="error" className="font-mono">
          {formatNumber(stats.averageExpense)} avg
        </Badge>
      ),
    },
    {
      key: 'largestExpense',
      label: 'Largest Expense',
      value: stats.largestExpense ? stats.largestExpense.amount : 0,
      icon: <LucideTrendingDown className="text-error" />,
      color: 'error',
      description: stats.largestExpense
        ? stats.largestExpense.description || 'No description'
        : 'No expenses',
      badge: stats.largestExpense && stats.largestExpense.categoryId ? (
        <Badge color="error" className="font-mono">
          {stats.largestExpense.categoryId}
        </Badge>
      ) : null,
    },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg',
        'w-full mb-lg'
      )}
      role="region"
      aria-label="Dashboard KPIs"
    >
      {cards.map((card, idx) => (
        <Card
          key={card.key}
          className={cn(
            'flex flex-col items-start justify-between h-full min-h-[120px] p-lg',
            'fade-in slide-up',
            // Staggered animation delay
            `animate-delay-[${delays[idx]}ms]`
          )}
          style={{
            animationDelay: `${delays[idx]}ms`,
          }}
          aria-label={card.label}
        >
          <div className="flex items-center gap-md mb-sm">
            <span className={cn('text-xl', card.color === 'success' ? 'text-success' : card.color === 'error' ? 'text-error' : 'text-brand')}>
              {card.icon}
            </span>
            <span className="font-heading text-lg font-semibold">{card.label}</span>
            {card.badge && <span className="ml-auto">{card.badge}</span>}
          </div>
          <div className="flex items-baseline gap-xs mb-xs">
            <CurrencyDisplay
              amount={card.value}
              currency={currency.code}
              className={cn(
                'text-2xl font-bold',
                card.color === 'success' ? 'text-success' : card.color === 'error' ? 'text-error' : 'text-brand'
              )}
              animate
            />
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate w-full">
            {card.description}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KPICardRow;