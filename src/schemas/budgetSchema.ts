/************************************************************
 * src/schemas/budgetSchema.ts
 * Vault - Zod schema for budget CRUD forms.
 * Validates all fields for budget creation/editing.
 * Infers BudgetFormData type for use in forms and hooks.
 ************************************************************/

import { z } from 'zod';
import { BudgetPeriod } from 'src/types/index';

/**
 * budgetSchema - Zod schema for budget form validation.
 * - Validates all fields for budget creation/editing.
 * - Ensures proper types, required fields, and sensible constraints.
 */
export const budgetSchema = z.object({
  id: z.string().optional(), // UUID, generated on create
  categoryId: z
    .string({
      required_error: 'Category is required.',
      invalid_type_error: 'Category must be a string.',
    })
    .min(1, 'Category is required.'),
  amount: z
    .number({
      required_error: 'Budget amount is required.',
      invalid_type_error: 'Budget amount must be a number.',
    })
    .positive('Budget amount must be greater than zero.')
    .max(1_000_000_000, 'Budget amount is too large.'), // Arbitrary max for sanity
  period: z.enum(['monthly', 'quarterly', 'yearly', 'custom'] as BudgetPeriod[], {
    required_error: 'Budget period is required.',
    invalid_type_error: 'Budget period must be monthly, quarterly, yearly, or custom.',
  }),
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
    .string({
      required_error: 'End date is required.',
      invalid_type_error: 'End date must be a string.',
    })
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      'End date must be in YYYY-MM-DD format.'
    ),
  notes: z
    .string()
    .max(512, 'Notes are too long.')
    .optional()
    .or(z.literal('')),
  createdAt: z
    .string()
    .optional(), // Set automatically in store
  updatedAt: z
    .string()
    .optional(), // Set automatically in store
  isActive: z
    .boolean()
    .optional(), // Defaults to true on create
});

/**
 * BudgetFormData - Type inferred from budgetSchema.
 * - Used in form hooks, react-hook-form, and CRUD actions.
 */
export type BudgetFormData = z.infer<typeof budgetSchema>;