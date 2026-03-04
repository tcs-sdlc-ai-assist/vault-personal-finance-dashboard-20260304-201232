/************************************************************
 * src/lib/calculations.ts
 * Vault - Stateless calculation utilities for analytics and budgets.
 * Pure functions for sums, averages, groupBy, progress, and KPI analytics.
 * Used in hooks, dashboard, and widgets.
 ************************************************************/

import {
  Transaction,
  TransactionType,
  Category,
  Budget,
  SavingsGoal,
  RecurringTemplate,
  DateRange,
  BudgetPeriod,
} from 'src/types/index';
import { parseISO, isValid, isAfter, isBefore, isWithinInterval } from 'date-fns';

/**
 * Sum the amounts of transactions, optionally filtered by type.
 * @param transactions Array of Transaction
 * @param type Optional TransactionType ('expense' | 'income')
 * @returns Sum of amounts (number)
 */
export function sumTransactions(
  transactions: Transaction[],
  type?: TransactionType
): number {
  return transactions
    .filter((t) => (type ? t.type === type : true))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

/**
 * Calculate average transaction amount, optionally filtered by type.
 * @param transactions Array of Transaction
 * @param type Optional TransactionType
 * @returns Average amount (number)
 */
export function averageTransactionAmount(
  transactions: Transaction[],
  type?: TransactionType
): number {
  const filtered = type ? transactions.filter((t) => t.type === type) : transactions;
  if (filtered.length === 0) return 0;
  return sumTransactions(filtered) / filtered.length;
}

/**
 * Group transactions by categoryId.
 * @param transactions Array of Transaction
 * @returns Record<string, Transaction[]>
 */
export function groupTransactionsByCategory(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    acc[t.categoryId] = acc[t.categoryId] || [];
    acc[t.categoryId].push(t);
    return acc;
  }, {});
}

/**
 * Group transactions by date (YYYY-MM-DD).
 * @param transactions Array of Transaction
 * @returns Record<string, Transaction[]>
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    acc[t.date] = acc[t.date] || [];
    acc[t.date].push(t);
    return acc;
  }, {});
}

/**
 * Filter transactions within a date range.
 * @param transactions Array of Transaction
 * @param range DateRange (startDate, endDate)
 * @returns Array of Transaction
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  range: DateRange
): Transaction[] {
  const { startDate, endDate } = range;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return transactions.filter((t) => {
    const txDate = parseISO(t.date);
    return (
      isValid(txDate) &&
      isWithinInterval(txDate, { start, end })
    );
  });
}

/**
 * Calculate total spent per category (expense only).
 * @param transactions Array of Transaction
 * @param categories Array of Category
 * @returns Record<string, number> (categoryId -> sum)
 */
export function sumExpensesByCategory(
  transactions: Transaction[],
  categories: Category[]
): Record<string, number> {
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const expenseIds = new Set(expenseCategories.map((c) => c.id));
  return transactions
    .filter((t) => t.type === 'expense' && expenseIds.has(t.categoryId))
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + Math.abs(t.amount);
      return acc;
    }, {});
}

/**
 * Calculate total income per category.
 * @param transactions Array of Transaction
 * @param categories Array of Category
 * @returns Record<string, number> (categoryId -> sum)
 */
export function sumIncomeByCategory(
  transactions: Transaction[],
  categories: Category[]
): Record<string, number> {
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const incomeIds = new Set(incomeCategories.map((c) => c.id));
  return transactions
    .filter((t) => t.type === 'income' && incomeIds.has(t.categoryId))
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + Math.abs(t.amount);
      return acc;
    }, {});
}

/**
 * Calculate budget progress for a given budget.
 * @param budget Budget
 * @param transactions Array of Transaction
 * @returns Object: { spent: number, remaining: number, percent: number }
 */
export function calculateBudgetProgress(
  budget: Budget,
  transactions: Transaction[]
): {
  spent: number;
  remaining: number;
  percent: number;
} {
  // Only consider expense transactions in budget's category and period
  const start = parseISO(budget.startDate);
  const end = parseISO(budget.endDate);
  const relevantTx = transactions.filter(
    (t) =>
      t.type === 'expense' &&
      t.categoryId === budget.categoryId &&
      isValid(parseISO(t.date)) &&
      isWithinInterval(parseISO(t.date), { start, end })
  );
  const spent = sumTransactions(relevantTx, 'expense');
  const remaining = Math.max(budget.amount - spent, 0);
  const percent = budget.amount === 0 ? 0 : Math.min((spent / budget.amount) * 100, 100);
  return { spent, remaining, percent };
}

/**
 * Calculate savings goal progress.
 * @param goal SavingsGoal
 * @returns Object: { percent: number, remaining: number, completed: boolean }
 */
export function calculateSavingsGoalProgress(
  goal: SavingsGoal
): {
  percent: number;
  remaining: number;
  completed: boolean;
} {
  const percent =
    goal.targetAmount === 0
      ? 0
      : Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const completed = percent >= 100 || goal.status === 'completed';
  return { percent, remaining, completed };
}

/**
 * Calculate total budgeted amount for a period.
 * @param budgets Array of Budget
 * @param period BudgetPeriod ('monthly', etc.)
 * @returns Total budgeted amount (number)
 */
export function sumBudgetsByPeriod(
  budgets: Budget[],
  period: BudgetPeriod
): number {
  return budgets
    .filter((b) => b.period === period && b.isActive)
    .reduce((sum, b) => sum + Math.abs(b.amount), 0);
}

/**
 * Calculate total spent for all budgets in a period.
 * @param budgets Array of Budget
 * @param transactions Array of Transaction
 * @param period BudgetPeriod
 * @returns Total spent (number)
 */
export function sumBudgetSpentByPeriod(
  budgets: Budget[],
  transactions: Transaction[],
  period: BudgetPeriod
): number {
  return budgets
    .filter((b) => b.period === period && b.isActive)
    .reduce((sum, b) => {
      const { spent } = calculateBudgetProgress(b, transactions);
      return sum + spent;
    }, 0);
}

/**
 * Calculate net balance (income - expenses) for a set of transactions.
 * @param transactions Array of Transaction
 * @returns Net balance (number)
 */
export function calculateNetBalance(transactions: Transaction[]): number {
  const income = sumTransactions(transactions, 'income');
  const expense = sumTransactions(transactions, 'expense');
  return income - expense;
}

/**
 * Calculate percentage change between two values.
 * @param prev Previous value
 * @param current Current value
 * @returns Percentage change (number, can be negative)
 */
export function calculatePercentageChange(
  prev: number,
  current: number
): number {
  if (prev === 0) return current === 0 ? 0 : 100;
  return ((current - prev) / Math.abs(prev)) * 100;
}

/**
 * Calculate recurring template next due date.
 * @param template RecurringTemplate
 * @returns ISO date string or undefined
 */
export function calculateNextRecurringDate(
  template: RecurringTemplate
): string | undefined {
  // Only active templates
  if (!template.isActive) return undefined;
  const last = template.lastGeneratedDate
    ? parseISO(template.lastGeneratedDate)
    : parseISO(template.startDate);
  if (!isValid(last)) return undefined;

  let next: Date;
  switch (template.recurrence) {
    case 'daily':
      next = new Date(last);
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next = new Date(last);
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next = new Date(last);
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next = new Date(last);
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next = new Date(last);
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next = new Date(last);
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return undefined;
  }
  // If endDate is set, ensure next is not after endDate
  if (template.endDate) {
    const end = parseISO(template.endDate);
    if (isValid(end) && isAfter(next, end)) return undefined;
  }
  return next.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Calculate total savings across all goals.
 * @param goals Array of SavingsGoal
 * @returns Total currentAmount (number)
 */
export function sumSavingsGoals(goals: SavingsGoal[]): number {
  return goals.reduce((sum, g) => sum + Math.abs(g.currentAmount), 0);
}

/**
 * Calculate total target savings across all goals.
 * @param goals Array of SavingsGoal
 * @returns Total targetAmount (number)
 */
export function sumSavingsGoalTargets(goals: SavingsGoal[]): number {
  return goals.reduce((sum, g) => sum + Math.abs(g.targetAmount), 0);
}

/**
 * Calculate overall savings progress across all goals.
 * @param goals Array of SavingsGoal
 * @returns Object: { percent: number, completedCount: number, totalCount: number }
 */
export function calculateOverallSavingsProgress(
  goals: SavingsGoal[]
): {
  percent: number;
  completedCount: number;
  totalCount: number;
} {
  const total = goals.length;
  if (total === 0) return { percent: 0, completedCount: 0, totalCount: 0 };
  const completedCount = goals.filter(
    (g) => g.status === 'completed' || g.currentAmount >= g.targetAmount
  ).length;
  const percent = (completedCount / total) * 100;
  return { percent, completedCount, totalCount: total };
}

/**
 * Calculate storage quota usage.
 * @param usedBytes Used bytes
 * @param maxBytes Max allowed bytes
 * @returns Object: { percentUsed: number }
 */
export function calculateQuotaUsage(
  usedBytes: number,
  maxBytes: number
): {
  percentUsed: number;
} {
  const percentUsed = maxBytes === 0 ? 0 : Math.min((usedBytes / maxBytes) * 100, 100);
  return { percentUsed };
}

/**
 * Calculate KPI stats for dashboard:
 * - total income, total expense, net balance, average expense, average income
 * @param transactions Array of Transaction
 * @returns Object with KPIs
 */
export function calculateDashboardKPIs(
  transactions: Transaction[]
): {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  averageExpense: number;
  averageIncome: number;
  transactionCount: number;
} {
  const totalIncome = sumTransactions(transactions, 'income');
  const totalExpense = sumTransactions(transactions, 'expense');
  const netBalance = totalIncome - totalExpense;
  const averageExpense = averageTransactionAmount(transactions, 'expense');
  const averageIncome = averageTransactionAmount(transactions, 'income');
  const transactionCount = transactions.length;
  return {
    totalIncome,
    totalExpense,
    netBalance,
    averageExpense,
    averageIncome,
    transactionCount,
  };
}