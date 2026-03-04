import React, { useState } from 'react';
import { Dialog } from 'src/components/ui/Dialog';
import Input from 'src/components/ui/Input';
import Button from 'src/components/ui/Button';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { SavingsGoal } from 'src/types/index';
import { formatCurrency } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';

/************************************************************
 * ContributeModal.tsx
 * Vault - Modal for contributing to a savings goal.
 * - Handles amount input, validation, and updates goal progress.
 * - Accessible, responsive, and provides feedback via toast.
 ************************************************************/

interface ContributeModalProps {
  open: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
}

/**
 * ContributeModal
 * - Modal for contributing to a savings goal.
 * - Validates amount, updates goal, and shows feedback.
 */
const ContributeModal: React.FC<ContributeModalProps> = ({
  open,
  goal,
  onClose,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const updateSavingsGoal = useFinanceStore((state) => state.updateSavingsGoal);
  const toast = useUIStore((state) => state.toast);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setAmount('');
      setError('');
      setLoading(false);
    }
  }, [open, goal]);

  if (!goal) return null;

  // Calculate remaining amount
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    setError('');
  };

  // Validate and submit contribution
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const parsedAmount = parseFloat(amount);

    // Validation
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      setLoading(false);
      return;
    }
    if (parsedAmount > remaining) {
      setError('Amount exceeds remaining goal.');
      setLoading(false);
      return;
    }

    // Update goal
    try {
      updateSavingsGoal(goal.id, {
        currentAmount: goal.currentAmount + parsedAmount,
        updatedAt: new Date().toISOString(),
        status:
          goal.currentAmount + parsedAmount >= goal.targetAmount
            ? 'completed'
            : goal.status,
      });
      toast.show(
        'success',
        `Contributed ${formatCurrency(parsedAmount)} to "${goal.name}".`
      );
      setLoading(false);
      onClose();
    } catch (err) {
      setError('Failed to contribute. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Contribute to "${goal.name}"`}
      description={`Add funds towards your savings goal.`}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Goal Target
            </span>
            <CurrencyDisplay value={goal.targetAmount} className="font-mono" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Current Saved
            </span>
            <CurrencyDisplay value={goal.currentAmount} className="font-mono" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Remaining
            </span>
            <CurrencyDisplay value={remaining} className="font-mono" />
          </div>
        </div>

        <Input
          label="Contribution Amount"
          type="number"
          min={1}
          max={remaining}
          step="0.01"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Enter amount"
          required
          autoFocus
          disabled={loading}
          className={cn(
            error ? 'border-error focus:border-error' : '',
            'w-full'
          )}
        />
        {error && (
          <div className="text-error text-sm mt-1">{error}</div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            disabled={loading || !amount}
            loading={loading}
          >
            Contribute
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ContributeModal;