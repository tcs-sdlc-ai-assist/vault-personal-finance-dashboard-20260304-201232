import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from 'src/lib/utils';

/************************************************************
 * Input.tsx
 * Vault - Reusable input field for forms.
 * - Supports text, number, password, email, etc.
 * - Accessible, composable, and styled for design system.
 * - Includes error, disabled, icon, and helper text support.
 ************************************************************/

/**
 * InputProps
 * - Extends native input props.
 * - Adds label, error, helperText, icon, and variant.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'glass';
  className?: string;
  inputClassName?: string;
}

/**
 * Input
 * - Reusable, accessible input field.
 * - Supports label, error, helper text, icon, and variants.
 * - For use in forms, dialogs, and settings.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      variant = 'default',
      className,
      inputClassName,
      id,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate unique id if not provided (for accessibility)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const describedBy = error
      ? `${inputId}-error`
      : helperText
      ? `${inputId}-helper`
      : undefined;

    // Variant styles
    const variantStyles = {
      default:
        'bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:border-brand focus:ring-2 focus:ring-brand text-neutral-900 dark:text-neutral-50',
      outline:
        'bg-transparent border border-brand focus:border-brand-dark focus:ring-2 focus:ring-brand text-neutral-900 dark:text-neutral-50',
      glass:
        'glass border border-neutral-200 dark:border-neutral-700 focus:border-brand focus:ring-2 focus:ring-brand text-neutral-900 dark:text-neutral-50',
    };

    // Error styles
    const errorStyles =
      'border-error focus:border-error focus:ring-error text-error placeholder:text-error';

    // Disabled styles
    const disabledStyles =
      'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900';

    return (
      <div className={cn('w-full flex flex-col gap-xs', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-200',
              disabled && 'opacity-60'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none',
                disabled && 'opacity-50'
              )}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              'w-full transition-colors duration-200 rounded-md px-3 py-2 text-base outline-none',
              icon && 'pl-10',
              variantStyles[variant],
              error && errorStyles,
              disabled && disabledStyles,
              inputClassName
            )}
            {...props}
          />
        </div>
        {/* Helper/Error text */}
        {(error || helperText) && (
          <div
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            className={cn(
              'mt-1 text-xs',
              error
                ? 'text-error'
                : 'text-neutral-500 dark:text-neutral-400'
            )}
            role={error ? 'alert' : undefined}
            aria-live={error ? 'assertive' : undefined}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;