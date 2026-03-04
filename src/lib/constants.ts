/************************************************************
 * src/lib/constants.ts
 * Vault - Static constants for categories, colors, presets, and config.
 * Used for seeding, config, and UI options.
 ************************************************************/

import { CategoryType, DateRangePreset } from 'src/types/index';

// ---------- Default Categories ----------

/**
 * DEFAULT_CATEGORIES - Preset categories for initial app seed.
 * - id: string (unique, e.g., 'groceries')
 * - name: string
 * - type: CategoryType ('expense', 'income', 'savings')
 * - color: string (theme key or hex)
 * - icon: string (lucide-react icon name)
 */
export const DEFAULT_CATEGORIES = [
  {
    id: 'groceries',
    name: 'Groceries',
    type: 'expense' as CategoryType,
    color: 'category.groceries',
    icon: 'ShoppingCart',
    isPreset: true,
  },
  {
    id: 'bills',
    name: 'Bills',
    type: 'expense' as CategoryType,
    color: 'category.bills',
    icon: 'Receipt',
    isPreset: true,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    type: 'expense' as CategoryType,
    color: 'category.entertainment',
    icon: 'Gamepad',
    isPreset: true,
  },
  {
    id: 'travel',
    name: 'Travel',
    type: 'expense' as CategoryType,
    color: 'category.travel',
    icon: 'Plane',
    isPreset: true,
  },
  {
    id: 'health',
    name: 'Health',
    type: 'expense' as CategoryType,
    color: 'category.health',
    icon: 'HeartPulse',
    isPreset: true,
  },
  {
    id: 'savings',
    name: 'Savings',
    type: 'savings' as CategoryType,
    color: 'category.savings',
    icon: 'PiggyBank',
    isPreset: true,
  },
  {
    id: 'salary',
    name: 'Salary',
    type: 'income' as CategoryType,
    color: 'brand',
    icon: 'Coins',
    isPreset: true,
  },
  {
    id: 'other',
    name: 'Other',
    type: 'expense' as CategoryType,
    color: 'category.other',
    icon: 'Circle',
    isPreset: true,
  },
];

// ---------- Category Color Map ----------

/**
 * CATEGORY_COLOR_MAP - Maps category id to theme color key or hex.
 */
export const CATEGORY_COLOR_MAP: Record<string, string> = {
  groceries: '#F59E42',
  bills: '#A78BFA',
  entertainment: '#F472B6',
  travel: '#38BDF8',
  health: '#22C55E',
  savings: '#FACC15',
  salary: '#3B82F6',
  other: '#64748B',
};

// ---------- Category Icon Map ----------

/**
 * CATEGORY_ICON_MAP - Maps category id to lucide-react icon name.
 */
export const CATEGORY_ICON_MAP: Record<string, string> = {
  groceries: 'ShoppingCart',
  bills: 'Receipt',
  entertainment: 'Gamepad',
  travel: 'Plane',
  health: 'HeartPulse',
  savings: 'PiggyBank',
  salary: 'Coins',
  other: 'Circle',
};

// ---------- Chart Color Palette ----------

/**
 * CHART_COLORS - Array of color hexes for charts (pie, bar, etc.).
 * - Matches category colors, then cycles through brand/accent.
 */
export const CHART_COLORS = [
  '#3B82F6', // brand blue
  '#F472B6', // accent pink
  '#A78BFA', // bills purple
  '#F59E42', // groceries orange
  '#22C55E', // health green
  '#FACC15', // savings yellow
  '#38BDF8', // travel sky
  '#64748B', // other neutral
  '#EF4444', // error red
  '#FDE68A', // warning yellow
  '#4ADE80', // success green
];

// ---------- Supported Currencies ----------

/**
 * SUPPORTED_CURRENCIES - List of supported currency codes and symbols.
 * - Used for currency selection and formatting.
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CHF', symbol: '₣', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

/**
 * DEFAULT_CURRENCY - App default currency (can be overridden in settings).
 */
export const DEFAULT_CURRENCY = 'USD';

// ---------- Date Range Presets ----------

/**
 * DATE_RANGE_PRESETS - Dashboard/filter date range options.
 */
export const DATE_RANGE_PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisQuarter', label: 'This Quarter' },
  { key: 'lastQuarter', label: 'Last Quarter' },
  { key: 'thisYear', label: 'This Year' },
  { key: 'lastYear', label: 'Last Year' },
  { key: 'custom', label: 'Custom Range' },
];

// ---------- Storage Quota Constants ----------

/**
 * STORAGE_MAX_BYTES - Maximum allowed bytes for localStorage persistence.
 * - Used for quota calculation and warnings.
 * - Typical browser localStorage limit is ~5MB (5 * 1024 * 1024).
 */
export const STORAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * STORAGE_WARNING_PERCENT - Threshold for quota warning.
 */
export const STORAGE_WARNING_PERCENT = 80; // Warn at 80%

/**
 * STORAGE_CRITICAL_PERCENT - Threshold for quota critical/error.
 */
export const STORAGE_CRITICAL_PERCENT = 95; // Critical at 95%

// ---------- App Version Constant ----------

/**
 * VAULT_APP_VERSION - Current app version for export/import and migrations.
 */
export const VAULT_APP_VERSION = '1.0.0';

// ---------- Miscellaneous Constants ----------

/**
 * MIN_TRANSACTION_AMOUNT - Minimum allowed transaction amount.
 */
export const MIN_TRANSACTION_AMOUNT = 0.01;

/**
 * MAX_TRANSACTION_AMOUNT - Maximum allowed transaction amount.
 */
export const MAX_TRANSACTION_AMOUNT = 1000000;

/**
 * MIN_BUDGET_AMOUNT - Minimum allowed budget amount.
 */
export const MIN_BUDGET_AMOUNT = 1;

/**
 * MAX_BUDGET_AMOUNT - Maximum allowed budget amount.
 */
export const MAX_BUDGET_AMOUNT = 1000000;

/**
 * MIN_SAVINGS_GOAL_AMOUNT - Minimum allowed savings goal target.
 */
export const MIN_SAVINGS_GOAL_AMOUNT = 1;

/**
 * MAX_SAVINGS_GOAL_AMOUNT - Maximum allowed savings goal target.
 */
export const MAX_SAVINGS_GOAL_AMOUNT = 10000000;