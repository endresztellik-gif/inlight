import { z } from 'zod'

/**
 * Rental item validation schema
 */
export const rentalItemSchema = z.object({
  product_id: z.string()
    .uuid('validation.rental.item.productId.required'),

  quantity: z.number()
    .int('validation.rental.item.quantity.integer')
    .min(1, 'validation.rental.item.quantity.positive'),

  daily_rate: z.number()
    .min(0.01, 'validation.rental.item.dailyRate.positive'),

  days: z.number()
    .int('validation.rental.item.days.integer')
    .min(1, 'validation.rental.item.days.positive'),
})

/**
 * Base rental object schema (without validation)
 * Used as a base for extending in subrentalSchema
 */
export const rentalBaseSchema = z.object({
  client_id: z.string()
    .uuid('validation.rental.client.required'),

  project_name: z.string()
    .min(1, 'validation.rental.projectName.required')
    .max(255, 'validation.rental.projectName.maxLength'),

  start_date: z.string()
    .min(1, 'validation.rental.startDate.required')
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'validation.rental.startDate.invalid'
    ),

  end_date: z.string()
    .min(1, 'validation.rental.endDate.required')
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'validation.rental.endDate.invalid'
    ),

  notes: z.string()
    .max(1000, 'validation.rental.notes.maxLength')
    .optional()
    .or(z.literal('')),

  items: z.array(rentalItemSchema)
    .min(1, 'validation.rental.items.required'),
})

/**
 * Rental form validation schema with date validation
 *
 * Validates rental information including:
 * - Client (required UUID)
 * - Project name (required)
 * - Date range (start_date, end_date - end must be after start)
 * - Items (array, at least 1 item required)
 * - Notes (optional)
 */
export const rentalSchema = rentalBaseSchema.refine(
  (data) => {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end >= start
  },
  {
    message: 'validation.rental.endDate.beforeStart',
    path: ['end_date'],
  }
)

export type RentalItemFormData = z.infer<typeof rentalItemSchema>
export type RentalFormData = z.infer<typeof rentalSchema>
