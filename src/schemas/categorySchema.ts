import { z } from 'zod'

/**
 * Category form validation schema
 * 
 * Validates category information including:
 * - Name (required, max 100 chars)
 * - Description (optional)
 */
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'validation.category.name.required')
    .max(100, 'validation.category.name.maxLength'),

  description: z.string()
    .max(500, 'validation.category.description.maxLength')
    .optional()
    .or(z.literal('')),
})

export type CategoryFormData = z.infer<typeof categorySchema>
