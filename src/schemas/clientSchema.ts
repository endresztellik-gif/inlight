import { z } from 'zod'

/**
 * Client form validation schema
 * 
 * Validates client information including:
 * - Name (required)
 * - Email (required, valid email format)
 * - Phone (required, international format)
 * - Tax number (optional, Hungarian format: XXXXXXXX-X-XX)
 * - Address (optional)
 * - Contact person (optional)
 * - Notes (optional)
 */
export const clientSchema = z.object({
  // Required fields
  name: z.string()
    .min(1, 'validation.client.name.required')
    .max(255, 'validation.client.name.maxLength'),

  email: z.string()
    .min(1, 'validation.client.email.required')
    .email('validation.client.email.invalid')
    .max(255, 'validation.client.email.maxLength'),

  phone: z.string()
    .min(1, 'validation.client.phone.required')
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      'validation.client.phone.invalid'
    )
    .max(50, 'validation.client.phone.maxLength'),

  // Optional fields
  address: z.string()
    .max(500, 'validation.client.address.maxLength')
    .optional()
    .or(z.literal('')),

  tax_number: z.string()
    .regex(
      /^(\d{8}-\d-\d{2})?$/,
      'validation.client.taxNumber.invalid'
    )
    .max(50, 'validation.client.taxNumber.maxLength')
    .optional()
    .or(z.literal('')),

  contact_person: z.string()
    .max(255, 'validation.client.contactPerson.maxLength')
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .max(1000, 'validation.client.notes.maxLength')
    .optional()
    .or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>
