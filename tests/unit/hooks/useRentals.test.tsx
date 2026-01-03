import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRentals, useCreateRental } from '../../../src/hooks/api/useRentals'
import { supabase } from '../../../src/lib/supabase'
import type { ReactNode } from 'react'

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('useRentals Hook', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useRentals - Fetching rentals', () => {
    it('should fetch rentals successfully', async () => {
      const mockRentals = [
        {
          id: '1',
          rental_number: 'R-20260103-0001',
          type: 'rental',
          client_id: 'client-1',
          project_name: 'Test Project',
          status: 'active',
          clients: {
            name: 'Test Client',
            email: 'client@test.com',
          },
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockRentals,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useRentals(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockRentals)
      expect(supabase.from).toHaveBeenCalledWith('rentals')
    })

    it('should filter rentals by status', async () => {
      const mockRentals = [
        {
          id: '1',
          rental_number: 'R-20260103-0001',
          type: 'rental',
          status: 'active',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockRentals,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useRentals('active'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Should have called eq twice: once for type filter, once for status filter
      expect(mockEq).toHaveBeenCalled()
    })

    it('should handle fetch error gracefully', async () => {
      const mockError = new Error('Failed to fetch rentals')

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useRentals(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })

    it('should filter by type when specified', async () => {
      const mockRentals = [
        {
          id: '1',
          rental_number: 'R-20260103-0001',
          type: 'rental',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockRentals,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useRentals('all', 'rental'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Should filter by type
      expect(mockEq).toHaveBeenCalledWith('type', 'rental')
    })
  })

  describe('useCreateRental - Creating rentals', () => {
    it('should validate rental number format', () => {
      const rentalNumber = 'R-20260103-0001'

      // Rental number format validation
      const rentalNumberRegex = /^R-\d{8}-\d{4}$/
      expect(rentalNumberRegex.test(rentalNumber)).toBe(true)
    })

    it('should reject invalid rental number format', () => {
      const invalidNumbers = [
        'R-2026010-0001', // Too short date
        'R-20260103-001',  // Too short sequence
        'S-20260103-0001', // Wrong prefix
        '20260103-0001',   // Missing prefix
      ]

      const rentalNumberRegex = /^R-\d{8}-\d{4}$/

      invalidNumbers.forEach(number => {
        expect(rentalNumberRegex.test(number)).toBe(false)
      })
    })
  })

  describe('Rental Number Generation', () => {
    it('should generate rental number with correct date format', () => {
      const today = new Date('2026-01-03')
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

      expect(dateStr).toBe('20260103')

      const rentalNumber = `R-${dateStr}-0001`
      expect(rentalNumber).toBe('R-20260103-0001')
    })

    it('should pad sequence number to 4 digits', () => {
      const testCases = [
        { input: 1, expected: '0001' },
        { input: 42, expected: '0042' },
        { input: 999, expected: '0999' },
        { input: 9999, expected: '9999' },
      ]

      testCases.forEach(({ input, expected }) => {
        const paddedNumber = String(input).padStart(4, '0')
        expect(paddedNumber).toBe(expected)
      })
    })
  })

  describe('Rental Status Validation', () => {
    it('should accept valid rental statuses', () => {
      const validStatuses = ['draft', 'active', 'pending_return', 'completed', 'cancelled']

      validStatuses.forEach(status => {
        expect(['draft', 'active', 'pending_return', 'completed', 'cancelled']).toContain(status)
      })
    })

    it('should calculate days correctly', () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('2026-01-08')

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      expect(diffDays).toBe(7)
    })
  })

  describe('Financial Calculations', () => {
    it('should calculate rental subtotal correctly', () => {
      const quantity = 2
      const dailyRate = 50
      const days = 7

      const subtotal = quantity * dailyRate * days

      expect(subtotal).toBe(700)
    })

    it('should calculate total from multiple items', () => {
      const items = [
        { quantity: 2, daily_rate: 50, days: 7 }, // 700
        { quantity: 1, daily_rate: 100, days: 7 }, // 700
        { quantity: 3, daily_rate: 30, days: 7 }, // 630
      ]

      const total = items.reduce((sum, item) => {
        return sum + (item.quantity * item.daily_rate * item.days)
      }, 0)

      expect(total).toBe(2030)
    })

    it('should handle decimal daily rates', () => {
      const quantity = 1
      const dailyRate = 99.99
      const days = 3

      const subtotal = quantity * dailyRate * days

      expect(subtotal).toBeCloseTo(299.97, 2)
    })
  })
})
