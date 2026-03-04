import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { cn } from 'src/lib/utils';

/************************************************************
 * Dialog.tsx
 * Vault - Accessible modal/dialog primitive.
 * - Wraps Radix UI Dialog for accessibility, focus management, and animation.
 * - Used for all modals, sheets, and popovers.
 * - Supports title, description, actions, and custom content.
 ************************************************************/

/**
 * DialogProps
 * - open: Whether the dialog is open
 * - onOpenChange: Callback for open state change
 * - title: Dialog title (optional)
 * - description: Dialog description (optional)
 * - children: Dialog content
 * - className: Custom className for content
 * - overlayClassName: Custom className for overlay
 * - closeOnOverlayClick: Whether clicking overlay closes dialog (default: true)
 * - showClose: Whether to show close button (default: true)
 * - closeLabel: Accessible label for close button
 */
export interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  showClose?: boolean;
  closeLabel?: string;
}

/**
 * Dialog
 * - Accessible modal/dialog primitive.
 * - Handles focus trap, ARIA, overlay, and close actions.
 */
const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  showClose = true,
  closeLabel = 'Close dialog',
}) => {
  // Generate unique IDs for ARIA
  const titleId = React.useId();
  const descId = React.useId();

  // Overlay click handler (optional)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlayClick) return;
    // Only close if clicked directly on overlay (not bubbled from content)
    if (e.target === e.currentTarget && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        {/* Overlay */}
        <RadixDialog.Overlay
          className={cn(
            'fixed inset-0 z-modal bg-overlay backdrop-blur-sm transition-opacity duration-300 fade-in',
            overlayClassName
          )}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Dialog Content */}
        <RadixDialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-modal max-w-lg w-full rounded-lg shadow-glass bg-glass p-6 transform -translate-x-1/2 -translate-y-1/2 outline-none fade-in slide-up',
            'focus-visible:ring-2 focus-visible:ring-brand',
            className
          )}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
        >
          {/* Title */}
          {title && (
            <RadixDialog.Title
              id={titleId}
              className="text-lg font-heading font-bold text-brand mb-2"
            >
              {title}
            </RadixDialog.Title>
          )}

          {/* Description */}
          {description && (
            <RadixDialog.Description
              id={descId}
              className="text-sm text-neutral-600 mb-4"
            >
              {description}
            </RadixDialog.Description>
          )}

          {/* Dialog Content */}
          <div>{children}</div>

          {/* Close Button */}
          {showClose && (
            <RadixDialog.Close
              className={cn(
                'absolute top-4 right-4 rounded-full p-2 bg-neutral-100 hover:bg-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-brand',
                'text-neutral-500 hover:text-brand cursor-pointer'
              )}
              aria-label={closeLabel}
              tabIndex={0}
            >
              {/* Lucide X icon (inline SVG for accessibility, no external dependency) */}
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M6.5 6.5l7 7M13.5 6.5l-7 7"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </RadixDialog.Close>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Dialog;