import { z } from 'zod'

/**
 * Client form validation schema
 *
 * Validates client information including:
 * - Name (required)
 * - Company name (optional)
 * - Email (required, valid email format)
 * - Phone (required, international format)
 * - Tax number (optional, Hungarian format: XXXXXXXX-X-XX)
 * - Address (optional)
 * - Contact person details (optional - name, email, phone)
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
  company: z.string()
    .max(255, 'validation.client.company.maxLength')
    .optional()
    .or(z.literal('')),

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

  contact_person_name: z.string()
    .max(255, 'validation.client.contactPersonName.maxLength')
    .optional()
    .or(z.literal('')),

  contact_person_email: z.string()
    .email('validation.client.contactPersonEmail.invalid')
    .max(255, 'validation.client.contactPersonEmail.maxLength')
    .optional()
    .or(z.literal('')),

  contact_person_phone: z.string()
    .regex(
      /^([+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*)?$/,
      'validation.client.contactPersonPhone.invalid'
    )
    .max(50, 'validation.client.contactPersonPhone.maxLength')
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .max(1000, 'validation.client.notes.maxLength')
    .optional()
    .or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>
