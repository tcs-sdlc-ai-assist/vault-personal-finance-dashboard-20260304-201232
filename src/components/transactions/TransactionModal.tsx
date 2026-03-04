import React, { useEffect } from 'react';
import Dialog from 'src/components/ui/Dialog';
import Button from 'src/components/ui/Button';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Transaction, TransactionType } from 'src/types/index';
import { transactionSchema, TransactionFormData } from 'src/schemas/transactionSchema';
import { uuid } from 'src/lib/utils';
import { formatDateInput } from 'src/lib/formatters';
import TransactionForm from './TransactionForm';

/************************************************************
 * TransactionModal.tsx
 * Vault - Modal wrapper for TransactionForm.
 * - Handles add/edit flows, accessibility, and state management.
 * - Used for adding or editing a transaction.
 ************************************************************/

interface TransactionModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  transaction?: Transaction;
  onClose: () => void;
  onSuccess?: (tx: Transaction) => void;
}

/**
 * TransactionModal
 * - Modal dialog for adding/editing a transaction.
 * - Wraps TransactionForm, handles CRUD actions and accessibility.
 */
const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  mode,
  transaction,
  onClose,
  onSuccess,
}) => {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const categories = useFinanceStore((state) => state.categories);

  const showToast = useUIStore((state) => state.toast.show);

  // Accessibility: focus trap, close on escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prepare initial form values
  const initialValues: TransactionFormData = React.useMemo(() => {
    if (mode === 'edit' && transaction) {
      // Map Transaction to TransactionFormData
      return {
        ...transaction,
        amount: Math.abs(transaction.amount),
        description: transaction.description ?? '',
        notes: transaction.notes ?? '',
        recurringTemplateId: transaction.recurringTemplateId ?? '',
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      };
    }
    // Defaults for add mode
    return {
      type: 'expense',
      amount: 0,
      categoryId: categories[0]?.id ?? '',
      date: formatDateInput(new Date()),
      description: '',
      notes: '',
      recurringTemplateId: '',
    };
  }, [mode, transaction, categories]);

  // Handle form submit
  const handleSubmit = async (data: TransactionFormData) => {
    try {
      // Validate with Zod schema
      const parsed = transactionSchema.parse(data);

      if (mode === 'add') {
        addTransaction({
          ...parsed,
        });
        showToast('success', 'Transaction added successfully.');
      } else if (mode === 'edit' && transaction) {
        updateTransaction(transaction.id, {
          ...parsed,
        });
        showToast('success', 'Transaction updated successfully.');
      }
      // Callback for parent
      if (onSuccess) {
        // Compose Transaction object (with id for edit, generated for add)
        const tx: Transaction = {
          ...(mode === 'edit' && transaction
            ? { ...transaction, ...parsed }
            : {
                ...parsed,
                id: uuid(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
        };
        onSuccess(tx);
      }
      onClose();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save transaction.');
    }
  };

  // Modal title
  const modalTitle =
    mode === 'add'
      ? 'Add Transaction'
      : `Edit Transaction${transaction?.description ? `: ${transaction.description}` : ''}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      ariaLabel={modalTitle}
      className="max-w-lg w-full"
    >
      <div className="p-6">
        <h2 className="text-xl font-heading font-bold mb-4">{modalTitle}</h2>
        <TransactionForm
          initialValues={initialValues}
          categories={categories}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </Dialog>
  );
};

export default TransactionModal;