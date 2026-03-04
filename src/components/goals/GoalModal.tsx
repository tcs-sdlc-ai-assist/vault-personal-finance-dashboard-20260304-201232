import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from 'src/components/ui/Dialog';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Button from 'src/components/ui/Button';
import { cn } from 'src/lib/utils';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { formatDateInput } from 'src/lib/formatters';
import { uuid } from 'src/lib/utils';
import { Category, SavingsGoal, SavingsGoalStatus } from 'src/types/index';
import { z } from 'zod';

// ---------- Zod Schema for Savings Goal Form ----------

const savingsGoalSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Goal name is required.')
    .max(64, 'Goal name is too long.'),
  targetAmount: z
    .number()
    .positive('Target amount must be greater than zero.')
    .max(1_000_000_000, 'Target amount is too large.'),
  currentAmount: z
    .number()
    .min(0, 'Current amount cannot be negative.')
    .max(1_000_000_000, 'Current amount is too large.'),
  categoryId: z.string().optional(),
  startDate: z
    .string()
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Start date must be in YYYY-MM-DD format.'
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'End date must be in YYYY-MM-DD format.'
    ),
  status: z.enum(['active', 'completed', 'archived'] as SavingsGoalStatus[], {
    required_error: 'Status is required.',
  }),
  notes: z.string().max(512, 'Notes are too long.').optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;

// ---------- Props ----------

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<SavingsGoal>;
  mode: 'create' | 'edit';
}

// ---------- Component ----------

/**
 * GoalModal
 * - Modal dialog for creating/editing savings goals.
 * - Validates with Zod, uses react-hook-form.
 * - Handles error display, category selection, and status.
 */
const GoalModal: React.FC<GoalModalProps> = ({
  open,
  onClose,
  initialData,
  mode,
}) => {
  // Categories (only savings or all)
  const categories = useFinanceStore((state) => state.categories);
  const addSavingsGoal = useFinanceStore((state) => state.addSavingsGoal);
  const updateSavingsGoal = useFinanceStore((state) => state.updateSavingsGoal);

  const showToast = useUIStore((state) => state.toast.show);

  // Filter categories for savings goals (type: 'savings')
  const savingsCategories = categories.filter(
    (cat) => cat.type === 'savings'
  );

  // Default values for form
  const defaultValues: SavingsGoalFormData = {
    id: initialData?.id,
    name: initialData?.name || '',
    targetAmount: initialData?.targetAmount ?? 0,
    currentAmount: initialData?.currentAmount ?? 0,
    categoryId: initialData?.categoryId || (savingsCategories[0]?.id ?? ''),
    startDate: initialData?.startDate
      ? formatDateInput(initialData.startDate)
      : formatDateInput(new Date()),
    endDate: initialData?.endDate
      ? formatDateInput(initialData.endDate)
      : '',
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
    createdAt: initialData?.createdAt,
    updatedAt: initialData?.updatedAt,
  };

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    reset(defaultValues);
  }, [open, initialData]);

  // Submit handler
  const onSubmit = async (data: SavingsGoalFormData) => {
    try {
      if (mode === 'create') {
        addSavingsGoal({
          ...data,
          id: uuid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        showToast('success', 'Savings goal created!');
      } else if (mode === 'edit' && data.id) {
        updateSavingsGoal(data.id, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        showToast('success', 'Savings goal updated!');
      }
      onClose();
    } catch (err) {
      showToast('error', 'Failed to save savings goal.');
    }
  };

  // Modal title/label
  const title =
    mode === 'create' ? 'Create Savings Goal' : 'Edit Savings Goal';

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  // Category options
  const categoryOptions = savingsCategories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-md">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
        aria-label={title}
      >
        {/* Goal Name */}
        <Input
          label="Goal Name"
          {...register('name')}
          error={errors.name?.message}
          autoFocus
          required
        />

        {/* Target Amount */}
        <Input
          label="Target Amount"
          type="number"
          step="0.01"
          min={0}
          {...register('targetAmount', { valueAsNumber: true })}
          error={errors.targetAmount?.message}
          required
        />

        {/* Current Amount */}
        <Input
          label="Current Amount"
          type="number"
          step="0.01"
          min={0}
          {...register('currentAmount', { valueAsNumber: true })}
          error={errors.currentAmount?.message}
        />

        {/* Category (optional) */}
        {categoryOptions.length > 0 && (
          <Select
            label="Category"
            options={categoryOptions}
            {...register('categoryId')}
            error={errors.categoryId?.message}
          />
        )}

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          {...register('startDate')}
          error={errors.startDate?.message}
          required
        />

        {/* End Date (optional) */}
        <Input
          label="End Date"
          type="date"
          {...register('endDate')}
          error={errors.endDate?.message}
        />

        {/* Status */}
        <Select
          label="Status"
          options={statusOptions}
          {...register('status')}
          error={errors.status?.message}
          required
        />

        {/* Notes */}
        <Input
          label="Notes"
          type="textarea"
          rows={3}
          {...register('notes')}
          error={errors.notes?.message}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
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
            {mode === 'create' ? 'Create Goal' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default GoalModal;