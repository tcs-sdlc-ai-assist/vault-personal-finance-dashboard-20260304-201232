import React from 'react';
import { cn } from 'src/lib/utils';
import { formatCurrency, formatDate } from 'src/lib/formatters';
import { useCurrency } from 'src/hooks/useCurrency';

/************************************************************
 * ChartTooltip.tsx
 * Vault - Custom styled tooltip for Recharts visualizations.
 * - Accessible, animated, and theme-aware.
 * - Handles single and multi-series charts.
 * - Used in Pie, Area, Bar, and Line charts.
 ************************************************************/

/**
 * ChartTooltipProps
 * - Props passed from Recharts <Tooltip /> component.
 * - Matches Recharts payload shape.
 */
interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  formatter?: (value: any, name?: string, entry?: any, index?: number) => React.ReactNode;
  currencyCode?: string;
  className?: string;
}

/**
 * ChartTooltip
 * - Custom tooltip renderer for Recharts charts.
 * - Handles single/multi-series, currency formatting, and accessibility.
 */
const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
  currencyCode,
  className,
}) => {
  // Currency formatting hook
  const { format } = useCurrency(currencyCode);

  // Accessibility: aria-live for dynamic content
  if (!active || !payload || payload.length === 0) return null;

  // Determine if payload is multi-series (array of values)
  const isMultiSeries = payload.length > 1;

  // Try to infer if values are currency (by key or formatter)
  const isCurrency = (entry: any) =>
    entry && (
      entry.dataKey?.toLowerCase().includes('amount') ||
      entry.dataKey?.toLowerCase().includes('expense') ||
      entry.dataKey?.toLowerCase().includes('income') ||
      entry.dataKey?.toLowerCase().includes('net')
    );

  // Tooltip animation classes
  const tooltipAnim = 'fade-in slide-up';

  // Theme-aware styling
  const tooltipStyles = cn(
    'glass shadow-glass rounded-lg px-4 py-3 text-sm min-w-[180px] max-w-xs',
    'border border-neutral-200 dark:border-neutral-700',
    'bg-white/90 dark:bg-neutral-900/90',
    'text-neutral-700 dark:text-neutral-100',
    tooltipAnim,
    className
  );

  // Render label (date or category)
  const renderLabel = () => {
    if (typeof label === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
      // Date label
      return <div className="font-heading font-semibold mb-1">{formatDate(label)}</div>;
    }
    if (typeof label === 'string' && label.length > 0) {
      // Category or custom label
      return <div className="font-heading font-semibold mb-1">{label}</div>;
    }
    return null;
  };

  // Render payload rows
  const renderRows = () => {
    return payload.map((entry, idx) => {
      // Recharts payload shape: { value, name, color, dataKey, payload }
      const { value, name, color, dataKey } = entry;
      let displayValue: React.ReactNode = value;

      // Use custom formatter if provided
      if (formatter) {
        displayValue = formatter(value, name, entry, idx);
      } else if (isCurrency(entry)) {
        displayValue = format(value);
      } else if (typeof value === 'number') {
        displayValue = value.toLocaleString();
      }

      // Color indicator (for multi-series)
      const colorDot = color ? (
        <span
          className="inline-block w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: color, border: '1px solid #CBD5E1' }}
          aria-hidden="true"
        />
      ) : null;

      return (
        <div
          key={dataKey || name || idx}
          className={cn(
            'flex items-center justify-between gap-2 py-1',
            idx === 0 ? 'pt-0' : 'pt-1'
          )}
        >
          <div className="flex items-center">
            {colorDot}
            <span className="font-medium">{name || dataKey}</span>
          </div>
          <span className="font-mono text-right">{displayValue}</span>
        </div>
      );
    });
  };

  return (
    <div
      className={tooltipStyles}
      role="tooltip"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
    >
      {renderLabel()}
      <div>
        {renderRows()}
      </div>
    </div>
  );
};

export default ChartTooltip;