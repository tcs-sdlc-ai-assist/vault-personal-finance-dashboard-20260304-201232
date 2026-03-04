import React from 'react';
import { cn } from 'src/lib/utils';
import { formatDate, formatDateTime } from 'src/lib/formatters';

/************************************************************
 * DateDisplay.tsx
 * Vault - Component for displaying formatted dates with accessibility support.
 * - Accepts ISO string or Date object.
 * - Supports custom format, tooltip, and semantic markup.
 * - Accessible: uses <time> element with datetime attribute.
 ************************************************************/

export interface DateDisplayProps {
  /**
   * date - ISO 8601 string or Date object to display.
   */
  date: string | Date;

  /**
   * format - Optional format string (date-fns format).
   * Default: 'MMM d, yyyy'
   */
  format?: string;

  /**
   * showTime - If true, show time as well (uses 'MMM d, yyyy HH:mm').
   */
  showTime?: boolean;

  /**
   * tooltip - If true, show full ISO date/time as tooltip.
   */
  tooltip?: boolean;

  /**
   * className - Optional additional class names.
   */
  className?: string;

  /**
   * ariaLabel - Optional aria-label for accessibility.
   */
  ariaLabel?: string;
}

/**
 * DateDisplay
 * - Displays a formatted date (and optionally time) in a semantic <time> element.
 * - Adds tooltip and accessibility attributes as needed.
 */
const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format,
  showTime = false,
  tooltip = false,
  className,
  ariaLabel,
}) => {
  // Parse date to Date object and ISO string
  let parsedDate: Date;
  let isoString: string;

  if (typeof date === 'string') {
    parsedDate = new Date(date);
    isoString = date;
  } else {
    parsedDate = date;
    isoString = parsedDate.toISOString();
  }

  // Fallback for invalid date
  if (isNaN(parsedDate.getTime())) {
    return (
      <span className={cn('text-neutral-400 italic', className)} aria-label="Invalid date">
        Invalid date
      </span>
    );
  }

  // Format date for display
  let displayValue: string;
  if (showTime) {
    displayValue = formatDateTime(parsedDate, format || 'MMM d, yyyy HH:mm');
  } else {
    displayValue = formatDate(parsedDate, format || 'MMM d, yyyy');
  }

  // Tooltip content
  const tooltipContent = tooltip ? isoString : undefined;

  return (
    <time
      dateTime={isoString}
      className={cn(
        'text-neutral-700 dark:text-neutral-200 font-mono',
        'whitespace-nowrap',
        className
      )}
      title={tooltipContent}
      aria-label={ariaLabel || displayValue}
    >
      {displayValue}
    </time>
  );
};

export default DateDisplay;