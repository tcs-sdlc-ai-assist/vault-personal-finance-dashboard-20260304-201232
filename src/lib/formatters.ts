/************************************************************
 * src/lib/formatters.ts
 * Vault - Formatting helpers for currency, dates, numbers, and percentages.
 * Used throughout components, hooks, and analytics.
 ************************************************************/

import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from './constants';
import { format, formatISO, parseISO, isValid } from 'date-fns';

/**
 * Format a number as currency string.
 * - Uses Intl.NumberFormat for locale-aware formatting.
 * - Falls back gracefully if currency code is not supported.
 * @param amount Number to format
 * @param currency Currency code (e.g., 'USD')
 * @param locale Optional locale (default: browser or 'en-US')
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale?: string
): string {
  // Find currency symbol for fallback
  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  const symbol = currencyInfo ? currencyInfo.symbol : '$';

  try {
    // Use browser locale if not specified
    const resolvedLocale = locale || navigator.language || 'en-US';
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    // Fallback: simple formatting
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format a number as a plain number string with thousands separator.
 * @param value Number to format
 * @param locale Optional locale (default: browser or 'en-US')
 * @param decimals Optional decimal places (default: 2)
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatNumber(
  value: number,
  locale?: string,
  decimals: number = 2
): string {
  try {
    const resolvedLocale = locale || navigator.language || 'en-US';
    return new Intl.NumberFormat(resolvedLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (err) {
    return value.toFixed(decimals);
  }
}

/**
 * Format a percentage value.
 * - Converts decimal to percentage if needed.
 * @param value Number to format (e.g., 0.123 or 12.3)
 * @param decimals Decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "12.3%")
 */
export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  // If value is between 0 and 1, treat as decimal
  const percent = value >= -1 && value <= 1 ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Format a date string for display.
 * - Accepts ISO 8601 string or Date object.
 * - Uses date-fns for formatting.
 * @param date Date object or ISO string
 * @param formatStr Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string (e.g., "Jan 1, 2024")
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'MMM d, yyyy'
): string {
  let parsed: Date;
  if (typeof date === 'string') {
    parsed = parseISO(date);
  } else {
    parsed = date;
  }
  if (!isValid(parsed)) return '';
  return format(parsed, formatStr);
}

/**
 * Format a date string for input fields (YYYY-MM-DD).
 * - Accepts ISO string or Date object.
 * @param date Date object or ISO string
 * @returns Formatted date string (e.g., "2024-01-01")
 */
export function formatDateInput(date: Date | string): string {
  let parsed: Date;
  if (typeof date === 'string') {
    parsed = parseISO(date);
  } else {
    parsed = date;
  }
  if (!isValid(parsed)) return '';
  return format(parsed, 'yyyy-MM-dd');
}

/**
 * Format a datetime string for display.
 * - Accepts ISO 8601 string or Date object.
 * - Uses date-fns for formatting.
 * @param date Date object or ISO string
 * @param formatStr Format string (default: 'MMM d, yyyy HH:mm')
 * @returns Formatted datetime string (e.g., "Jan 1, 2024 14:30")
 */
export function formatDateTime(
  date: Date | string,
  formatStr: string = 'MMM d, yyyy HH:mm'
): string {
  let parsed: Date;
  if (typeof date === 'string') {
    parsed = parseISO(date);
  } else {
    parsed = date;
  }
  if (!isValid(parsed)) return '';
  return format(parsed, formatStr);
}

/**
 * Format a storage size in bytes to human-readable string.
 * @param bytes Number of bytes
 * @returns Formatted size (e.g., "1.2 MB")
 */
export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format a relative date (e.g., "Today", "Yesterday", "3 days ago").
 * - Uses date-fns for calculation.
 * @param date Date object or ISO string
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string): string {
  let parsed: Date;
  if (typeof date === 'string') {
    parsed = parseISO(date);
  } else {
    parsed = date;
  }
  if (!isValid(parsed)) return '';
  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return format(parsed, 'MMM d, yyyy');
}

/**
 * Format a change value for analytics (e.g., "+12.3%", "-$123.45").
 * - Adds sign, color class, and formatted value.
 * @param value Number (positive or negative)
 * @param type 'currency' | 'percentage' | 'number'
 * @param currency Currency code (for currency type)
 * @returns { value: string, sign: '+' | '-', isPositive: boolean }
 */
export function formatChange(
  value: number,
  type: 'currency' | 'percentage' | 'number' = 'number',
  currency: string = DEFAULT_CURRENCY
): { value: string; sign: '+' | '-'; isPositive: boolean } {
  const isPositive = value >= 0;
  const sign = isPositive ? '+' : '-';
  let formatted: string;
  switch (type) {
    case 'currency':
      formatted = formatCurrency(Math.abs(value), currency);
      break;
    case 'percentage':
      formatted = formatPercentage(Math.abs(value));
      break;
    default:
      formatted = formatNumber(Math.abs(value));
      break;
  }
  return {
    value: `${sign}${formatted}`,
    sign,
    isPositive,
  };
}

/**
 * Format a recurrence label for recurring templates.
 * @param recurrence RecurrenceType
 * @returns Human-readable label (e.g., "Monthly", "Weekly")
 */
export function formatRecurrenceLabel(recurrence: string): string {
  switch (recurrence) {
    case 'none':
      return 'One-time';
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Biweekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    default:
      return 'Unknown';
  }
}

/**
 * Format a budget period label.
 * @param period BudgetPeriod
 * @returns Human-readable label (e.g., "Monthly", "Custom")
 */
export function formatBudgetPeriodLabel(period: string): string {
  switch (period) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    case 'custom':
      return 'Custom';
    default:
      return 'Unknown';
  }
}