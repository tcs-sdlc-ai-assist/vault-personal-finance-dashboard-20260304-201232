/************************************************************
 * src/schemas/categorySchema.ts
 * Vault - Zod schema for category CRUD forms.
 * Validates all fields for category creation/editing.
 * Infers CategoryFormData type for use in forms and hooks.
 ************************************************************/

import { z } from 'zod';
import { CategoryType } from 'src/types/index';

/**
 * categorySchema - Zod schema for category form validation.
 * - Validates all fields for category creation/editing.
 * - Ensures proper types, required fields, and sensible constraints.
 */
export const categorySchema = z.object({
  id: z.string().optional(), // UUID, generated on create
  name: z
    .string({
      required_error: 'Category name is required.',
      invalid_type_error: 'Category name must be a string.',
    })
    .min(1, 'Category name is required.')
    .max(32, 'Category name is too long.'),
  type: z.enum(['expense', 'income', 'savings'] as CategoryType[], {
    required_error: 'Category type is required.',
    invalid_type_error: 'Category type must be expense, income, or savings.',
  }),
  color: z
    .string({
      required_error: 'Category color is required.',
      invalid_type_error: 'Category color must be a string.',
    })
    .min(1, 'Category color is required.')
    .max(32, 'Category color is too long.'), // Accepts theme key or hex
  icon: z
    .string()
    .max(32, 'Icon name is too long.')
    .optional()
    .or(z.literal('')),
  isPreset: z
    .boolean()
    .optional(), // True if built-in/preset category
  createdAt: z
    .string()
    .optional(), // Set automatically in store
  updatedAt: z
    .string()
    .optional(), // Set automatically in store
});

/**
 * CategoryFormData - Type inferred from categorySchema.
 * - Used in form hooks, react-hook-form, and CRUD actions.
 */
export type CategoryFormData = z.infer<typeof categorySchema>;