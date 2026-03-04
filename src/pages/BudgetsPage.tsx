import React, { useState } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import useBudgetProgress from 'src/hooks/useBudgetProgress';
import useChartData from 'src/hooks/useChartData';
import useDateRange from 'src/hooks/useDateRange';
import { formatCurrency } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';
import { Budget, Category } from 'src/types/index';

import Card from 'src/components/ui/Card';
import ProgressBar from 'src/components/ui/ProgressBar';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import PercentageBadge from 'src/components/ui/PercentageBadge';
import Button from 'src/components/ui/Button';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import EmptyState from 'src/components/ui/EmptyState';
import ConfirmDialog from 'src/components/ui/ConfirmDialog';
import Toast from 'src/components/ui/Toast';
import Skeleton from 'src/components/ui/Skeleton';
import Dialog from 'src/components/ui/Dialog';

import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, Edit, PieChart, BarChart2 } from 'lucide-react';

/************************************************************
 * BudgetsPage.tsx
 * Vault - Budgets management page.
 * - Shows overall and per-category budget progress.
 * - Renders budget history chart (bar).
 * - Handles add/edit/delete budget modals.
 * - Responsive and accessible.
 ************************************************************/

// ---------- Budget Modal State ----------

type ModalType = 'add' | 'edit' | null;

interface BudgetModalState {
  open: boolean;
  type: ModalType;
  budget?: Budget;
}

// ---------- BudgetsPage Component ----------

const BudgetsPage: React.FC = () => {
  // Finance store
  const budgets = useFinanceStore((state) => state.budgets);
  const categories = useFinanceStore((state) => state.categories);
  const addBudget = useFinanceStore((state) => state.addBudget);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);
  const clearBudgets = useFinanceStore((state) => state.clearBudgets);

  // UI store
  const toast = useUIStore((state) => state.toast);
  const confirmDialog = useUIStore((state) => state.confirmDialog);

  // Date range filter for budgets
  const {
    dateRange,
    setPreset,
    setCustomRange,
    presets,
    isCustom,
    validate,
  } = useDateRange();

  // Budget progress (per-budget and overall)
  const { perBudget, overall } = useBudgetProgress(dateRange);

  // Chart data (bar chart for budget history)
  const { barData } = useChartData(dateRange);

  // Modal state
  const [budgetModal, setBudgetModal] = useState<BudgetModalState>({
    open: false,
    type: null,
    budget: undefined,
  });

  // Loading state (simulate async for demo)
  const [loading, setLoading] = useState(false);

  // Handle add budget
  function handleAddBudget() {
    setBudgetModal({ open: true, type: 'add', budget: undefined });
  }

  // Handle edit budget
  function handleEditBudget(budget: Budget) {
    setBudgetModal({ open: true, type: 'edit', budget });
  }

  // Handle delete budget (with confirm dialog)
  function handleDeleteBudget(budget: Budget) {
    confirmDialog.show({
      title: 'Delete Budget',
      description: `Are you sure you want to delete the budget for "${getCategoryName(budget.categoryId)}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        deleteBudget(budget.id);
        toast.show('success', 'Budget deleted.');
        confirmDialog.close();
      },
      onCancel: confirmDialog.close,
    });
  }

  // Handle clear all budgets (with confirm dialog)
  function handleClearBudgets() {
    confirmDialog.show({
      title: 'Clear All Budgets',
      description: 'Are you sure you want to clear all budgets? This action cannot be undone.',
      confirmLabel: 'Clear',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        clearBudgets();
        toast.show('success', 'All budgets cleared.');
        confirmDialog.close();
      },
      onCancel: confirmDialog.close,
    });
  }

  // Helper: get category name
  function getCategoryName(categoryId: string): string {
    return categories.find((cat) => cat.id === categoryId)?.name || 'Unknown';
  }

  // Helper: get category color
  function getCategoryColor(categoryId: string): string {
    return categories.find((cat) => cat.id === categoryId)?.color || '#64748B';
  }

  // Modal: Add/Edit Budget Form (simplified for demo)
  function BudgetFormModal() {
    const [amount, setAmount] = useState(budgetModal.budget?.amount || 0);
    const [categoryId, setCategoryId] = useState(budgetModal.budget?.categoryId || '');
    const [period, setPeriod] = useState(budgetModal.budget?.period || 'monthly');
    const [startDate, setStartDate] = useState(budgetModal.budget?.startDate || dateRange.startDate);
    const [endDate, setEndDate] = useState(budgetModal.budget?.endDate || dateRange.endDate);
    const [notes, setNotes] = useState(budgetModal.budget?.notes || '');

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
        if (budgetModal.type === 'add') {
          addBudget({
            categoryId,
            amount,
            period,
            startDate,
            endDate,
            notes,
          });
          toast.show('success', 'Budget added.');
        } else if (budgetModal.type === 'edit' && budgetModal.budget) {
          updateBudget(budgetModal.budget.id, {
            categoryId,
            amount,
            period,
            startDate,
            endDate,
            notes,
          });
          toast.show('success', 'Budget updated.');
        }
        setBudgetModal({ open: false, type: null, budget: undefined });
        setLoading(false);
      }, 600); // Simulate async
    }

    return (
      <Dialog open={budgetModal.open} onOpenChange={(open) => setBudgetModal({ ...budgetModal, open })}>
        <Dialog.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Dialog.Title>
              {budgetModal.type === 'add' ? 'Add Budget' : 'Edit Budget'}
            </Dialog.Title>
            <Select
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categories
                .filter((cat) => cat.type === 'expense')
                .map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
              required
            />
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              max={1_000_000_000}
              required
            />
            <Select
              label="Period"
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'yearly', label: 'Yearly' },
                { value: 'custom', label: 'Custom' },
              ]}
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <Input
              label="Notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={512}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBudgetModal({ open: false, type: null, budget: undefined })}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                disabled={loading || !categoryId || amount <= 0}
              >
                {budgetModal.type === 'add' ? 'Add Budget' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog>
    );
  }

  // Render: Empty state if no budgets
  if (!budgets.length) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <EmptyState
          title="No Budgets Yet"
          description="Set up budgets to track your spending and stay on top of your goals."
          icon={<BarChart2 className="w-12 h-12 text-brand" />}
          actions={
            <Button variant="brand" onClick={handleAddBudget}>
              <Plus className="mr-2" /> Add Budget
            </Button>
          }
        />
        <BudgetFormModal />
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
  }

  // Render: Budgets page
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-brand mb-1">Budgets</h1>
          <p className="text-neutral-500 dark:text-neutral-300">
            Track your spending against your budgets. Stay on top of your financial goals.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="brand" onClick={handleAddBudget}>
            <Plus className="mr-2" /> Add Budget
          </Button>
          <Button variant="danger" onClick={handleClearBudgets}>
            <Trash2 className="mr-2" /> Clear All
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">Date Range:</span>
        <Select
          value={dateRange.preset}
          onChange={setPreset}
          options={presets.map((p) => ({ value: p.key, label: p.label }))}
        />
        {isCustom && (
          <>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setCustomRange(e.target.value, dateRange.endDate)}
              className="w-32"
            />
            <span className="mx-1">to</span>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setCustomRange(dateRange.startDate, e.target.value)}
              className="w-32"
            />
          </>
        )}
      </div>

      {/* Overall Budget Progress */}
      <Card className="mb-8 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
            Overall Budgeted
          </div>
          <CurrencyDisplay value={overall.totalBudgeted} className="text-2xl font-bold text-brand" />
          <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-300">
            Spent: <CurrencyDisplay value={overall.totalSpent} /> &nbsp;|&nbsp;
            Remaining: <CurrencyDisplay value={overall.totalRemaining} />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <ProgressBar
            value={overall.percentUsed}
            max={100}
            color="brand"
            className="w-64 h-4"
            label={`${overall.percentUsed.toFixed(1)}% used`}
          />
          <PercentageBadge
            value={overall.percentUsed}
            className="mt-2"
          />
        </div>
      </Card>

      {/* Per-Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {perBudget.map((bp) => (
          <Card key={bp.budget.id} className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'bg-gradient-to-br',
                  bp.category?.color ? '' : 'bg-neutral-200',
                )}
                style={{
                  backgroundColor: getCategoryColor(bp.budget.categoryId),
                }}
                aria-label={bp.category?.name}
              >
                {/* Optionally render category icon */}
                {bp.category?.icon && (
                  <span className="text-white text-lg">
                    {/* Icon rendering can be improved with dynamic import */}
                    <PieChart className="w-5 h-5" />
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold text-neutral-700 dark:text-neutral-200">
                  {bp.category?.name || 'Unknown'}
                </div>
                <div className="text-xs text-neutral-400">
                  {bp.budget.period.charAt(0).toUpperCase() + bp.budget.period.slice(1)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500 dark:text-neutral-300 mb-1">
                Budgeted: <CurrencyDisplay value={bp.budget.amount} />
              </div>
              <ProgressBar
                value={bp.percent}
                max={100}
                color={bp.category?.color || 'brand'}
                className="w-full h-3"
                label={`${bp.percent.toFixed(1)}% used`}
              />
              <div className="flex justify-between mt-2 text-xs text-neutral-500 dark:text-neutral-300">
                <span>Spent: <CurrencyDisplay value={bp.spent} /></span>
                <span>Remaining: <CurrencyDisplay value={bp.remaining} /></span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEditBudget(bp.budget)}
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteBudget(bp.budget)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Budget History Chart */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-6 h-6 text-brand" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">Budget History</span>
        </div>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="expense" fill="#3B82F6">
                {barData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color || '#3B82F6'} />
                ))}
              </Bar>
              <Bar dataKey="income" fill="#22C55E">
                {barData.map((entry, idx) => (
                  <Cell key={`cell-income-${idx}`} fill={entry.color || '#22C55E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Modals and dialogs */}
      <BudgetFormModal />
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

export default BudgetsPage;