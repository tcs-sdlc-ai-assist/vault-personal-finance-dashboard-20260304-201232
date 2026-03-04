import React from 'react';
import { cn } from 'src/lib/utils';
import useCurrency from 'src/hooks/useCurrency';

/************************************************************
 * CurrencyDisplay.tsx
 * Vault - Currency value display component.
 * - Displays formatted currency values with symbol, color coding, and accessibility.
 * - Supports positive/negative coloring, custom currency, and optional label.
 ************************************************************/

/**
 * CurrencyDisplay Props
 */
export interface CurrencyDisplayProps {
  value: number;
  currencyCode?: string; // Optional override (defaults to app default)
  locale?: string; // Optional locale (defaults to browser)
  showSymbol?: boolean; // Show currency symbol (default: true)
  showCode?: boolean; // Show currency code (default: false)
  label?: string; // Optional label (e.g., "Total")
  className?: string; // Custom className for styling
  colorMode?: 'auto' | 'neutral' | 'success' | 'error' | 'brand'; // Color coding mode
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Font size
  bold?: boolean; // Bold font
  ariaLabel?: string; // Custom aria-label for accessibility
}

/**
 * CurrencyDisplay
 * - Displays a formatted currency value with symbol and color coding.
 * - Color coding: green for positive, red for negative, neutral for zero.
 * - Accessible: aria-label, visually hidden label, semantic markup.
 */
const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  value,
  currencyCode,
  locale,
  showSymbol = true,
  showCode = false,
  label,
  className,
  colorMode = 'auto',
  size = 'md',
  bold = false,
  ariaLabel,
}) => {
  // Currency info and formatter
  const { symbol, code, format } = useCurrency(currencyCode, locale);

  // Determine color class based on value and colorMode
  let colorClass = '';
  if (colorMode === 'auto') {
    if (value > 0) colorClass = 'text-success';
    else if (value < 0) colorClass = 'text-error';
    else colorClass = 'text-neutral-500';
  } else if (colorMode === 'success') {
    colorClass = 'text-success';
  } else if (colorMode === 'error') {
    colorClass = 'text-error';
  } else if (colorMode === 'brand') {
    colorClass = 'text-brand';
  } else {
    colorClass = 'text-neutral-500';
  }

  // Font size class
  const sizeClass =
    size === 'sm'
      ? 'text-sm'
      : size === 'md'
      ? 'text-base'
      : size === 'lg'
      ? 'text-lg'
      : size === 'xl'
      ? 'text-xl'
      : 'text-base';

  // Bold font
  const fontClass = bold ? 'font-bold' : 'font-medium';

  // Accessibility: aria-label
  const computedAriaLabel =
    ariaLabel ||
    (label
      ? `${label}: ${format(value)}`
      : format(value));

  // Render
  return (
    <span
      className={cn(
        'inline-flex items-baseline',
        colorClass,
        sizeClass,
        fontClass,
        className
      )}
      aria-label={computedAriaLabel}
      title={format(value)}
      tabIndex={-1}
    >
      {/* Optional label (visually hidden for screen readers) */}
      {label && (
        <span className="sr-only">{label}: </span>
      )}
      {/* Currency symbol */}
      {showSymbol && (
        <span aria-hidden="true" className="mr-0.5">
          {symbol}
        </span>
      )}
      {/* Formatted value */}
      <span aria-hidden="true">
        {Math.abs(value).toLocaleString(locale || undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      {/* Currency code (optional) */}
      {showCode && (
        <span aria-hidden="true" className="ml-1 text-xs text-neutral-400">
          {code}
        </span>
      )}
    </span>
  );
};

export default CurrencyDisplay;