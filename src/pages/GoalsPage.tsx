import React, { useState, useMemo, useCallback } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { SavingsGoal, Category } from 'src/types/index';
import { formatCurrency, formatDate } from 'src/lib/formatters';
import { cn, uuid } from 'src/lib/utils';
import Card from 'src/components/ui/Card';
import Button from 'src/components/ui/Button';
import ProgressBar from 'src/components/ui/ProgressBar';
import Badge from 'src/components/ui/Badge';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import EmptyState from 'src/components/ui/EmptyState';
import Dialog from 'src/components/ui/Dialog';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Toast from 'src/components/ui/Toast';
import ConfirmDialog from 'src/components/ui/ConfirmDialog';
import Skeleton from 'src/components/ui/Skeleton';
import { PiggyBank, CheckCircle, Archive, Plus, Edit, Trash2, PartyPopper } from 'lucide-react';
import { savingsGoalSchema } from 'src/schemas/savingsGoalSchema'; // Assume schema exists
import { DEFAULT_CURRENCY } from 'src/lib/constants';

/************************************************************
 * src/pages/GoalsPage.tsx
 * Vault - Savings Goals Management Page
 * - Lists savings goals as cards with progress, status, and actions.
 * - Allows adding, editing, archiving, and deleting goals.
 * - Confetti animation on completed goals.
 * - Accessible, responsive, and animated.
 ************************************************************/

/**
 * SavingsGoalFormData - Form shape for add/edit goal.
 * - Use zod schema inference if available.
 */
type SavingsGoalFormData = {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  categoryId?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived';
  notes?: string;
};

/**
 * Confetti - Simple confetti animation for completed goals.
 */
const Confetti: React.FC<{ show: boolean }> = ({ show }) => {
  // Only show confetti if show is true
  if (!show) return null;
  // Simple SVG confetti, can be replaced with react-spring or canvas for richer effect
  return (
    <div
      className="fixed inset-0 z-toast pointer-events-none flex items-start justify-center"
      aria-hidden="true"
    >
      <PartyPopper className="text-brand-accent animate-wiggle h-16 w-16 mt-12" />
      {/* Add more confetti shapes if desired */}
    </div>
  );
};

/**
 * GoalsPage - Savings goals management route/page.
 */
const GoalsPage: React.FC = () => {
  // Finance store
  const goals = useFinanceStore((state) => state.savingsGoals);
  const categories = useFinanceStore((state) => state.categories);
  const addGoal = useFinanceStore((state) => state.addSavingsGoal);
  const updateGoal = useFinanceStore((state) => state.updateSavingsGoal);
  const deleteGoal = useFinanceStore((state) => state.deleteSavingsGoal);

  // UI store
  const toast = useUIStore((state) => state.toast);
  const confirmDialog = useUIStore((state) => state.confirmDialog);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // Form state
  const [form, setForm] = useState<SavingsGoalFormData>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    categoryId: '',
    startDate: formatDate(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    status: 'active',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Memoized sorted goals (active first, then completed, then archived)
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const statusOrder = { active: 0, completed: 1, archived: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // Sort by targetAmount descending
      return b.targetAmount - a.targetAmount;
    });
  }, [goals]);

  // Handle open modal for add/edit
  const handleOpenModal = useCallback((goal?: SavingsGoal) => {
    setEditingGoal(goal || null);
    setForm(
      goal
        ? {
            id: goal.id,
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            categoryId: goal.categoryId || '',
            startDate: goal.startDate,
            endDate: goal.endDate || '',
            status: goal.status,
            notes: goal.notes || '',
          }
        : {
            name: '',
            targetAmount: 0,
            currentAmount: 0,
            categoryId: '',
            startDate: formatDate(new Date(), 'yyyy-MM-dd'),
            endDate: '',
            status: 'active',
            notes: '',
          }
    );
    setFormErrors({});
    setModalOpen(true);
  }, []);

  // Handle close modal
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingGoal(null);
    setFormErrors({});
  }, []);

  // Handle form input change
  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]:
          name === 'targetAmount' || name === 'currentAmount'
            ? Number(value)
            : value,
      }));
    },
    []
  );

  // Validate form using zod schema if available, else basic checks
  const validateForm = useCallback(() => {
    try {
      // If schema exists, use it
      if (typeof savingsGoalSchema === 'object' && savingsGoalSchema.parse) {
        savingsGoalSchema.parse(form);
        setFormErrors({});
        return true;
      }
    } catch (err: any) {
      if (err.errors) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          errors[e.path[0]] = e.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
    // Fallback: basic validation
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Goal name is required.';
    if (form.targetAmount <= 0) errors.targetAmount = 'Target amount must be greater than zero.';
    if (form.currentAmount < 0) errors.currentAmount = 'Current amount cannot be negative.';
    if (!form.startDate) errors.startDate = 'Start date is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  // Handle form submit (add/edit)
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      if (editingGoal) {
        // Update
        updateGoal(editingGoal.id, {
          ...form,
          updatedAt: new Date().toISOString(),
        });
        toast.show('success', 'Savings goal updated.');
      } else {
        // Add
        addGoal({
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.show('success', 'Savings goal added.');
      }
      handleCloseModal();
    },
    [form, editingGoal, addGoal, updateGoal, toast, handleCloseModal, validateForm]
  );

  // Handle delete goal
  const handleDeleteGoal = useCallback(
    (goal: SavingsGoal) => {
      confirmDialog.show({
        title: 'Delete Savings Goal',
        description: `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        onConfirm: () => {
          deleteGoal(goal.id);
          toast.show('success', 'Savings goal deleted.');
          confirmDialog.close();
        },
        onCancel: () => confirmDialog.close(),
      });
    },
    [deleteGoal, toast, confirmDialog]
  );

  // Handle archive goal
  const handleArchiveGoal = useCallback(
    (goal: SavingsGoal) => {
      updateGoal(goal.id, { status: 'archived', updatedAt: new Date().toISOString() });
      toast.show('info', 'Savings goal archived.');
    },
    [updateGoal, toast]
  );

  // Handle mark as completed
  const handleCompleteGoal = useCallback(
    (goal: SavingsGoal) => {
      updateGoal(goal.id, { status: 'completed', updatedAt: new Date().toISOString() });
      toast.show('success', 'Congratulations! Goal completed.');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    },
    [updateGoal, toast]
  );

  // Render goal card
  const renderGoalCard = (goal: SavingsGoal) => {
    const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const category = categories.find((cat) => cat.id === goal.categoryId);
    const statusBadge =
      goal.status === 'active'
        ? <Badge color="success" icon={PiggyBank}>Active</Badge>
        : goal.status === 'completed'
        ? <Badge color="brand" icon={CheckCircle}>Completed</Badge>
        : <Badge color="neutral" icon={Archive}>Archived</Badge>;

    return (
      <Card
        key={goal.id}
        className={cn(
          'flex flex-col gap-md p-lg shadow-md bg-glass',
          goal.status === 'completed' && 'border-2 border-success',
          goal.status === 'archived' && 'opacity-60'
        )}
        aria-label={`Savings goal: ${goal.name}`}
      >
        <div className="flex items-center gap-md">
          <PiggyBank className="text-category-savings h-6 w-6" aria-hidden="true" />
          <h3 className="font-heading text-lg font-bold">{goal.name}</h3>
          {statusBadge}
        </div>
        <div className="flex items-center gap-lg mt-sm">
          <AnimatedNumber
            value={goal.currentAmount}
            className="text-2xl font-bold text-success"
            format={(v) => formatCurrency(v, DEFAULT_CURRENCY)}
          />
          <span className="text-neutral-500 text-sm">of</span>
          <span className="text-xl font-semibold text-brand">
            {formatCurrency(goal.targetAmount, DEFAULT_CURRENCY)}
          </span>
        </div>
        <ProgressBar
          value={percent}
          max={100}
          color={percent >= 100 ? 'success' : 'brand'}
          className="mt-md"
          label={`${percent.toFixed(1)}%`}
        />
        <div className="flex items-center gap-md mt-md">
          {category && (
            <Badge color={category.color} icon={category.icon}>
              {category.name}
            </Badge>
          )}
          {goal.endDate && (
            <span className="text-neutral-400 text-xs">
              Target: {formatDate(goal.endDate)}
            </span>
          )}
        </div>
        {goal.notes && (
          <div className="mt-sm text-neutral-600 text-sm">{goal.notes}</div>
        )}
        <div className="flex gap-sm mt-lg">
          {goal.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                aria-label="Edit goal"
                onClick={() => handleOpenModal(goal)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={CheckCircle}
                aria-label="Mark as completed"
                onClick={() => handleCompleteGoal(goal)}
                disabled={percent < 100}
              >
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Archive}
                aria-label="Archive goal"
                onClick={() => handleArchiveGoal(goal)}
              >
                Archive
              </Button>
            </>
          )}
          <Button
            variant="destructive"
            size="sm"
            icon={Trash2}
            aria-label="Delete goal"
            onClick={() => handleDeleteGoal(goal)}
          >
            Delete
          </Button>
        </div>
      </Card>
    );
  };

  // Render modal for add/edit goal
  const renderGoalModal = () => (
    <Dialog
      open={modalOpen}
      onOpenChange={setModalOpen}
      title={editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}
      description="Set your savings target and track progress."
    >
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-md">
        <Input
          label="Goal Name"
          name="name"
          value={form.name}
          onChange={handleFormChange}
          required
          error={formErrors.name}
          autoFocus
        />
        <Input
          label="Target Amount"
          name="targetAmount"
          type="number"
          min={1}
          step={0.01}
          value={form.targetAmount}
          onChange={handleFormChange}
          required
          error={formErrors.targetAmount}
        />
        <Input
          label="Current Amount"
          name="currentAmount"
          type="number"
          min={0}
          step={0.01}
          value={form.currentAmount}
          onChange={handleFormChange}
          error={formErrors.currentAmount}
        />
        <Select
          label="Category"
          name="categoryId"
          value={form.categoryId}
          onChange={handleFormChange}
          options={[
            { value: '', label: 'None' },
            ...categories
              .filter((cat) => cat.type === 'savings' || cat.type === 'expense')
              .map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
          ]}
        />
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleFormChange}
          required
          error={formErrors.startDate}
        />
        <Input
          label="Target Date"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleFormChange}
          error={formErrors.endDate}
        />
        <Input
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleFormChange}
          textarea
          error={formErrors.notes}
        />
        <div className="flex gap-md mt-lg justify-end">
          <Button variant="ghost" type="button" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="brand" type="submit">
            {editingGoal ? 'Update Goal' : 'Add Goal'}
          </Button>
        </div>
      </form>
    </Dialog>
  );

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState
      icon={PiggyBank}
      title="No Savings Goals Yet"
      description="Start your first savings goal to track progress and celebrate milestones."
      action={
        <Button variant="brand" icon={Plus} onClick={() => handleOpenModal()}>
          Add Savings Goal
        </Button>
      }
    />
  );

  // Main render
  return (
    <div className="max-w-4xl mx-auto px-md py-xl fade-in slide-up">
      <div className="flex items-center justify-between mb-xl">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-sm">
          <PiggyBank className="text-category-savings h-7 w-7" aria-hidden="true" />
          Savings Goals
        </h1>
        <Button variant="brand" icon={Plus} onClick={() => handleOpenModal()}>
          Add Goal
        </Button>
      </div>
      {showConfetti && <Confetti show={showConfetti} />}
      {goals.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {sortedGoals.map(renderGoalCard)}
        </div>
      )}
      {renderGoalModal()}
      {/* Global Toast and ConfirmDialog (handled by App shell, but can be duplicated here for isolation) */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={toast.close}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    </div>
  );
};

export default GoalsPage;