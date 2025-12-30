import { z } from 'zod'
import { rentalSchema, rentalItemSchema } from './rentalSchema'

/**
 * Subrental item validation schema
 * Extends rental item with purchase_price field
 */
export const subrentalItemSchema = rentalItemSchema.extend({
  purchase_price: z.number()
    .min(0, 'validation.subrental.item.purchasePrice.nonNegative')
    .optional(),
})

/**
 * Subrental form validation schema
 * 
 * Extends rental schema with supplier information:
 * - Supplier name (required)
 * - Supplier contact (optional)
 * - Supplier notes (optional)
 * - Items with purchase prices
 */
export const subrentalSchema = rentalSchema.extend({
  supplier_name: z.string()
    .min(1, 'validation.subrental.supplierName.required')
    .max(255, 'validation.subrental.supplierName.maxLength'),

  supplier_contact: z.string()
    .max(255, 'validation.subrental.supplierContact.maxLength')
    .optional()
    .or(z.literal('')),

  supplier_notes: z.string()
    .max(1000, 'validation.subrental.supplierNotes.maxLength')
    .optional()
    .or(z.literal('')),

  items: z.array(subrentalItemSchema)
    .min(1, 'validation.subrental.items.required'),
})

export type SubrentalItemFormData = z.infer<typeof subrentalItemSchema>
export type SubrentalFormData = z.infer<typeof subrentalSchema>
