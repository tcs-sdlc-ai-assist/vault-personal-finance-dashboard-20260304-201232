import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { cn } from 'src/lib/utils';
import { Button } from 'src/components/ui/Button';
import { Dialog } from 'src/components/ui/Dialog';
import { X } from 'lucide-react';

/************************************************************
 * ConfirmDialog.tsx
 * Vault - Reusable confirmation modal for destructive actions.
 * - Used for delete, clear, and other irreversible actions.
 * - Accessible, animated, and customizable.
 ************************************************************/

/**
 * ConfirmDialogProps
 * - open: Whether the dialog is open
 * - title: Dialog title
 * - description: Dialog description (optional)
 * - confirmLabel: Confirm button label (default: "Confirm")
 * - cancelLabel: Cancel button label (default: "Cancel")
 * - onConfirm: Callback for confirm action
 * - onCancel: Callback for cancel/close action
 */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * ConfirmDialog
 * - Accessible confirmation modal for destructive actions.
 * - Uses Radix Dialog for accessibility and focus management.
 * - Animates in/out, disables confirm button while loading.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  className,
}) => {
  // Internal state for loading (optional, can be extended)
  const [loading, setLoading] = React.useState(false);

  // Handle confirm action
  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (onConfirm) await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel/close action
  const handleCancel = () => {
    if (loading) return; // Prevent closing while loading
    if (onCancel) onCancel();
  };

  // Keyboard accessibility: Escape closes dialog
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line
  }, [open, loading, onCancel]);

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <RadixDialog.Content
        className={cn(
          'glass rounded-lg shadow-glass p-6 max-w-md w-full mx-auto fade-in slide-up',
          className
        )}
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        tabIndex={-1}
      >
        {/* Close button (top-right) */}
        <RadixDialog.Close
          asChild
          aria-label="Close"
          disabled={loading}
          className="absolute top-4 right-4"
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            tabIndex={0}
            disabled={loading}
          >
            <X className="w-5 h-5 text-neutral-500" />
          </Button>
        </RadixDialog.Close>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
          className="font-heading text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-2"
        >
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p
            id="confirm-dialog-desc"
            className="text-neutral-700 dark:text-neutral-200 mb-4"
          >
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
            aria-label={cancelLabel}
            tabIndex={0}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            aria-label={confirmLabel}
            tabIndex={0}
            autoFocus
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-neutral-300 border-t-brand rounded-full" />
                {confirmLabel}
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </RadixDialog.Content>
    </Dialog>
  );
};

export default ConfirmDialog;