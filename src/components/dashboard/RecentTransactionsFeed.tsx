import React from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Transaction, Category } from 'src/types/index';
import { formatDate, formatCurrency } from 'src/lib/formatters';
import { groupTransactionsByDate } from 'src/lib/calculations';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP } from 'src/lib/constants';
import { cn } from 'src/lib/utils';
import { Scroll } from 'lucide-react';
import Skeleton from 'src/components/ui/Skeleton';
import Badge from 'src/components/ui/Badge';
import Card from 'src/components/ui/Card';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import DateDisplay from 'src/components/ui/DateDisplay';
import EmptyState from 'src/components/ui/EmptyState';

/************************************************************
 * RecentTransactionsFeed.tsx
 * Vault - Dashboard component: Feed of recent transactions, grouped by date.
 * - Shows up to N most recent days (default: 7), each with transactions.
 * - Used in dashboard lower section for quick overview.
 * - Responsive, accessible, animated.
 ************************************************************/

interface RecentTransactionsFeedProps {
  days?: number; // Number of days to show (default: 7)
  maxPerDay?: number; // Max transactions per day (default: 5)
  className?: string;
}

/**
 * RecentTransactionsFeed
 * - Displays a feed of recent transactions, grouped by date.
 * - Each group shows date header and transactions.
 * - Shows loading skeleton if data is loading.
 * - Shows empty state if no transactions.
 */
const RecentTransactionsFeed: React.FC<RecentTransactionsFeedProps> = ({
  days = 7,
  maxPerDay = 5,
  className,
}) => {
  // Finance data
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  // UI filter date range (for dashboard context)
  const filterDateRange = useUIStore((state) => state.filterDateRange);

  // Loading state (simulate for dashboard skeleton)
  // In Vault, client-side only, so loading is rare, but can be shown for suspense
  const isLoading = false; // Could be replaced with Suspense fallback

  // Group transactions by date (YYYY-MM-DD)
  const grouped = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return {};
    // Sort transactions by date descending
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    // Group by date
    const byDate = groupTransactionsByDate(sorted);
    // Get sorted dates (descending)
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
    // Limit to recent N days
    const limitedDates = dates.slice(0, days);
    // Build limited group
    const limitedGroup: Record<string, Transaction[]> = {};
    for (const date of limitedDates) {
      limitedGroup[date] = byDate[date].slice(0, maxPerDay);
    }
    return limitedGroup;
  }, [transactions, days, maxPerDay]);

  // Helper: get category info
  const getCategory = React.useCallback(
    (categoryId: string): Category | undefined =>
      categories.find((cat) => cat.id === categoryId),
    [categories]
  );

  // Empty state
  const isEmptyFeed =
    !isLoading &&
    (!transactions || transactions.length === 0 || Object.keys(grouped).length === 0);

  return (
    <Card
      className={cn(
        'w-full p-4 md:p-6 bg-glass shadow-glass rounded-lg transition-all',
        className
      )}
      aria-label="Recent Transactions Feed"
    >
      <div className="flex items-center gap-2 mb-4">
        <Scroll className="w-5 h-5 text-brand" aria-hidden="true" />
        <h2 className="font-heading text-lg md:text-xl font-bold text-brand-dark">
          Recent Transactions
        </h2>
      </div>
      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : isEmptyFeed ? (
        <EmptyState
          icon="Scroll"
          title="No Recent Transactions"
          description="Your recent transactions will appear here as you add them."
          className="mt-6"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date} className="fade-in slide-up">
              <div className="flex items-center gap-2 mb-2">
                <DateDisplay date={date} format="MMM d, yyyy" className="font-semibold text-neutral-700 dark:text-neutral-200" />
                <span className="text-xs text-neutral-400">
                  {txs.length} transaction{txs.length > 1 ? 's' : ''}
                </span>
              </div>
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {txs.map((tx) => {
                  const cat = getCategory(tx.categoryId);
                  const color =
                    cat?.color && CATEGORY_COLOR_MAP[cat.id]
                      ? CATEGORY_COLOR_MAP[cat.id]
                      : cat?.color || '#64748B';
                  const icon =
                    cat?.icon && CATEGORY_ICON_MAP[cat.id]
                      ? CATEGORY_ICON_MAP[cat.id]
                      : cat?.icon || 'Circle';

                  return (
                    <li
                      key={tx.id}
                      className={cn(
                        'flex items-center justify-between py-2 px-1 group hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors'
                      )}
                      aria-label={`Transaction ${tx.description || cat?.name || 'Unknown'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Category Badge */}
                        <Badge
                          color={color}
                          icon={icon}
                          label={cat?.name || 'Other'}
                          className="min-w-[90px] max-w-[120px] truncate"
                        />
                        {/* Description */}
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[160px]">
                          {tx.description || cat?.name || 'No description'}
                        </span>
                        {/* Notes (optional) */}
                        {tx.notes && (
                          <span className="text-xs text-neutral-400 truncate max-w-[120px] ml-2">
                            {tx.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Amount */}
                        <CurrencyDisplay
                          amount={tx.amount}
                          type={tx.type}
                          className={cn(
                            'font-mono text-base font-semibold',
                            tx.type === 'expense'
                              ? 'text-error'
                              : 'text-success'
                          )}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentTransactionsFeed;