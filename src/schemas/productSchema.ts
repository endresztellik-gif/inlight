import { z } from 'zod'

/**
 * Product form validation schema
 * 
 * Validates product information including:
 * - Name (required)
 * - Serial number (required, unique)
 * - Category (required UUID)
 * - Daily rate (required, positive number)
 * - Quantities (required, non-negative integers)
 * - Descriptions (optional, i18n)
 */
export const productSchema = z.object({
  // Required fields
  name: z.string()
    .min(1, 'validation.product.name.required')
    .max(255, 'validation.product.name.maxLength'),

  serial_number: z.string()
    .min(1, 'validation.product.serialNumber.required')
    .max(100, 'validation.product.serialNumber.maxLength')
    .regex(
      /^[A-Z0-9\-_]+$/i,
      'validation.product.serialNumber.invalid'
    ),

  category_id: z.string()
    .uuid('validation.product.category.required'),

  daily_rate: z.number()
    .min(0.01, 'validation.product.dailyRate.positive')
    .max(1000000, 'validation.product.dailyRate.maxValue'),

  available_quantity: z.number()
    .int('validation.product.availableQuantity.integer')
    .min(0, 'validation.product.availableQuantity.nonNegative'),

  total_quantity: z.number()
    .int('validation.product.totalQuantity.integer')
    .min(1, 'validation.product.totalQuantity.positive'),

  // Optional fields
  description: z.string()
    .max(1000, 'validation.product.description.maxLength')
    .optional()
    .or(z.literal('')),

  description_hu: z.string()
    .max(1000, 'validation.product.descriptionHu.maxLength')
    .optional()
    .or(z.literal('')),
})
  .refine(
    (data) => data.available_quantity <= data.total_quantity,
    {
      message: 'validation.product.availableQuantity.exceedsTotal',
      path: ['available_quantity'],
    }
  )

export type ProductFormData = z.infer<typeof productSchema>
