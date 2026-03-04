import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from 'src/schemas/transactionSchema';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { useCurrency } from 'src/hooks/useCurrency';
import { cn, uuid } from 'src/lib/utils';
import { formatDateInput } from 'src/lib/formatters';
import Button from 'src/components/ui/Button';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Tooltip from 'src/components/ui/Tooltip';
import Badge from 'src/components/ui/Badge';
import Card from 'src/components/ui/Card';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import { Category } from 'src/types/index';

type TransactionFormProps = {
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
};

/**
 * TransactionForm
 * - Validated transaction form for add/edit.
 * - Uses React Hook Form + Zod for validation.
 * - Handles expense/income, amount, category, date, description, notes.
 * - Used in modals/dialogs for transaction CRUD.
 */
const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  loading = false,
  className,
}) => {
  // Categories from store
  const categories = useFinanceStore((state) => state.categories);

  // Currency info
  const { code: currencyCode, symbol: currencySymbol, format: formatCurrency } = useCurrency();

  // UI toast
  const toast = useUIStore((state) => state.toast);

  // Prepare category options
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');
  const incomeCategories = categories.filter((cat) => cat.type === 'income');
  const allCategories = [...expenseCategories, ...incomeCategories];

  // Default values
  const defaultValues: TransactionFormData = {
    type: initialData?.type ?? 'expense',
    amount: initialData?.amount ?? 0,
    categoryId: initialData?.categoryId ?? (expenseCategories[0]?.id || ''),
    date: initialData?.date ?? formatDateInput(new Date()),
    description: initialData?.description ?? '',
    notes: initialData?.notes ?? '',
    recurringTemplateId: initialData?.recurringTemplateId ?? '',
    createdAt: initialData?.createdAt ?? '',
    updatedAt: initialData?.updatedAt ?? '',
    id: initialData?.id ?? undefined,
  };

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Watch type to filter categories
  const type = watch('type');
  const filteredCategories =
    type === 'income' ? incomeCategories : expenseCategories;

  // Handle form submit
  const submitHandler = async (data: TransactionFormData) => {
    try {
      // Ensure amount is positive
      data.amount = Math.abs(data.amount);

      // Set ID, createdAt, updatedAt if not present
      if (!data.id) data.id = uuid();
      const now = new Date().toISOString();
      if (!data.createdAt) data.createdAt = now;
      data.updatedAt = now;

      onSubmit(data);
    } catch (err) {
      toast.show('error', 'Failed to save transaction.');
    }
  };

  // Accessibility: focus first error
  React.useEffect(() => {
    if (errors) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const el = document.querySelector(`[name="${firstErrorField}"]`);
        if (el) (el as HTMLElement).focus();
      }
    }
  }, [errors]);

  // UI: show currency symbol in amount input
  const AmountPrefix = (
    <span className="text-neutral-500 font-mono pr-1">{currencySymbol}</span>
  );

  // UI: show category badge
  function renderCategoryBadge(categoryId: string) {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return null;
    return (
      <Badge
        color={cat.color}
        icon={cat.icon}
        className="ml-2"
        aria-label={cat.name}
      >
        {cat.name}
      </Badge>
    );
  }

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="space-y-4"
        autoComplete="off"
        aria-label="Transaction Form"
      >
        {/* Transaction Type */}
        <div>
          <label htmlFor="type" className="block font-medium mb-1">
            Type
          </label>
          <Select
            id="type"
            {...register('type')}
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
            disabled={loading || isSubmitting}
            aria-invalid={!!errors.type}
            className={cn(errors.type && 'border-error')}
          />
          {errors.type && (
            <span className="text-error text-xs mt-1">{errors.type.message}</span>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block font-medium mb-1">
            Amount
            <Tooltip content={`Enter the amount in ${currencyCode}`}>
              <span className="ml-1 text-neutral-400 cursor-help">?</span>
            </Tooltip>
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            prefix={AmountPrefix}
            {...register('amount', { valueAsNumber: true })}
            disabled={loading || isSubmitting}
            aria-invalid={!!errors.amount}
            className={cn(errors.amount && 'border-error')}
          />
          {errors.amount && (
            <span className="text-error text-xs mt-1">{errors.amount.message}</span>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block font-medium mb-1">
            Category
          </label>
          <Select
            id="categoryId"
            {...register('categoryId')}
            options={filteredCategories.map((cat) => ({
              value: cat.id,
              label: cat.name,
              icon: cat.icon,
              color: cat.color,
            }))}
            disabled={loading || isSubmitting}
            aria-invalid={!!errors.categoryId}
            className={cn(errors.categoryId && 'border-error')}
          />
          {errors.categoryId && (
            <span className="text-error text-xs mt-1">{errors.categoryId.message}</span>
          )}
          {renderCategoryBadge(watch('categoryId'))}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block font-medium mb-1">
            Date
          </label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            disabled={loading || isSubmitting}
            aria-invalid={!!errors.date}
            className={cn(errors.date && 'border-error')}
          />
          {errors.date && (
            <span className="text-error text-xs mt-1">{errors.date.message}</span>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Description
          </label>
          <Input
            id="description"
            type="text"
            maxLength={128}
            placeholder="e.g. Grocery shopping, Salary, etc."
            {...register('description')}
            disabled={loading || isSubmitting}
            aria-invalid={!!errors.description}
            className={cn(errors.description && 'border-error')}
          />
          {errors.description && (
            <span className="text-error text-xs mt-1">{errors.description.message}</span>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block font-medium mb-1">
            Notes
          </label>
          <Input
            id="notes"
            type="text"
            maxLength={512}
            placeholder="Optional notes"
            {...register('notes')}
            disabled={loading || isSubmitting}
            aria-invalid={!!errors.notes}
            className={cn(errors.notes && 'border-error')}
          />
          {errors.notes && (
            <span className="text-error text-xs mt-1">{errors.notes.message}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            type="submit"
            variant="brand"
            disabled={loading || isSubmitting}
            loading={loading || isSubmitting}
            aria-label={submitLabel}
          >
            {submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="neutral"
              onClick={onCancel}
              disabled={loading || isSubmitting}
              aria-label="Cancel"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;