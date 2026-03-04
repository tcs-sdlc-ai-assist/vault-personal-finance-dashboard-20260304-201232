import React from 'react';
import { Transaction, Category } from 'src/types/index';
import { formatCurrency, formatDate } from 'src/lib/formatters';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP } from 'src/lib/constants';
import { cn } from 'src/lib/utils';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Pencil, Trash } from 'lucide-react';
import Badge from 'src/components/ui/Badge';
import Button from 'src/components/ui/Button';
import Tooltip from 'src/components/ui/Tooltip';

/************************************************************
 * TransactionRow.tsx
 * Vault - Individual transaction row for table.
 * - Animated add/remove
 * - Actions: edit, delete
 * - Accessible and responsive
 ************************************************************/

/**
 * Props for TransactionRow
 */
interface TransactionRowProps {
  transaction: Transaction;
  categories: Category[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  // Optional: highlight animation for new/removed rows
  animate?: boolean;
}

/**
 * TransactionRow
 * - Renders a single transaction row with category, amount, date, description, actions.
 * - Handles edit/delete actions via callbacks or store.
 * - Animated add/remove with fade/slide.
 */
const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  categories,
  onEdit,
  onDelete,
  animate = false,
}) => {
  const { id, type, amount, categoryId, date, description, notes } = transaction;

  // Find category info
  const category = categories.find((cat) => cat.id === categoryId);
  const categoryName = category?.name || 'Unknown';
  const categoryColor =
    category?.color && CATEGORY_COLOR_MAP[categoryId]
      ? CATEGORY_COLOR_MAP[categoryId]
      : category?.color || '#64748B';
  const categoryIcon = category?.icon || CATEGORY_ICON_MAP[categoryId] || 'Circle';

  // Finance store actions (fallback if no callback)
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  // UI store for confirm dialog and toast
  const { confirmDialog, toast } = useUIStore();

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction);
    } else {
      // Open modal via UI store (not implemented here)
      toast.show('info', 'Edit transaction feature coming soon.');
    }
  };

  // Handle delete action with confirm dialog
  const handleDelete = () => {
    if (onDelete) {
      onDelete(transaction);
    } else {
      confirmDialog.show({
        title: 'Delete Transaction',
        description: 'Are you sure you want to delete this transaction? This action cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        onConfirm: () => {
          deleteTransaction(id);
          toast.show('success', 'Transaction deleted.');
        },
        onCancel: () => {},
      });
    }
  };

  // Animation classes
  const animationClass = animate
    ? 'fade-in slide-up'
    : '';

  // Accessibility: aria-labels
  const ariaLabelEdit = `Edit transaction ${description || categoryName}`;
  const ariaLabelDelete = `Delete transaction ${description || categoryName}`;

  return (
    <tr
      className={cn(
        'transition-all duration-300',
        animationClass,
        'hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
      data-transaction-id={id}
      tabIndex={0}
      aria-label={`Transaction row: ${categoryName}, ${formatCurrency(amount)}, ${formatDate(date)}`}
    >
      {/* Category */}
      <td className="px-4 py-2 whitespace-nowrap">
        <Badge
          color={categoryColor}
          icon={categoryIcon}
          label={categoryName}
          className="min-w-[120px]"
        />
      </td>

      {/* Type (expense/income) */}
      <td className="px-4 py-2 text-center">
        <span
          className={cn(
            'font-semibold',
            type === 'expense'
              ? 'text-error'
              : 'text-success'
          )}
        >
          {type === 'expense' ? 'Expense' : 'Income'}
        </span>
      </td>

      {/* Amount */}
      <td className="px-4 py-2 text-right font-mono font-bold">
        <span
          className={cn(
            type === 'expense' ? 'text-error' : 'text-success'
          )}
        >
          {formatCurrency(amount)}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-2 text-center">
        <span className="text-neutral-600 dark:text-neutral-300">
          {formatDate(date)}
        </span>
      </td>

      {/* Description */}
      <td className="px-4 py-2 max-w-[220px] truncate">
        <span className="text-neutral-700 dark:text-neutral-200">
          {description || <span className="text-neutral-400">—</span>}
        </span>
      </td>

      {/* Notes (optional) */}
      <td className="px-4 py-2 max-w-[180px] truncate">
        <span className="text-neutral-500 dark:text-neutral-400">
          {notes || <span className="text-neutral-400">—</span>}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2 text-right">
        <div className="flex gap-2 justify-end">
          <Tooltip content="Edit">
            <Button
              variant="ghost"
              size="sm"
              aria-label={ariaLabelEdit}
              onClick={handleEdit}
              tabIndex={0}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button
              variant="ghost"
              size="sm"
              aria-label={ariaLabelDelete}
              onClick={handleDelete}
              tabIndex={0}
              className="text-error hover:bg-error/10"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};

export default TransactionRow;