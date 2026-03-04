/************************************************************
 * src/lib/demo-data.ts
 * Vault - Demo data seeder for impressive first load/onboarding.
 * - Generates realistic transactions, budgets, savings goals, and recurring templates.
 * - Used for demo mode, onboarding, and first-run experience.
 * - All dates are recent/current, amounts are plausible, categories match presets.
 * - Fully typed, ready for import into finance store.
 ************************************************************/

import { formatISO, format, subDays, subMonths, addDays, addMonths } from 'date-fns';
import {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  RecurringTemplate,
  TransactionType,
  RecurrenceType,
  BudgetPeriod,
  SavingsGoalStatus,
} from 'src/types/index';
import { DEFAULT_CATEGORIES } from './constants';
import { uuid } from './utils';

// ---------- Helper: Random Utilities ----------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomAmount(min: number, max: number, decimals = 2): number {
  const amt = Math.random() * (max - min) + min;
  return parseFloat(amt.toFixed(decimals));
}

function randomDateWithinPast(days: number): string {
  const date = subDays(new Date(), randomInt(0, days));
  return format(date, 'yyyy-MM-dd');
}

function randomRecentISO(days: number): string {
  return formatISO(subDays(new Date(), randomInt(0, days)));
}

// ---------- Demo Transactions ----------

const demoDescriptions = [
  'Weekly groceries at SuperMart',
  'Electricity bill payment',
  'Movie night with friends',
  'Flight to Berlin',
  'Annual health checkup',
  'Monthly savings deposit',
  'Salary credited',
  'Coffee at BrewHouse',
  'Gym membership renewal',
  'Streaming subscription',
  'Dinner at Italian Bistro',
  'Pharmacy purchase',
  'Bonus payout',
  'Taxi ride',
  'Gift for family',
];

const demoNotes = [
  '',
  'Paid via credit card',
  'Recurring expense',
  'Split with partner',
  'Online payment',
  'Cash transaction',
  'First time here',
  'Discount applied',
  'Urgent expense',
  'Refund pending',
];

// Generate demo transactions (30 days, mixed types)
export function generateDemoTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const categories = DEFAULT_CATEGORIES;

  // Generate 24 demo transactions (approx. 6 per week)
  for (let i = 0; i < 24; i++) {
    const category = randomChoice(categories);
    const type: TransactionType = category.type === 'income' ? 'income' : 'expense';
    const amount =
      type === 'income'
        ? randomAmount(1500, 3500)
        : randomAmount(10, 250);

    const date = randomDateWithinPast(30);
    const createdAt = randomRecentISO(30);
    const updatedAt = createdAt;

    transactions.push({
      id: uuid(),
      type,
      amount,
      categoryId: category.id,
      date,
      description: randomChoice(demoDescriptions),
      notes: randomChoice(demoNotes),
      recurringTemplateId: undefined,
      createdAt,
      updatedAt,
    });
  }

  // Add a few income transactions (salary, bonus)
  const salaryCategory = categories.find((c) => c.id === 'salary');
  if (salaryCategory) {
    transactions.push({
      id: uuid(),
      type: 'income',
      amount: randomAmount(2500, 3500),
      categoryId: salaryCategory.id,
      date: format(now, 'yyyy-MM-dd'),
      description: 'Monthly salary credited',
      notes: 'Direct deposit',
      recurringTemplateId: undefined,
      createdAt: formatISO(now),
      updatedAt: formatISO(now),
    });
    transactions.push({
      id: uuid(),
      type: 'income',
      amount: randomAmount(500, 1200),
      categoryId: salaryCategory.id,
      date: format(subMonths(now, 1), 'yyyy-MM-dd'),
      description: 'Performance bonus',
      notes: 'Annual bonus',
      recurringTemplateId: undefined,
      createdAt: formatISO(subMonths(now, 1)),
      updatedAt: formatISO(subMonths(now, 1)),
    });
  }

  // Add a savings transaction
  const savingsCategory = categories.find((c) => c.id === 'savings');
  if (savingsCategory) {
    transactions.push({
      id: uuid(),
      type: 'expense',
      amount: randomAmount(200, 500),
      categoryId: savingsCategory.id,
      date: format(now, 'yyyy-MM-dd'),
      description: 'Monthly savings deposit',
      notes: 'Auto-transfer',
      recurringTemplateId: undefined,
      createdAt: formatISO(now),
      updatedAt: formatISO(now),
    });
  }

  return transactions;
}

// ---------- Demo Budgets ----------

export function generateDemoBudgets(): Budget[] {
  const now = new Date();
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(now), 'yyyy-MM-dd');

  // Budgets for groceries, entertainment, bills
  const groceries = DEFAULT_CATEGORIES.find((c) => c.id === 'groceries');
  const entertainment = DEFAULT_CATEGORIES.find((c) => c.id === 'entertainment');
  const bills = DEFAULT_CATEGORIES.find((c) => c.id === 'bills');

  const budgets: Budget[] = [];

  if (groceries) {
    budgets.push({
      id: uuid(),
      categoryId: groceries.id,
      amount: 400,
      period: 'monthly' as BudgetPeriod,
      startDate,
      endDate,
      notes: 'Keep grocery spending under control',
      createdAt: formatISO(now),
      updatedAt: formatISO(now),
      isActive: true,
    });
  }
  if (entertainment) {
    budgets.push({
      id: uuid(),
      categoryId: entertainment.id,
      amount: 150,
      period: 'monthly' as BudgetPeriod,
      startDate,
      endDate,
      notes: 'Limit entertainment expenses',
      createdAt: formatISO(now),
      updatedAt: formatISO(now),
      isActive: true,
    });
  }
  if (bills) {
    budgets.push({
      id: uuid(),
      categoryId: bills.id,
      amount: 250,
      period: 'monthly' as BudgetPeriod,
      startDate,
      endDate,
      notes: 'Monthly utility bills',
      createdAt: formatISO(now),
      updatedAt: formatISO(now),
      isActive: true,
    });
  }

  return budgets;
}

// ---------- Demo Savings Goals ----------

export function generateDemoSavingsGoals(): SavingsGoal[] {
  const now = new Date();
  const travelCategory = DEFAULT_CATEGORIES.find((c) => c.id === 'travel');
  const healthCategory = DEFAULT_CATEGORIES.find((c) => c.id === 'health');

  const goals: SavingsGoal[] = [];

  // Travel goal
  goals.push({
    id: uuid(),
    name: 'Summer Vacation',
    targetAmount: 2000,
    currentAmount: 650,
    categoryId: travelCategory?.id,
    startDate: formatISO(subMonths(now, 2)),
    endDate: formatISO(addMonths(now, 4)),
    status: 'active' as SavingsGoalStatus,
    notes: 'Save for trip to Greece',
    createdAt: formatISO(subMonths(now, 2)),
    updatedAt: formatISO(now),
  });

  // Health goal
  goals.push({
    id: uuid(),
    name: 'Fitness Equipment',
    targetAmount: 800,
    currentAmount: 300,
    categoryId: healthCategory?.id,
    startDate: formatISO(subMonths(now, 1)),
    endDate: formatISO(addMonths(now, 2)),
    status: 'active' as SavingsGoalStatus,
    notes: 'Buy new treadmill',
    createdAt: formatISO(subMonths(now, 1)),
    updatedAt: formatISO(now),
  });

  return goals;
}

// ---------- Demo Recurring Templates ----------

export function generateDemoRecurringTemplates(): RecurringTemplate[] {
  const now = new Date();
  const billsCategory = DEFAULT_CATEGORIES.find((c) => c.id === 'bills');
  const savingsCategory = DEFAULT_CATEGORIES.find((c) => c.id === 'savings');

  const templates: RecurringTemplate[] = [];

  // Monthly electricity bill
  if (billsCategory) {
    templates.push({
      id: uuid(),
      type: 'expense',
      amount: 60,
      categoryId: billsCategory.id,
      description: 'Electricity bill',
      notes: 'Auto-pay',
      recurrence: 'monthly' as RecurrenceType,
      startDate: formatISO(subMonths(now, 6)),
      endDate: undefined,
      lastGeneratedDate: formatISO(subMonths(now, 1)),
      createdAt: formatISO(subMonths(now, 6)),
      updatedAt: formatISO(now),
      isActive: true,
    });
  }

  // Monthly savings deposit
  if (savingsCategory) {
    templates.push({
      id: uuid(),
      type: 'expense',
      amount: 250,
      categoryId: savingsCategory.id,
      description: 'Savings deposit',
      notes: 'Recurring transfer',
      recurrence: 'monthly' as RecurrenceType,
      startDate: formatISO(subMonths(now, 12)),
      endDate: undefined,
      lastGeneratedDate: formatISO(now),
      createdAt: formatISO(subMonths(now, 12)),
      updatedAt: formatISO(now),
      isActive: true,
    });
  }

  return templates;
}

// ---------- Demo Data Bundle ----------

/**
 * getDemoData
 * - Returns a bundle of demo data for onboarding/first-run.
 * - All entities are generated with realistic values and dates.
 */
export function getDemoData() {
  return {
    transactions: generateDemoTransactions(),
    categories: DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date()),
    })),
    budgets: generateDemoBudgets(),
    savingsGoals: generateDemoSavingsGoals(),
    recurringTemplates: generateDemoRecurringTemplates(),
  };
}