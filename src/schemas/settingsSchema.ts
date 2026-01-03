import { z } from 'zod'

/**
 * Password Change Schema
 * Validates password change form in Settings page
 */
export const passwordChangeSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string()
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

/**
 * Profile Update Schema
 * Validates profile update form in Settings page
 */
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long')
    .regex(
      /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s\-']+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
