import { describe, it, expect } from 'vitest'
import { passwordChangeSchema, profileUpdateSchema } from '../../../src/schemas/settingsSchema'

describe('settingsSchema', () => {
  describe('passwordChangeSchema', () => {
    it('should validate correct password change data', () => {
      const validData = {
        newPassword: 'Password123',
        confirmPassword: 'Password123'
      }

      const result = passwordChangeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        newPassword: 'Pass1',
        confirmPassword: 'Pass1'
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters')
      }
    })

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        newPassword: 'password123',
        confirmPassword: 'password123'
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase')
      }
    })

    it('should reject password without lowercase letter', () => {
      const invalidData = {
        newPassword: 'PASSWORD123',
        confirmPassword: 'PASSWORD123'
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase')
      }
    })

    it('should reject password without number', () => {
      const invalidData = {
        newPassword: 'PasswordABC',
        confirmPassword: 'PasswordABC'
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number')
      }
    })

    it('should reject non-matching passwords', () => {
      const invalidData = {
        newPassword: 'Password123',
        confirmPassword: 'Password456'
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('do not match')
      }
    })

    it('should reject password longer than 100 characters', () => {
      const longPassword = 'P' + 'a'.repeat(99) + '1'
      const invalidData = {
        newPassword: longPassword,
        confirmPassword: longPassword
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('too long')
      }
    })

    it('should accept complex valid password', () => {
      const validData = {
        newPassword: 'MySecureP@ssw0rd!2024',
        confirmPassword: 'MySecureP@ssw0rd!2024'
      }

      const result = passwordChangeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('profileUpdateSchema', () => {
    it('should validate correct profile data', () => {
      const validData = {
        full_name: 'John Doe'
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate Hungarian names with accents', () => {
      const validData = {
        full_name: 'Kovács János'
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate names with special characters', () => {
      const validData = {
        full_name: "O'Brien-Smith"
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        full_name: 'A'
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject name longer than 255 characters', () => {
      const invalidData = {
        full_name: 'A'.repeat(256)
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('too long')
      }
    })

    it('should reject name with numbers', () => {
      const invalidData = {
        full_name: 'John123'
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('only contain letters')
      }
    })

    it('should reject name with special symbols', () => {
      const invalidData = {
        full_name: 'John @ Doe'
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('only contain letters')
      }
    })

    it('should accept all Hungarian accented characters', () => {
      const hungarianNames = [
        'Szabó Ádám',
        'Molnár Éva',
        'Tóth István',
        'Nagy Ödön',
        'Kiss Őrs',
        'Varga Úr',
        'Horváth Ünige',
        'Farkas Ű',
      ]

      hungarianNames.forEach(name => {
        const result = profileUpdateSchema.safeParse({ full_name: name })
        expect(result.success).toBe(true)
      })
    })
  })
})
