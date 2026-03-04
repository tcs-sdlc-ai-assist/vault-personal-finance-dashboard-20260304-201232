import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema, BudgetFormData } from 'src/schemas/budgetSchema';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Category, Budget } from 'src/types/index';
import { formatDateInput } from 'src/lib/formatters';
import { cn, uuid } from 'src/lib/utils';
import Dialog from 'src/components/ui/Dialog';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Button from 'src/components/ui/Button';
import { CATEGORY_COLOR_MAP } from 'src/lib/constants';

/************************************************************
 * BudgetModal.tsx
 * Vault - Modal for creating/editing budgets per category/month.
 * - Uses react-hook-form with Zod validation.
 * - Handles both create and edit flows.
 * - Accessible, keyboard navigable, and responsive.
 ************************************************************/

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Budget | null;
}

/**
 * BudgetModal
 * - Modal dialog for creating or editing a budget.
 * - Validates with Zod, persists to Zustand store.
 */
const BudgetModal: React.FC<BudgetModalProps> = ({ open, onClose, initialData }) => {
  // Store actions
  const addBudget = useFinanceStore((s) => s.addBudget);
  const updateBudget = useFinanceStore((s) => s.updateBudget);
  const categories = useFinanceStore((s) => s.categories);

  const showToast = useUIStore((s) => s.toast.show);

  // Filter categories to only expense/savings (budgets can't be for income)
  const budgetCategories = categories.filter(
    (cat) => cat.type === 'expense' || cat.type === 'savings'
  );

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          // Ensure date fields are in YYYY-MM-DD
          startDate: formatDateInput(initialData.startDate),
          endDate: formatDateInput(initialData.endDate),
        }
      : {
          categoryId: budgetCategories[0]?.id || '',
          amount: 0,
          period: 'monthly',
          startDate: formatDateInput(new Date()),
          endDate: formatDateInput(new Date()),
          notes: '',
          isActive: true,
        },
    mode: 'onBlur',
  });

  // When initialData changes (edit mode), reset form
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        startDate: formatDateInput(initialData.startDate),
        endDate: formatDateInput(initialData.endDate),
      });
    } else {
      reset({
        categoryId: budgetCategories[0]?.id || '',
        amount: 0,
        period: 'monthly',
        startDate: formatDateInput(new Date()),
        endDate: formatDateInput(new Date()),
        notes: '',
        isActive: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  // Handle form submit
  const onSubmit = async (data: BudgetFormData) => {
    try {
      if (initialData) {
        // Edit mode
        updateBudget(initialData.id, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        showToast('success', 'Budget updated successfully.');
      } else {
        // Create mode
        addBudget({
          ...data,
          id: uuid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        });
        showToast('success', 'Budget created successfully.');
      }
      onClose();
    } catch (err) {
      showToast('error', 'Failed to save budget. Please try again.');
    }
  };

  // Handle modal close: reset form
  const handleClose = () => {
    reset();
    onClose();
  };

  // Watch period for dynamic date fields (optional: could auto-set dates)
  const period = watch('period');

  // Render
  return (
    <Dialog open={open} onOpenChange={handleClose} aria-label={initialData ? 'Edit Budget' : 'Add Budget'}>
      <Dialog.Content className="max-w-md w-full p-6 rounded-lg bg-glass shadow-glass">
        <Dialog.Title className="text-xl font-heading mb-2">
          {initialData ? 'Edit Budget' : 'Add Budget'}
        </Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          {/* Category Select */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
              Category
            </label>
            <Select
              id="categoryId"
              {...register('categoryId')}
              disabled={!!initialData} // Don't allow changing category on edit
              className={cn(errors.categoryId && 'border-error')}
            >
              {budgetCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                    style={{ backgroundColor: CATEGORY_COLOR_MAP[cat.id] || cat.color }}
                  />
                  {cat.name}
                </option>
              ))}
            </Select>
            {errors.categoryId && (
              <span className="text-error text-xs">{errors.categoryId.message}</span>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              className={cn(errors.amount && 'border-error')}
              autoFocus
            />
            {errors.amount && (
              <span className="text-error text-xs">{errors.amount.message}</span>
            )}
          </div>

          {/* Period */}
          <div>
            <label htmlFor="period" className="block text-sm font-medium mb-1">
              Period
            </label>
            <Select
              id="period"
              {...register('period')}
              className={cn(errors.period && 'border-error')}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </Select>
            {errors.period && (
              <span className="text-error text-xs">{errors.period.message}</span>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              className={cn(errors.startDate && 'border-error')}
            />
            {errors.startDate && (
              <span className="text-error text-xs">{errors.startDate.message}</span>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date
            </label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
              className={cn(errors.endDate && 'border-error')}
            />
            {errors.endDate && (
              <span className="text-error text-xs">{errors.endDate.message}</span>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes <span className="text-neutral-400">(optional)</span>
            </label>
            <Input
              id="notes"
              as="textarea"
              rows={2}
              maxLength={512}
              placeholder="Add notes (optional)"
              {...register('notes')}
              className={cn(errors.notes && 'border-error')}
            />
            {errors.notes && (
              <span className="text-error text-xs">{errors.notes.message}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {initialData ? 'Save Changes' : 'Add Budget'}
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};

export default BudgetModal;