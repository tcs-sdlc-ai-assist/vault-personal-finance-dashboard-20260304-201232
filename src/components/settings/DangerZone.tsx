import React, { useState } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import Card from 'src/components/ui/Card';
import Button from 'src/components/ui/Button';
import ConfirmDialog from 'src/components/ui/ConfirmDialog';
import Toast from 'src/components/ui/Toast';
import { formatStorageSize } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';

/************************************************************
 * DangerZone.tsx
 * Vault - Settings section for clearing all data/reset.
 * - Provides destructive actions: clear transactions, categories, budgets, savings goals, recurring templates, or full reset.
 * - Double-confirmation modal for each action.
 * - Shows storage quota info.
 ************************************************************/

/**
 * DangerZone - Settings section for destructive actions.
 * - Handles clear/reset actions with double-confirmation.
 * - Shows quota info and warnings.
 */
const DangerZone: React.FC = () => {
  // Store actions
  const {
    clearTransactions,
    clearCategories,
    clearBudgets,
    clearSavingsGoals,
    clearRecurringTemplates,
    resetStore,
    quota,
    updateQuota,
  } = useFinanceStore();

  // UI store for confirm dialog and toast
  const { confirmDialog, toast } = useUIStore();

  // Local state for action in progress
  const [action, setAction] = useState<
    | null
    | 'clearTransactions'
    | 'clearCategories'
    | 'clearBudgets'
    | 'clearSavingsGoals'
    | 'clearRecurringTemplates'
    | 'resetStore'
  >(null);

  // Helper: Open confirm dialog for action
  const handleConfirm = (type: typeof action) => {
    setAction(type);

    let title = '';
    let description = '';
    let confirmLabel = '';
    let cancelLabel = 'Cancel';

    switch (type) {
      case 'clearTransactions':
        title = 'Clear All Transactions';
        description =
          'This will permanently delete all your transactions. This action cannot be undone.';
        confirmLabel = 'Delete All Transactions';
        break;
      case 'clearCategories':
        title = 'Clear All Categories';
        description =
          'This will delete all custom categories. Preset categories will remain. This action cannot be undone.';
        confirmLabel = 'Delete All Categories';
        break;
      case 'clearBudgets':
        title = 'Clear All Budgets';
        description =
          'This will delete all budgets. This action cannot be undone.';
        confirmLabel = 'Delete All Budgets';
        break;
      case 'clearSavingsGoals':
        title = 'Clear All Savings Goals';
        description =
          'This will delete all savings goals. This action cannot be undone.';
        confirmLabel = 'Delete All Savings Goals';
        break;
      case 'clearRecurringTemplates':
        title = 'Clear All Recurring Templates';
        description =
          'This will delete all recurring templates. This action cannot be undone.';
        confirmLabel = 'Delete All Recurring Templates';
        break;
      case 'resetStore':
        title = 'Reset Vault';
        description =
          'This will delete ALL your data and reset Vault to its initial state. This action cannot be undone.';
        confirmLabel = 'Reset Vault';
        break;
      default:
        break;
    }

    confirmDialog.show({
      title,
      description,
      confirmLabel,
      cancelLabel,
      onConfirm: () => handleAction(type),
      onCancel: () => setAction(null),
    });
  };

  // Helper: Perform action after confirmation
  const handleAction = (type: typeof action) => {
    switch (type) {
      case 'clearTransactions':
        clearTransactions();
        toast.show('success', 'All transactions cleared.');
        break;
      case 'clearCategories':
        clearCategories();
        toast.show('success', 'All categories cleared.');
        break;
      case 'clearBudgets':
        clearBudgets();
        toast.show('success', 'All budgets cleared.');
        break;
      case 'clearSavingsGoals':
        clearSavingsGoals();
        toast.show('success', 'All savings goals cleared.');
        break;
      case 'clearRecurringTemplates':
        clearRecurringTemplates();
        toast.show('success', 'All recurring templates cleared.');
        break;
      case 'resetStore':
        resetStore();
        toast.show('success', 'Vault has been reset.');
        break;
      default:
        break;
    }
    setAction(null);
    updateQuota();
    confirmDialog.close();
  };

  // Quota info
  const { usedBytes, maxBytes, percentUsed } = quota;

  return (
    <Card
      className={cn(
        'bg-error-light/15 border border-error-light rounded-lg p-6 mt-8',
        'shadow-glass'
      )}
      aria-label="Danger Zone"
    >
      <h2 className="font-heading text-error-dark text-xl mb-2">Danger Zone</h2>
      <p className="text-error-dark mb-4">
        These actions are <strong>destructive</strong> and cannot be undone. Please proceed with caution.
      </p>

      {/* Storage quota info */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <span className="text-sm font-mono text-error-dark">
            Storage Used:{' '}
            <span className="font-bold">{formatStorageSize(usedBytes)}</span> /{' '}
            <span>{formatStorageSize(maxBytes)}</span>
          </span>
          <span
            className={cn(
              'ml-2 px-2 py-1 rounded-full text-xs font-bold',
              percentUsed > 80
                ? 'bg-error-dark text-error-light'
                : percentUsed > 60
                ? 'bg-warning-dark text-warning-light'
                : 'bg-neutral-200 text-neutral-700'
            )}
          >
            {percentUsed.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Danger actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleConfirm('clearTransactions')}
          aria-label="Clear All Transactions"
        >
          Clear All Transactions
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleConfirm('clearCategories')}
          aria-label="Clear All Categories"
        >
          Clear All Categories
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleConfirm('clearBudgets')}
          aria-label="Clear All Budgets"
        >
          Clear All Budgets
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleConfirm('clearSavingsGoals')}
          aria-label="Clear All Savings Goals"
        >
          Clear All Savings Goals
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleConfirm('clearRecurringTemplates')}
          aria-label="Clear All Recurring Templates"
        >
          Clear All Recurring Templates
        </Button>
      </div>

      <div className="mt-4">
        <Button
          variant="destructive"
          className="w-full bg-error-dark hover:bg-error"
          onClick={() => handleConfirm('resetStore')}
          aria-label="Reset Vault"
        >
          <span className="font-bold">Reset Vault (Delete ALL Data)</span>
        </Button>
      </div>

      {/* ConfirmDialog is global via UIStore, but render here for accessibility */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />

      {/* Toast is global via UIStore, but render here for accessibility */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={toast.close}
      />
    </Card>
  );
};

export default DangerZone;