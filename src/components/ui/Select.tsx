import React from 'react';
import * as RadixSelect from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from 'src/lib/utils';

/************************************************************
 * src/components/ui/Select.tsx
 * Vault - Accessible, styled Select component.
 * - Wraps Radix UI DropdownMenu for accessibility and keyboard navigation.
 * - Custom styling, variants, and error handling.
 * - Used for category, currency, filter, and settings dropdowns.
 ************************************************************/

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  /** Options for the select dropdown */
  options: SelectOption[];
  /** Selected value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Optional label for accessibility */
  label?: string;
  /** Optional placeholder when no value selected */
  placeholder?: string;
  /** Optional error message for validation */
  error?: string;
  /** Optional helper text */
  helperText?: string;
  /** Optional className for custom styling */
  className?: string;
  /** Optional disabled flag */
  disabled?: boolean;
  /** Optional id for accessibility */
  id?: string;
  /** Optional aria-describedby for accessibility */
  ariaDescribedBy?: string;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}

/**
 * Select - Accessible dropdown/select component.
 * - Keyboard and screen-reader accessible.
 * - Custom styling and error handling.
 */
const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  error,
  helperText,
  className,
  disabled = false,
  id,
  ariaDescribedBy,
  ariaLabel,
}) => {
  // Find selected option for display
  const selectedOption = options.find((opt) => opt.value === value);

  // Generate unique id for accessibility if not provided
  const selectId = id || `select-${Math.random().toString(36).substr(2, 8)}`;

  // aria-label logic
  const computedAriaLabel = ariaLabel || label || placeholder;

  // Render
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            'block text-sm font-medium mb-1',
            error ? 'text-error' : 'text-neutral-700 dark:text-neutral-200'
          )}
        >
          {label}
        </label>
      )}
      <RadixSelect.Root
        open={undefined}
        onOpenChange={undefined}
        // Radix DropdownMenu doesn't use controlled open for Select
      >
        <RadixSelect.Trigger
          id={selectId}
          aria-label={computedAriaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={!!error}
          disabled={disabled}
          className={cn(
            'relative w-full flex items-center justify-between px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-base text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand transition',
            error && 'border-error focus:ring-error',
            disabled && 'opacity-60 cursor-not-allowed',
            'min-h-[40px]'
          )}
        >
          <span className={cn('truncate')}>
            {selectedOption ? selectedOption.label : (
              <span className="text-neutral-400">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className="ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-300"
            aria-hidden="true"
          />
        </RadixSelect.Trigger>
        <RadixSelect.Content
          className={cn(
            'z-dropdown min-w-[180px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg p-1',
            'animate-fadeIn'
          )}
          sideOffset={4}
        >
          {options.map((opt) => (
            <RadixSelect.Item
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              onSelect={() => !opt.disabled && onChange(opt.value)}
              className={cn(
                'flex items-center px-3 py-2 rounded-md cursor-pointer text-base transition-colors',
                'hover:bg-brand/15 focus:bg-brand/20 focus:outline-none',
                opt.disabled && 'opacity-50 cursor-not-allowed',
                value === opt.value && 'bg-brand/10 font-semibold'
              )}
              aria-disabled={opt.disabled}
            >
              <span className="truncate">{opt.label}</span>
            </RadixSelect.Item>
          ))}
        </RadixSelect.Content>
      </RadixSelect.Root>
      {(helperText || error) && (
        <div
          className={cn(
            'mt-1 text-xs',
            error ? 'text-error' : 'text-neutral-500 dark:text-neutral-300'
          )}
          id={ariaDescribedBy}
        >
          {error ? error : helperText}
        </div>
      )}
    </div>
  );
};

export default Select;