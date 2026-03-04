import React from 'react';
import { Transaction, Category } from 'src/types/index';
import { formatCurrency, formatDate } from 'src/lib/formatters';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP } from 'src/lib/constants';
import { cn } from 'src/lib/utils';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useCurrency } from 'src/hooks/useCurrency';
import { Icon } from 'lucide-react'; // lucide-react icons
import Badge from 'src/components/ui/Badge';
import Card from 'src/components/ui/Card';
import Tooltip from 'src/components/ui/Tooltip';

/************************************************************
 * TransactionCard.tsx
 * Vault - Mobile card layout for transactions.
 * - Used in mobile list views instead of table.
 * - Displays amount, category, date, description, and notes.
 * - Responsive, accessible, and visually distinct.
 ************************************************************/

/**
 * TransactionCard Props
 */
export interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
  className?: string;
}

/**
 * TransactionCard
 * - Renders a transaction as a mobile-friendly card.
 * - Shows amount, category badge, date, description, notes.
 * - Color-coded by category.
 * - Clickable for details/edit (optional).
 */
const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onClick,
  className,
}) => {
  // Get categories from store
  const categories = useFinanceStore((state) => state.categories);
  const category = categories.find((cat) => cat.id === transaction.categoryId);

  // Currency formatting
  const { format: formatCur } = useCurrency();

  // Icon mapping
  const iconName = category?.icon || CATEGORY_ICON_MAP[transaction.categoryId] || 'Circle';
  const IconComponent = (Icon as any)[iconName] || (Icon as any)['Circle'];

  // Color mapping
  const color =
    (category && CATEGORY_COLOR_MAP[category.id]) ||
    category?.color ||
    '#64748B';

  // Card click handler (for details/edit)
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // Accessibility: aria-label
  const ariaLabel = [
    transaction.type === 'expense' ? 'Expense' : 'Income',
    formatCur(transaction.amount),
    category?.name || 'Category',
    formatDate(transaction.date),
    transaction.description || '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card
      className={cn(
        'flex flex-col gap-2 px-4 py-3 rounded-lg shadow-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition hover:shadow-md focus:shadow-lg cursor-pointer',
        className
      )}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          handleClick(e as any);
        }
      }}
    >
      {/* Top row: Amount + Category */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Icon */}
          <span
            className={cn(
              'flex items-center justify-center rounded-full w-8 h-8',
              'bg-opacity-10',
              transaction.type === 'expense'
                ? 'bg-error'
                : 'bg-success'
            )}
            style={{ color, backgroundColor: color + '1A' }}
            aria-hidden="true"
          >
            <Tooltip content={category?.name || 'Category'}>
              <IconComponent size={20} strokeWidth={2} />
            </Tooltip>
          </span>
          {/* Category badge */}
          <Badge
            color={color}
            className={cn(
              'font-medium text-xs px-2 py-1 rounded-full',
              'bg-opacity-15',
              'truncate'
            )}
          >
            {category?.name || 'Other'}
          </Badge>
        </div>
        {/* Amount */}
        <span
          className={cn(
            'font-heading text-lg font-bold',
            transaction.type === 'expense'
              ? 'text-error'
              : 'text-success'
          )}
        >
          {transaction.type === 'expense' ? '-' : '+'}
          {formatCur(transaction.amount)}
        </span>
      </div>

      {/* Second row: Date + Description */}
      <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-300">
        <span>
          <Tooltip content={formatDate(transaction.date, 'MMM d, yyyy')}>
            {formatDate(transaction.date, 'MMM d')}
          </Tooltip>
        </span>
        {transaction.description && (
          <span className="truncate max-w-[60%] text-neutral-700 dark:text-neutral-200">
            {transaction.description}
          </span>
        )}
      </div>

      {/* Notes (if present) */}
      {transaction.notes && (
        <div className="mt-1 text-xs text-neutral-400 dark:text-neutral-400 truncate">
          <span className="font-mono">Note:</span> {transaction.notes}
        </div>
      )}
    </Card>
  );
};

export default TransactionCard;