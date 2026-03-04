import React from 'react';
import { cn } from 'src/lib/utils';
import { Loader2 } from 'lucide-react';

/************************************************************
 * Button.tsx
 * Vault - Reusable Button component with variants, loading, and accessibility.
 * - Supports variants: primary, secondary, ghost, danger
 * - Handles loading state, disabled, full-width, icon, and accessibility
 * - Composable for forms, dialogs, and navigation
 ************************************************************/

/**
 * ButtonVariant - Supported visual variants for Button.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * ButtonSize - Supported sizes for Button.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * ButtonProps - Props for the Button component.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Variant classnames map.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand shadow-md',
  secondary:
    'bg-neutral-100 text-brand hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-brand shadow-sm',
  ghost:
    'bg-transparent text-brand hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-brand',
  danger:
    'bg-error text-white hover:bg-error-dark focus-visible:ring-2 focus-visible:ring-error shadow-md',
};

/**
 * Size classnames map.
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-5 py-3 text-lg rounded-xl',
};

/**
 * Loader spinner for loading state.
 */
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2
    className={cn('animate-spin mr-2 h-5 w-5 text-current', className)}
    aria-hidden="true"
  />
);

/**
 * Button - Reusable design system button.
 * - Handles variants, loading, icon, accessibility, and fullWidth.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Accessibility: loading disables button, adds aria-busy
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        {...props}
      >
        {/* Loading spinner (left) */}
        {loading && <Spinner />}
        {/* Icon (left, if not loading) */}
        {!loading && icon && (
          <span className="mr-2 flex items-center">{icon}</span>
        )}
        {/* Children (label) */}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;