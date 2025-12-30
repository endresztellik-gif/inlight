import { z } from 'zod'

/**
 * Category form validation schema
 *
 * Validates category information including:
 * - Name (required, max 100 chars)
 * - Multilingual names (optional)
 * - Description (optional)
 * - Icon (optional, max 2 chars)
 * - Display order (non-negative integer)
 */
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'validation.category.name.required')
    .max(100, 'validation.category.name.maxLength'),

  name_en: z.string()
    .max(100, 'validation.category.nameEn.maxLength')
    .optional()
    .or(z.literal('')),

  name_hu: z.string()
    .max(100, 'validation.category.nameHu.maxLength')
    .optional()
    .or(z.literal('')),

  description: z.string()
    .max(500, 'validation.category.description.maxLength')
    .optional()
    .or(z.literal('')),

  icon: z.string()
    .max(2, 'validation.category.icon.maxLength')
    .optional()
    .or(z.literal('')),

  display_order: z.number()
    .int('validation.category.displayOrder.integer')
    .min(0, 'validation.category.displayOrder.nonNegative'),
})

export type CategoryFormData = z.infer<typeof categorySchema>
