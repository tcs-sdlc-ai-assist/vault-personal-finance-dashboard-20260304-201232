/************************************************************
 * src/types/index.ts
 * Vault - TypeScript interfaces and types for persisted and UI state.
 * Single source of truth for core entities and app state.
 ************************************************************/

// ---------- Transaction Types ----------

/**
 * TransactionType - Enum for transaction direction.
 * - 'expense': Money out
 * - 'income': Money in
 */
export type TransactionType = 'expense' | 'income';

/**
 * RecurrenceType - Enum for recurring transaction frequency.
 */
export type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

/**
 * Transaction - Core persisted entity for a financial record.
 */
export interface Transaction {
  id: string; // UUID
  type: TransactionType;
  amount: number; // Always positive, currency in user's default
  categoryId: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  description?: string;
  notes?: string;
  recurringTemplateId?: string; // If generated from a recurring template
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

// ---------- Category Types ----------

/**
 * CategoryType - Enum for category grouping.
 */
export type CategoryType = 'expense' | 'income' | 'savings';

/**
 * Category - User-defined or preset category for transactions/budgets.
 */
export interface Category {
  id: string; // UUID
  name: string;
  type: CategoryType;
  color: string; // Hex color or theme key
  icon?: string; // Optional icon name (e.g., from lucide-react)
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  isPreset?: boolean; // True if built-in/preset category
}

// ---------- Budget Types ----------

/**
 * BudgetPeriod - Enum for budget recurrence.
 */
export type BudgetPeriod =
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

/**
 * Budget - User-defined budget for a category and period.
 */
export interface Budget {
  id: string; // UUID
  categoryId: string;
  amount: number; // Budgeted amount (currency)
  period: BudgetPeriod;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  notes?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  isActive: boolean;
}

// ---------- Savings Goal Types ----------

/**
 * SavingsGoalStatus - Enum for goal progress.
 */
export type SavingsGoalStatus = 'active' | 'completed' | 'archived';

/**
 * SavingsGoal - User-defined savings goal.
 */
export interface SavingsGoal {
  id: string; // UUID
  name: string;
  targetAmount: number;
  currentAmount: number;
  categoryId?: string; // Optional category for goal
  startDate: string; // ISO 8601 date string
  endDate?: string; // Optional target date
  status: SavingsGoalStatus;
  notes?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

// ---------- Recurring Template Types ----------

/**
 * RecurringTemplate - Template for auto-generated recurring transactions.
 */
export interface RecurringTemplate {
  id: string; // UUID
  type: TransactionType;
  amount: number;
  categoryId: string;
  description?: string;
  notes?: string;
  recurrence: RecurrenceType;
  startDate: string; // ISO 8601 date string
  endDate?: string; // Optional end date
  lastGeneratedDate?: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  isActive: boolean;
}

// ---------- Import/Export Types ----------

/**
 * VaultExportData - Structure for exported app data (for backup/import).
 */
export interface VaultExportData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringTemplates: RecurringTemplate[];
  // Add more as needed (e.g., settings)
  version: string; // App version at export
  exportedAt: string; // ISO 8601 datetime
}

// ---------- Date Range Types ----------

/**
 * DateRangePreset - Enum for dashboard/filter presets.
 */
export type DateRangePreset =
  | 'all'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

/**
 * DateRange - Structure for date filtering.
 */
export interface DateRange {
  preset: DateRangePreset;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
}

// ---------- Finance Store State ----------

/**
 * FinanceState - Zustand store for persisted finance data.
 */
export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringTemplates: RecurringTemplate[];
  // Storage quota info
  quota: {
    usedBytes: number;
    maxBytes: number;
    percentUsed: number;
  };
  // App version for migrations
  version: string;
}

// ---------- UI Store State ----------

/**
 * ToastType - Enum for toast notification types.
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * ToastState - UI toast notification.
 */
export interface ToastState {
  open: boolean;
  type: ToastType;
  message: string;
  close: () => void;
}

/**
 * ConfirmDialogState - UI confirm dialog for destructive actions.
 */
export interface ConfirmDialogState {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * UIState - Zustand store for ephemeral UI state.
 */
export interface UIState {
  toast: ToastState;
  confirmDialog: ConfirmDialogState;
  // Filters and ephemeral UI
  filter: {
    search: string;
    dateRange: DateRange;
    categoryId?: string;
    type?: TransactionType;
    budgetId?: string;
    savingsGoalId?: string;
  };
  // Modal/dialog state
  modal: {
    open: boolean;
    type?: 'transaction' | 'budget' | 'category' | 'savingsGoal' | 'recurringTemplate' | 'settings';
    entityId?: string;
  };
  // Theme and accessibility
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
}

// ---------- Miscellaneous Types ----------

/**
 * KPIStats - Dashboard key performance indicators.
 */
export interface KPIStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetUsedPercent: number;
  savingsProgressPercent: number;
}

/**
 * ChartDataPoint - For analytics visualizations.
 */
export interface ChartDataPoint {
  date: string; // ISO 8601 date string
  value: number;
  categoryId?: string;
}

/**
 * StorageQuota - For quota widget and warnings.
 */
export interface StorageQuota {
  usedBytes: number;
  maxBytes: number;
  percentUsed: number;
}

// ---------- Utility Types ----------

/**
 * Nullable<T> - Utility for nullable fields.
 */
export type Nullable<T> = T | null;

/**
 * Optional<T> - Utility for optional fields.
 */
export type Optional<T> = T | undefined;

// ---------- End of src/types/index.ts ----------