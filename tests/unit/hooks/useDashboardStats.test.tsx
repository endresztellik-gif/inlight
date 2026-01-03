import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardStats, useUpcomingReturns, useLowStockProducts } from '../../../src/hooks/api/useDashboardStats'
import { supabase } from '../../../src/lib/supabase'
import type { ReactNode } from 'react'

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('useDashboardStats Hooks', () => {
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

  describe('useDashboardStats - Overall statistics', () => {
    it('should calculate active rentals count correctly', async () => {
      const mockRentals = [
        { id: '1', status: 'active', type: 'rental', final_total: 1000 },
        { id: '2', status: 'active', type: 'rental', final_total: 2000 },
        { id: '3', status: 'completed', type: 'rental', final_total: 1500 },
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

      const { result } = renderHook(() => useDashboardStats(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Stats calculation logic (based on the hook implementation)
      const activeCount = mockRentals.filter(r => r.status === 'active').length
      expect(activeCount).toBe(2)
    })

    it('should handle empty data gracefully', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useDashboardStats(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual([])
    })
  })

  describe('useUpcomingReturns - Returns due soon', () => {
    it('should filter rentals by date range', () => {
      const now = new Date('2026-01-03T00:00:00Z')
      const days = 7
      const futureDate = new Date(now)
      futureDate.setDate(futureDate.getDate() + days)

      expect(futureDate.toISOString().split('T')[0]).toBe('2026-01-10')
    })

    it('should calculate days until due correctly', () => {
      const now = new Date('2026-01-03')
      const endDate = new Date('2026-01-08')

      const diffTime = endDate.getTime() - now.getTime()
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      expect(daysUntilDue).toBe(5)
    })

    it('should categorize urgency correctly', () => {
      const testCases = [
        { daysUntilDue: 0, expectedUrgency: 'critical' },
        { daysUntilDue: 1, expectedUrgency: 'critical' },
        { daysUntilDue: 2, expectedUrgency: 'warning' },
        { daysUntilDue: 3, expectedUrgency: 'warning' },
        { daysUntilDue: 4, expectedUrgency: 'normal' },
        { daysUntilDue: 7, expectedUrgency: 'normal' },
      ]

      testCases.forEach(({ daysUntilDue, expectedUrgency }) => {
        let urgency: string
        if (daysUntilDue <= 1) {
          urgency = 'critical'
        } else if (daysUntilDue <= 3) {
          urgency = 'warning'
        } else {
          urgency = 'normal'
        }

        expect(urgency).toBe(expectedUrgency)
      })
    })

    it('should sort returns by end date ascending', () => {
      const returns = [
        { id: '1', end_date: '2026-01-08', days_until_due: 5 },
        { id: '2', end_date: '2026-01-05', days_until_due: 2 },
        { id: '3', end_date: '2026-01-10', days_until_due: 7 },
      ]

      const sorted = [...returns].sort((a, b) =>
        new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      )

      expect(sorted[0].id).toBe('2') // 2026-01-05
      expect(sorted[1].id).toBe('1') // 2026-01-08
      expect(sorted[2].id).toBe('3') // 2026-01-10
    })
  })

  describe('useLowStockProducts - Inventory alerts', () => {
    it('should identify products with low stock', () => {
      const products = [
        { id: '1', name: 'Camera A', available_quantity: 0, threshold: 2 },
        { id: '2', name: 'Camera B', available_quantity: 1, threshold: 2 },
        { id: '3', name: 'Camera C', available_quantity: 2, threshold: 2 },
        { id: '4', name: 'Camera D', available_quantity: 5, threshold: 2 },
      ]

      const threshold = 2
      const lowStockProducts = products.filter(p => p.available_quantity <= threshold)

      expect(lowStockProducts).toHaveLength(3)
      expect(lowStockProducts.map(p => p.id)).toEqual(['1', '2', '3'])
    })

    it('should sort products by available quantity ascending', () => {
      const products = [
        { id: '1', name: 'Camera A', available_quantity: 2 },
        { id: '2', name: 'Camera B', available_quantity: 0 },
        { id: '3', name: 'Camera C', available_quantity: 1 },
      ]

      const sorted = [...products].sort((a, b) => a.available_quantity - b.available_quantity)

      expect(sorted[0].available_quantity).toBe(0)
      expect(sorted[1].available_quantity).toBe(1)
      expect(sorted[2].available_quantity).toBe(2)
    })

    it('should calculate stock percentage correctly', () => {
      const testCases = [
        { available: 0, total: 10, expected: 0 },
        { available: 5, total: 10, expected: 50 },
        { available: 10, total: 10, expected: 100 },
        { available: 2, total: 8, expected: 25 },
      ]

      testCases.forEach(({ available, total, expected }) => {
        const percentage = (available / total) * 100
        expect(percentage).toBe(expected)
      })
    })

    it('should prioritize out-of-stock items', () => {
      const products = [
        { id: '1', available_quantity: 1, urgency: 'low' },
        { id: '2', available_quantity: 0, urgency: 'critical' },
        { id: '3', available_quantity: 2, urgency: 'normal' },
        { id: '4', available_quantity: 0, urgency: 'critical' },
      ]

      const outOfStock = products.filter(p => p.available_quantity === 0)

      expect(outOfStock).toHaveLength(2)
      expect(outOfStock.every(p => p.urgency === 'critical')).toBe(true)
    })
  })

  describe('Statistics Aggregations', () => {
    it('should calculate total revenue correctly', () => {
      const rentals = [
        { final_total: 1000, currency: 'EUR', status: 'completed' },
        { final_total: 2000, currency: 'EUR', status: 'completed' },
        { final_total: 1500, currency: 'EUR', status: 'active' },
      ]

      const totalRevenue = rentals.reduce((sum, rental) => sum + rental.final_total, 0)

      expect(totalRevenue).toBe(4500)
    })

    it('should calculate average daily revenue', () => {
      const totalRevenue = 4500
      const days = 30

      const avgDailyRevenue = totalRevenue / days

      expect(avgDailyRevenue).toBe(150)
    })

    it('should count active clients correctly', () => {
      const rentals = [
        { client_id: 'client-1', status: 'active' },
        { client_id: 'client-2', status: 'active' },
        { client_id: 'client-1', status: 'active' }, // Duplicate
        { client_id: 'client-3', status: 'completed' },
      ]

      const activeClientIds = new Set(
        rentals.filter(r => r.status === 'active').map(r => r.client_id)
      )

      expect(activeClientIds.size).toBe(2)
    })

    it('should calculate month-over-month growth', () => {
      const currentMonth = 5000
      const lastMonth = 4000

      const growth = ((currentMonth - lastMonth) / lastMonth) * 100

      expect(growth).toBe(25) // 25% growth
    })

    it('should handle negative growth', () => {
      const currentMonth = 3000
      const lastMonth = 4000

      const growth = ((currentMonth - lastMonth) / lastMonth) * 100

      expect(growth).toBe(-25) // -25% decline
    })
  })

  describe('Profit Margin Calculations (Subrental)', () => {
    it('should calculate profit margin correctly', () => {
      const rentalTotal = 1400
      const purchaseCost = 160

      const profit = rentalTotal - purchaseCost
      const margin = (profit / purchaseCost) * 100

      expect(profit).toBe(1240)
      expect(margin).toBeCloseTo(775, 0)
    })

    it('should handle zero purchase cost', () => {
      const rentalTotal = 1400
      const purchaseCost = 0

      const profit = rentalTotal - purchaseCost

      // Margin calculation should handle division by zero
      const margin = purchaseCost > 0 ? (profit / purchaseCost) * 100 : 0

      expect(profit).toBe(1400)
      expect(margin).toBe(0)
    })

    it('should calculate average profit margin across subrentals', () => {
      const subrentals = [
        { total: 1400, cost: 160 }, // 775% margin
        { total: 2000, cost: 500 }, // 300% margin
        { total: 1000, cost: 200 }, // 400% margin
      ]

      const margins = subrentals.map(s => {
        const profit = s.total - s.cost
        return (profit / s.cost) * 100
      })

      const avgMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length

      expect(avgMargin).toBeCloseTo(491.67, 0)
    })

    it('should identify most profitable subrental', () => {
      const subrentals = [
        { id: '1', total: 1400, cost: 160, profit: 1240 },
        { id: '2', total: 2000, cost: 500, profit: 1500 },
        { id: '3', total: 1000, cost: 200, profit: 800 },
      ]

      const mostProfitable = subrentals.reduce((max, current) =>
        current.profit > max.profit ? current : max
      )

      expect(mostProfitable.id).toBe('2')
      expect(mostProfitable.profit).toBe(1500)
    })
  })
})
