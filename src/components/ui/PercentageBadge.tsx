import React from 'react';
import { cn } from 'src/lib/utils';
import { formatPercentage } from 'src/lib/formatters';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/************************************************************
 * PercentageBadge.tsx
 * Vault - Badge for displaying percentage change with arrow indicator.
 * - Used in KPIs and analytics widgets.
 * - Shows up/down/neutral arrow, color-coded for positive/negative/zero.
 ************************************************************/

/**
 * PercentageBadge Props
 * @param value Percentage value (number, e.g., 12.5 or -8.3)
 * @param decimals Number of decimal places (default: 2)
 * @param className Optional className for styling
 * @param showSign Whether to show "+" for positive values (default: true)
 * @param ariaLabel Optional aria-label for accessibility
 */
export interface PercentageBadgeProps {
  value: number;
  decimals?: number;
  className?: string;
  showSign?: boolean;
  ariaLabel?: string;
}

/**
 * PercentageBadge
 * - Displays a badge with percentage value and arrow indicator.
 * - Positive: green, up arrow; Negative: red, down arrow; Zero: neutral, minus.
 * - Accessible and responsive.
 */
const PercentageBadge: React.FC<PercentageBadgeProps> = ({
  value,
  decimals = 2,
  className,
  showSign = true,
  ariaLabel,
}) => {
  // Determine badge type
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  // Format percentage string
  const formatted = formatPercentage(value, decimals);

  // Sign prefix
  const sign = showSign && isPositive ? '+' : '';

  // Color classes
  const colorClass = isPositive
    ? 'bg-success/15 text-success-dark'
    : isNegative
    ? 'bg-error/15 text-error-dark'
    : 'bg-neutral-200 text-neutral-600';

  // Icon
  let Icon: React.FC<{ className?: string }> = Minus;
  if (isPositive) Icon = ArrowUpRight;
  else if (isNegative) Icon = ArrowDownRight;

  // Accessible label
  const computedAriaLabel =
    ariaLabel ||
    (isPositive
      ? `Increase of ${formatted}`
      : isNegative
      ? `Decrease of ${formatted}`
      : `No change`);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium select-none',
        colorClass,
        className
      )}
      aria-label={computedAriaLabel}
      role="status"
    >
      <Icon
        className={cn(
          'w-4 h-4',
          isPositive && 'text-success-dark',
          isNegative && 'text-error-dark',
          isZero && 'text-neutral-500'
        )}
        aria-hidden="true"
      />
      <span>
        {sign}
        {formatted}
      </span>
    </span>
  );
};

export default PercentageBadge;