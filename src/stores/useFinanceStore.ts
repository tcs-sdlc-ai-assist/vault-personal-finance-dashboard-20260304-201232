/************************************************************
 * src/stores/useFinanceStore.ts
 * Vault - Zustand store for persisted finance data.
 * - Handles transactions, categories, budgets, savings goals, recurring templates, currency, quota.
 * - Uses persist, immer, devtools middleware.
 * - Full CRUD actions, import/export, migration, quota handling.
 * - Client-side only, persisted in localStorage.
 ************************************************************/

import { create } from 'zustand';
import { persist, devtools, immer } from 'zustand-middleware';
import { DEFAULT_CATEGORIES, DEFAULT_CURRENCY } from 'src/lib/constants';
import { uuid, safeParseJSON } from 'src/lib/utils';
import { formatISO } from 'date-fns';
import type {
  FinanceState,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  RecurringTemplate,
  VaultExportData,
} from 'src/types/index';

// ---------- Constants ----------

const VAULT_STORE_KEY = 'vault-finance-store';
const VAULT_STORE_VERSION = '1.0.0';

// Estimate localStorage quota (5MB typical, but browser-dependent)
const LOCALSTORAGE_MAX_BYTES = 5 * 1024 * 1024;

// ---------- Helper: Calculate Storage Quota ----------

function calculateQuota(state: FinanceState): FinanceState['quota'] {
  try {
    const serialized = JSON.stringify(state);
    const usedBytes = new Blob([serialized]).size;
    const percentUsed = Math.min((usedBytes / LOCALSTORAGE_MAX_BYTES) * 100, 100);
    return {
      usedBytes,
      maxBytes: LOCALSTORAGE_MAX_BYTES,
      percentUsed,
    };
  } catch {
    return {
      usedBytes: 0,
      maxBytes: LOCALSTORAGE_MAX_BYTES,
      percentUsed: 0,
    };
  }
}

// ---------- Helper: Migration ----------

function migrateState(state: any): FinanceState {
  // If state is missing version, categories, or quota, migrate.
  const migrated: FinanceState = {
    transactions: Array.isArray(state.transactions) ? state.transactions : [],
    categories: Array.isArray(state.categories) && state.categories.length > 0
      ? state.categories
      : DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          createdAt: formatISO(new Date()),
          updatedAt: formatISO(new Date()),
        })),
    budgets: Array.isArray(state.budgets) ? state.budgets : [],
    savingsGoals: Array.isArray(state.savingsGoals) ? state.savingsGoals : [],
    recurringTemplates: Array.isArray(state.recurringTemplates) ? state.recurringTemplates : [],
    quota: calculateQuota(state),
    version: VAULT_STORE_VERSION,
  };
  return migrated;
}

// ---------- Store Definition ----------

type FinanceStore = FinanceState & {
  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;

  // Category CRUD
  addCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  clearCategories: () => void;

  // Budget CRUD
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  clearBudgets: () => void;

  // Savings Goal CRUD
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  clearSavingsGoals: () => void;

  // Recurring Template CRUD
  addRecurringTemplate: (tpl: Omit<RecurringTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurringTemplate: (id: string, data: Partial<RecurringTemplate>) => void;
  deleteRecurringTemplate: (id: string) => void;
  clearRecurringTemplates: () => void;

  // Import/Export
  exportData: () => VaultExportData;
  importData: (data: VaultExportData) => void;

  // Store reset
  resetStore: () => void;

  // Migration
  migrate: () => void;

  // Quota update
  updateQuota: () => void;
};

// ---------- Initial State ----------

const initialState: FinanceState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    createdAt: formatISO(new Date()),
    updatedAt: formatISO(new Date()),
  })),
  budgets: [],
  savingsGoals: [],
  recurringTemplates: [],
  quota: {
    usedBytes: 0,
    maxBytes: LOCALSTORAGE_MAX_BYTES,
    percentUsed: 0,
  },
  version: VAULT_STORE_VERSION,
};

// ---------- Store Implementation ----------

export const useFinanceStore = create<FinanceStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ---------- Transaction Actions ----------

        addTransaction: (tx) => {
          const now = formatISO(new Date());
          set((state) => {
            state.transactions.push({
              ...tx,
              id: uuid(),
              createdAt: now,
              updatedAt: now,
            });
            state.quota = calculateQuota(state);
          });
        },

        updateTransaction: (id, data) => {
          set((state) => {
            const idx = state.transactions.findIndex((t) => t.id === id);
            if (idx !== -1) {
              state.transactions[idx] = {
                ...state.transactions[idx],
                ...data,
                updatedAt: formatISO(new Date()),
              };
              state.quota = calculateQuota(state);
            }
          });
        },

        deleteTransaction: (id) => {
          set((state) => {
            state.transactions = state.transactions.filter((t) => t.id !== id);
            state.quota = calculateQuota(state);
          });
        },

        clearTransactions: () => {
          set((state) => {
            state.transactions = [];
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Category Actions ----------

        addCategory: (cat) => {
          const now = formatISO(new Date());
          set((state) => {
            state.categories.push({
              ...cat,
              id: uuid(),
              createdAt: now,
              updatedAt: now,
            });
            state.quota = calculateQuota(state);
          });
        },

        updateCategory: (id, data) => {
          set((state) => {
            const idx = state.categories.findIndex((c) => c.id === id);
            if (idx !== -1) {
              state.categories[idx] = {
                ...state.categories[idx],
                ...data,
                updatedAt: formatISO(new Date()),
              };
              state.quota = calculateQuota(state);
            }
          });
        },

        deleteCategory: (id) => {
          set((state) => {
            // Remove category and associated transactions/budgets/goals/templates
            state.categories = state.categories.filter((c) => c.id !== id);
            state.transactions = state.transactions.filter((t) => t.categoryId !== id);
            state.budgets = state.budgets.filter((b) => b.categoryId !== id);
            state.savingsGoals = state.savingsGoals.filter((g) => g.categoryId !== id);
            state.recurringTemplates = state.recurringTemplates.filter((tpl) => tpl.categoryId !== id);
            state.quota = calculateQuota(state);
          });
        },

        clearCategories: () => {
          set((state) => {
            state.categories = [];
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Budget Actions ----------

        addBudget: (budget) => {
          const now = formatISO(new Date());
          set((state) => {
            state.budgets.push({
              ...budget,
              id: uuid(),
              createdAt: now,
              updatedAt: now,
              isActive: true,
            });
            state.quota = calculateQuota(state);
          });
        },

        updateBudget: (id, data) => {
          set((state) => {
            const idx = state.budgets.findIndex((b) => b.id === id);
            if (idx !== -1) {
              state.budgets[idx] = {
                ...state.budgets[idx],
                ...data,
                updatedAt: formatISO(new Date()),
              };
              state.quota = calculateQuota(state);
            }
          });
        },

        deleteBudget: (id) => {
          set((state) => {
            state.budgets = state.budgets.filter((b) => b.id !== id);
            state.quota = calculateQuota(state);
          });
        },

        clearBudgets: () => {
          set((state) => {
            state.budgets = [];
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Savings Goal Actions ----------

        addSavingsGoal: (goal) => {
          const now = formatISO(new Date());
          set((state) => {
            state.savingsGoals.push({
              ...goal,
              id: uuid(),
              createdAt: now,
              updatedAt: now,
            });
            state.quota = calculateQuota(state);
          });
        },

        updateSavingsGoal: (id, data) => {
          set((state) => {
            const idx = state.savingsGoals.findIndex((g) => g.id === id);
            if (idx !== -1) {
              state.savingsGoals[idx] = {
                ...state.savingsGoals[idx],
                ...data,
                updatedAt: formatISO(new Date()),
              };
              state.quota = calculateQuota(state);
            }
          });
        },

        deleteSavingsGoal: (id) => {
          set((state) => {
            state.savingsGoals = state.savingsGoals.filter((g) => g.id !== id);
            state.quota = calculateQuota(state);
          });
        },

        clearSavingsGoals: () => {
          set((state) => {
            state.savingsGoals = [];
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Recurring Template Actions ----------

        addRecurringTemplate: (tpl) => {
          const now = formatISO(new Date());
          set((state) => {
            state.recurringTemplates.push({
              ...tpl,
              id: uuid(),
              createdAt: now,
              updatedAt: now,
              isActive: true,
            });
            state.quota = calculateQuota(state);
          });
        },

        updateRecurringTemplate: (id, data) => {
          set((state) => {
            const idx = state.recurringTemplates.findIndex((tpl) => tpl.id === id);
            if (idx !== -1) {
              state.recurringTemplates[idx] = {
                ...state.recurringTemplates[idx],
                ...data,
                updatedAt: formatISO(new Date()),
              };
              state.quota = calculateQuota(state);
            }
          });
        },

        deleteRecurringTemplate: (id) => {
          set((state) => {
            state.recurringTemplates = state.recurringTemplates.filter((tpl) => tpl.id !== id);
            state.quota = calculateQuota(state);
          });
        },

        clearRecurringTemplates: () => {
          set((state) => {
            state.recurringTemplates = [];
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Import/Export ----------

        exportData: () => {
          const state = get();
          return {
            transactions: state.transactions,
            categories: state.categories,
            budgets: state.budgets,
            savingsGoals: state.savingsGoals,
            recurringTemplates: state.recurringTemplates,
            version: VAULT_STORE_VERSION,
            exportedAt: formatISO(new Date()),
          };
        },

        importData: (data) => {
          set((state) => {
            // Validate structure, fallback to empty if invalid
            state.transactions = Array.isArray(data.transactions) ? data.transactions : [];
            state.categories = Array.isArray(data.categories) && data.categories.length > 0
              ? data.categories
              : DEFAULT_CATEGORIES.map((cat) => ({
                  ...cat,
                  createdAt: formatISO(new Date()),
                  updatedAt: formatISO(new Date()),
                }));
            state.budgets = Array.isArray(data.budgets) ? data.budgets : [];
            state.savingsGoals = Array.isArray(data.savingsGoals) ? data.savingsGoals : [];
            state.recurringTemplates = Array.isArray(data.recurringTemplates) ? data.recurringTemplates : [];
            state.version = data.version || VAULT_STORE_VERSION;
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Store Reset ----------

        resetStore: () => {
          set((state) => {
            state.transactions = [];
            state.categories = DEFAULT_CATEGORIES.map((cat) => ({
              ...cat,
              createdAt: formatISO(new Date()),
              updatedAt: formatISO(new Date()),
            }));
            state.budgets = [];
            state.savingsGoals = [];
            state.recurringTemplates = [];
            state.version = VAULT_STORE_VERSION;
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Migration ----------

        migrate: () => {
          set((state) => {
            const migrated = migrateState(state);
            state.transactions = migrated.transactions;
            state.categories = migrated.categories;
            state.budgets = migrated.budgets;
            state.savingsGoals = migrated.savingsGoals;
            state.recurringTemplates = migrated.recurringTemplates;
            state.version = migrated.version;
            state.quota = calculateQuota(state);
          });
        },

        // ---------- Quota Update ----------

        updateQuota: () => {
          set((state) => {
            state.quota = calculateQuota(state);
          });
        },
      })),
      {
        name: VAULT_STORE_KEY,
        version: 1,
        // Custom serialization for quota calculation
        serialize: (state) => {
          try {
            return JSON.stringify(state);
          } catch {
            return '{}';
          }
        },
        // Custom deserialization and migration
        deserialize: (str) => {
          const parsed = safeParseJSON(str, initialState);
          return { state: migrateState(parsed) };
        },
      }
    ),
    { name: 'Vault Finance Store' }
  )
);

// ---------- Export Types ----------

export type { FinanceStore };