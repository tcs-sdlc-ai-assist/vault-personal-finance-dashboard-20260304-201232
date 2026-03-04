/************************************************************
 * src/schemas/transactionSchema.ts
 * Vault - Zod schema for transaction CRUD forms.
 * Validates all fields for transaction creation/editing.
 * Infers TransactionFormData type for use in forms and hooks.
 ************************************************************/

import { z } from 'zod';
import { TransactionType, RecurrenceType } from 'src/types/index';

// ---------- Transaction Form Schema ----------

/**
 * transactionSchema - Zod schema for transaction form validation.
 * - Validates all fields for transaction creation/editing.
 * - Ensures proper types, required fields, and sensible constraints.
 */
export const transactionSchema = z.object({
  id: z.string().optional(), // UUID, generated on create
  type: z.enum(['expense', 'income'], {
    required_error: 'Transaction type is required.',
    invalid_type_error: 'Transaction type must be expense or income.',
  }),
  amount: z
    .number({
      required_error: 'Amount is required.',
      invalid_type_error: 'Amount must be a number.',
    })
    .positive('Amount must be greater than zero.')
    .max(1_000_000_000, 'Amount is too large.'), // Arbitrary max for sanity
  categoryId: z
    .string({
      required_error: 'Category is required.',
      invalid_type_error: 'Category must be a string.',
    })
    .min(1, 'Category is required.'),
  date: z
    .string({
      required_error: 'Date is required.',
      invalid_type_error: 'Date must be a string.',
    })
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Date must be in YYYY-MM-DD format.'
    ),
  description: z
    .string()
    .max(128, 'Description is too long.')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(512, 'Notes are too long.')
    .optional()
    .or(z.literal('')),
  recurringTemplateId: z
    .string()
    .optional()
    .or(z.literal('')),
  createdAt: z
    .string()
    .optional(), // Set automatically in store
  updatedAt: z
    .string()
    .optional(), // Set automatically in store
});

/**
 * TransactionFormData - Type inferred from transactionSchema.
 * - Used in form hooks, react-hook-form, and CRUD actions.
 */
export type TransactionFormData = z.infer<typeof transactionSchema>;

// ---------- Recurring Template Fields (for advanced forms) ----------

/**
 * recurringFieldsSchema - Zod schema for recurring transaction fields.
 * - Used for recurring template creation/editing.
 */
export const recurringFieldsSchema = z.object({
  recurrence: z.enum(
    [
      'none',
      'daily',
      'weekly',
      'biweekly',
      'monthly',
      'quarterly',
      'yearly',
    ] as RecurrenceType[],
    {
      required_error: 'Recurrence is required.',
      invalid_type_error: 'Invalid recurrence type.',
    }
  ),
  startDate: z
    .string({
      required_error: 'Start date is required.',
      invalid_type_error: 'Start date must be a string.',
    })
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Start date must be in YYYY-MM-DD format.'
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'End date must be in YYYY-MM-DD format.'
    ),
});

/**
 * RecurringFieldsFormData - Type inferred from recurringFieldsSchema.
 */
export type RecurringFieldsFormData = z.infer<typeof recurringFieldsSchema>;