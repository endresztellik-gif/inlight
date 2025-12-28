import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('Rental Validation Schema', () => {
  const rentalSchema = z.object({
    client_id: z.string().uuid(),
    project_name: z.string().min(1).max(255),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    final_total: z.number().positive().optional(),
    final_currency: z.enum(['EUR', 'HUF', 'USD']),
  })

  it('validates correct rental data', () => {
    const validData = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      project_name: 'Test Film Project',
      start_date: '2025-02-01T00:00:00.000Z',
      end_date: '2025-02-10T00:00:00.000Z',
      final_currency: 'EUR' as const,
    }

    expect(() => rentalSchema.parse(validData)).not.toThrow()
  })

  it('rejects invalid UUID for client_id', () => {
    const invalidData = {
      client_id: 'not-a-uuid',
      project_name: 'Test Project',
      start_date: '2025-02-01T00:00:00.000Z',
      end_date: '2025-02-10T00:00:00.000Z',
      final_currency: 'EUR' as const,
    }

    expect(() => rentalSchema.parse(invalidData)).toThrow()
  })

  it('rejects empty project_name', () => {
    const invalidData = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      project_name: '',
      start_date: '2025-02-01T00:00:00.000Z',
      end_date: '2025-02-10T00:00:00.000Z',
      final_currency: 'EUR' as const,
    }

    expect(() => rentalSchema.parse(invalidData)).toThrow()
  })

  it('rejects invalid currency', () => {
    const invalidData = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      project_name: 'Test Project',
      start_date: '2025-02-01T00:00:00.000Z',
      end_date: '2025-02-10T00:00:00.000Z',
      final_currency: 'GBP' as any,
    }

    expect(() => rentalSchema.parse(invalidData)).toThrow()
  })

  it('accepts optional final_total', () => {
    const validData = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      project_name: 'Test Project',
      start_date: '2025-02-01T00:00:00.000Z',
      end_date: '2025-02-10T00:00:00.000Z',
      final_currency: 'EUR' as const,
      final_total: 1500.50,
    }

    expect(() => rentalSchema.parse(validData)).not.toThrow()
  })

  it('rejects negative final_total', () => {
    const invalidData = {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      project_name: 'Test Project',
      start_date: '2025-02-01T00:00:00.000Z',
      end_date: '2025-02-10T00:00:00.000Z',
      final_currency: 'EUR' as const,
      final_total: -100,
    }

    expect(() => rentalSchema.parse(invalidData)).toThrow()
  })
})
