import React, { useState } from 'react';
import { Budget, Category } from 'src/types/index';
import { cn } from 'src/lib/utils';
import { formatCurrency, formatPercentage } from 'src/lib/formatters';
import { calculateBudgetProgress } from 'src/lib/calculations';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import ProgressBar from 'src/components/ui/ProgressBar';
import Badge from 'src/components/ui/Badge';
import Button from 'src/components/ui/Button';
import Input from 'src/components/ui/Input';
import Tooltip from 'src/components/ui/Tooltip';
import Dialog from 'src/components/ui/Dialog';
import { Pencil, AlertTriangle, Check, X } from 'lucide-react';

/************************************************************
 * CategoryBudgetCard.tsx
 * Vault - Card for per-category budget with inline editing and warning indicators.
 * - Displays budget info, progress, spent/remaining, and warning if overspent.
 * - Supports inline editing of budget amount and notes.
 * - Accessible, responsive, and animated.
 ************************************************************/

interface CategoryBudgetCardProps {
  budget: Budget;
  category: Category;
}

/**
 * CategoryBudgetCard
 * - Card for per-category budget with progress, warning, and inline editing.
 * - Shows budgeted amount, spent, remaining, percent, and notes.
 * - Allows inline edit of amount and notes (modal/dialog).
 */
const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  budget,
  category,
}) => {
  const transactions = useFinanceStore((state) => state.transactions);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);
  const { toast, confirmDialog } = useUIStore();

  // Calculate progress for this budget
  const progress = calculateBudgetProgress(
    budget,
    transactions.filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.categoryId === budget.categoryId &&
        tx.date >= budget.startDate &&
        tx.date <= budget.endDate
    )
  );

  // Inline edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editAmount, setEditAmount] = useState(budget.amount);
  const [editNotes, setEditNotes] = useState(budget.notes || '');
  const [saving, setSaving] = useState(false);

  // Overspent warning
  const isOverspent = progress.spent > budget.amount;

  // Handle edit open/close
  const openEdit = () => {
    setEditAmount(budget.amount);
    setEditNotes(budget.notes || '');
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setSaving(false);
  };

  // Handle edit save
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editAmount <= 0 || editAmount > 1_000_000_000) {
        toast.show('error', 'Budget amount must be between 1 and 1,000,000,000.');
        setSaving(false);
        return;
      }
      updateBudget(budget.id, {
        amount: editAmount,
        notes: editNotes,
        updatedAt: new Date().toISOString(),
      });
      toast.show('success', 'Budget updated.');
      closeEdit();
    } catch (err) {
      toast.show('error', 'Failed to update budget.');
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    confirmDialog.show({
      title: 'Delete Budget',
      description: `Are you sure you want to delete the budget for "${category.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        deleteBudget(budget.id);
        toast.show('success', 'Budget deleted.');
      },
    });
  };

  // Card color (category color or fallback)
  const cardColor =
    category.color && category.color.startsWith('#')
      ? category.color
      : `var(--color-${category.color.replace('.', '-')})`;

  return (
    <div
      className={cn(
        'glass shadow-md rounded-lg p-4 flex flex-col gap-3 relative transition-all',
        isOverspent && 'border border-error'
      )}
      style={{ background: cardColor ? cardColor : undefined }}
      aria-label={`Budget card for ${category.name}`}
    >
      {/* Header: Category name and icon */}
      <div className="flex items-center gap-2">
        <Badge
          color={category.color}
          icon={category.icon}
          label={category.name}
          className="font-heading text-lg"
        />
        {isOverspent && (
          <Tooltip content="Overspent!">
            <AlertTriangle className="text-error ml-2 animate-pulse" size={20} aria-label="Overspent warning" />
          </Tooltip>
        )}
        <div className="ml-auto flex gap-1">
          <Tooltip content="Edit budget">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Edit budget"
              onClick={openEdit}
            >
              <Pencil size={18} />
            </Button>
          </Tooltip>
          <Tooltip content="Delete budget">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete budget"
              onClick={handleDelete}
            >
              <X size={18} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={progress.percent}
        color={isOverspent ? 'error' : category.color}
        className="mt-2"
        aria-label={`Budget progress: ${formatPercentage(progress.percent)}`}
      />

      {/* Budget info */}
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <div>
          <span className="text-sm text-neutral-500">Budgeted</span>
          <div className="font-mono font-bold text-brand">
            {formatCurrency(budget.amount)}
          </div>
        </div>
        <div>
          <span className="text-sm text-neutral-500">Spent</span>
          <div className={cn('font-mono font-bold', isOverspent ? 'text-error' : 'text-neutral-700')}>
            {formatCurrency(progress.spent)}
          </div>
        </div>
        <div>
          <span className="text-sm text-neutral-500">Remaining</span>
          <div className={cn('font-mono font-bold', progress.remaining < 0 ? 'text-error' : 'text-success')}>
            {formatCurrency(progress.remaining)}
          </div>
        </div>
        <div>
          <span className="text-sm text-neutral-500">Used</span>
          <div className={cn('font-mono font-bold', isOverspent ? 'text-error' : 'text-brand')}>
            {formatPercentage(progress.percent)}
          </div>
        </div>
      </div>

      {/* Notes */}
      {budget.notes && (
        <div className="mt-2 text-xs text-neutral-600 italic truncate" title={budget.notes}>
          {budget.notes}
        </div>
      )}

      {/* Inline Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen} aria-label="Edit budget">
        <Dialog.Content>
          <Dialog.Title>Edit Budget for {category.name}</Dialog.Title>
          <Dialog.Description>
            Update the budgeted amount and notes for this category.
          </Dialog.Description>
          <form
            className="flex flex-col gap-4 mt-4"
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
          >
            <Input
              label="Budget Amount"
              type="number"
              min={1}
              max={1_000_000_000}
              step={0.01}
              value={editAmount}
              onChange={e => setEditAmount(Number(e.target.value))}
              required
              autoFocus
              className="font-mono"
            />
            <Input
              label="Notes"
              type="text"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              maxLength={512}
              placeholder="Optional notes"
            />
            <div className="flex gap-2 justify-end mt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                type="submit"
                disabled={saving}
                icon={<Check size={18} />}
              >
                Save
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default CategoryBudgetCard;