import React, { useEffect, useRef } from 'react';
import { cn } from 'src/lib/utils';
import { LucideIcon, Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

/************************************************************
 * src/components/ui/Toast.tsx
 * Vault - Toast notifications for user feedback, errors, and warnings.
 * - Accessible, animated, and dismissible.
 * - Supports info, success, warning, error types.
 * - Uses ARIA live region for accessibility.
 ************************************************************/

/**
 * ToastType - Enum for toast notification types.
 */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * ToastProps - Props for Toast component.
 */
export interface ToastProps {
  open: boolean;
  type?: ToastType;
  message: string;
  onClose?: () => void;
  duration?: number; // ms, default: 4000
  className?: string;
}

/**
 * Icon mapping for toast types.
 */
const TOAST_ICON_MAP: Record<ToastType, LucideIcon> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

/**
 * Color mapping for toast types (Tailwind theme keys).
 */
const TOAST_COLOR_MAP: Record<ToastType, string> = {
  info: 'bg-info-light text-info-dark border-info',
  success: 'bg-success-light text-success-dark border-success',
  warning: 'bg-warning-light text-warning-dark border-warning',
  error: 'bg-error-light text-error-dark border-error',
};

/**
 * Toast - Accessible, animated toast notification.
 * - Appears at bottom right (desktop) or top (mobile).
 * - Dismisses automatically after duration or on close.
 * - Uses ARIA live region for accessibility.
 */
const Toast: React.FC<ToastProps> = ({
  open,
  type = 'info',
  message,
  onClose,
  duration = 4000,
  className,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);

  // Auto-dismiss after duration
  useEffect(() => {
    if (open && duration > 0) {
      timerRef.current = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    // Cleanup timer if closed
    if (!open && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [open, duration, onClose]);

  // Accessibility: focus toast when opened
  useEffect(() => {
    if (open && toastRef.current) {
      toastRef.current.focus();
    }
  }, [open]);

  // Hide if not open
  if (!open) return null;

  const Icon = TOAST_ICON_MAP[type];
  const colorClasses = TOAST_COLOR_MAP[type];

  return (
    <div
      ref={toastRef}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'fixed z-toast max-w-xs w-full sm:max-w-sm rounded-lg shadow-lg flex items-center gap-3 px-4 py-3 border transition-all duration-300 fade-in slide-up',
        colorClasses,
        // Position: bottom right on desktop, top center on mobile
        'bottom-6 right-6 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:translate-x-0',
        'top-4 left-1/2 sm:left-auto sm:top-auto sm:translate-x-0',
        'transform -translate-x-1/2 sm:transform-none',
        className
      )}
      style={{
        outline: 'none',
      }}
    >
      {/* Icon */}
      <span className="flex-shrink-0">
        <Icon
          className={cn(
            'w-5 h-5',
            type === 'info' && 'text-info-dark',
            type === 'success' && 'text-success-dark',
            type === 'warning' && 'text-warning-dark',
            type === 'error' && 'text-error-dark'
          )}
          aria-hidden="true"
        />
      </span>
      {/* Message */}
      <span className="flex-1 text-sm font-medium" data-testid="toast-message">
        {message}
      </span>
      {/* Close button */}
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onClose}
          className={cn(
            'ml-2 p-1 rounded-full hover:bg-neutral-200 focus:bg-neutral-300 focus:outline-none transition-colors',
            'dark:hover:bg-neutral-700 dark:focus:bg-neutral-800'
          )}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Toast;