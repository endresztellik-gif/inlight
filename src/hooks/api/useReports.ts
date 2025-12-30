import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Report filter types
export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

export interface RentalReportFilters extends DateRangeFilter {
  status?: string
  clientId?: string
}

export interface ClientReportFilters extends DateRangeFilter {
  activeOnly?: boolean
}

export interface ProductReportFilters extends DateRangeFilter {
  categoryId?: string
}

export interface RevenueReportFilters extends DateRangeFilter {
  currency?: string
  groupBy?: 'day' | 'week' | 'month'
}

export interface SubrentalProfitFilters extends DateRangeFilter {
  supplierName?: string
}

// Report data types
export interface RentalReportData {
  id: string
  rental_number: string
  client_name: string
  project_name: string
  start_date: string
  end_date: string
  status: string
  final_total: number
  final_currency: string
  type: 'rental' | 'subrental'
}

export interface ClientStatData {
  client_id: string
  client_name: string
  company: string | null
  total_rentals: number
  total_revenue: number
  last_rental_date: string | null
  avg_rental_value: number
}

export interface ProductUtilizationData {
  product_id: string
  product_name: string
  serial_number: string
  category_name: string
  times_rented: number
  total_days: number
  total_revenue: number
  avg_daily_rate: number
}

export interface RevenueData {
  period: string
  currency: string
  total: number
  rental_count: number
}

export interface SubrentalProfitData {
  id: string
  rental_number: string
  supplier_name: string
  client_name: string
  start_date: string
  end_date: string
  purchase_cost: number
  rental_revenue: number
  profit: number
  profit_margin: number
}

/**
 * Rental Report - List of rentals with filters
 */
export function useRentalReport(filters: RentalReportFilters = {}) {
  return useQuery({
    queryKey: ['rentalReport', filters],
    queryFn: async () => {
      let query = supabase
        .from('rentals')
        .select(`
          id,
          rental_number,
          project_name,
          start_date,
          end_date,
          status,
          final_total,
          final_currency,
          type,
          clients (
            name,
            company
          )
        `)
        .order('created_at', { ascending: false })

      // Date range filter
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate)
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // Client filter
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data
      const rentals: RentalReportData[] = (data || []).map((rental: any) => ({
        id: rental.id,
        rental_number: rental.rental_number,
        client_name: rental.clients?.name || 'Unknown',
        project_name: rental.project_name,
        start_date: rental.start_date,
        end_date: rental.end_date,
        status: rental.status,
        final_total: rental.final_total || 0,
        final_currency: rental.final_currency || 'EUR',
        type: rental.type || 'rental',
      }))

      // Calculate summary stats
      const totalRevenue = rentals.reduce((sum, r) => sum + r.final_total, 0)
      const avgDailyRate = rentals.length > 0 ? totalRevenue / rentals.length : 0

      return {
        rentals,
        summary: {
          totalCount: rentals.length,
          totalRevenue,
          avgDailyRate,
          activeCount: rentals.filter(r => r.status === 'active').length,
          completedCount: rentals.filter(r => r.status === 'completed').length,
        },
      }
    },
  })
}

/**
 * Client Statistics - Aggregated client data
 */
export function useClientStatistics(filters: ClientReportFilters = {}) {
  return useQuery({
    queryKey: ['clientStatistics', filters],
    queryFn: async () => {
      // Fetch all rentals with client info
      let query = supabase
        .from('rentals')
        .select(`
          id,
          client_id,
          final_total,
          final_currency,
          created_at,
          clients (
            id,
            name,
            company
          )
        `)

      // Date range filter
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by client
      const clientMap = new Map<string, ClientStatData>()

      ;(data || []).forEach((rental: any) => {
        const clientId = rental.client_id
        const clientName = rental.clients?.name || 'Unknown'
        const company = rental.clients?.company || null

        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, {
            client_id: clientId,
            client_name: clientName,
            company,
            total_rentals: 0,
            total_revenue: 0,
            last_rental_date: null,
            avg_rental_value: 0,
          })
        }

        const client = clientMap.get(clientId)!
        client.total_rentals += 1
        client.total_revenue += rental.final_total || 0

        if (!client.last_rental_date || rental.created_at > client.last_rental_date) {
          client.last_rental_date = rental.created_at
        }
      })

      // Calculate averages and convert to array
      const clients = Array.from(clientMap.values()).map(client => ({
        ...client,
        avg_rental_value: client.total_rentals > 0 ? client.total_revenue / client.total_rentals : 0,
      }))

      // Sort by total revenue (descending)
      clients.sort((a, b) => b.total_revenue - a.total_revenue)

      return {
        clients,
        summary: {
          totalClients: clients.length,
          totalRevenue: clients.reduce((sum, c) => sum + c.total_revenue, 0),
          avgRevenuePerClient: clients.length > 0
            ? clients.reduce((sum, c) => sum + c.total_revenue, 0) / clients.length
            : 0,
          topClient: clients[0] || null,
        },
      }
    },
  })
}

/**
 * Product Utilization - Product rental statistics
 */
export function useProductUtilization(filters: ProductReportFilters = {}) {
  return useQuery({
    queryKey: ['productUtilization', filters],
    queryFn: async () => {
      // Fetch all rental items with product info
      let rentalQuery = supabase
        .from('rental_items')
        .select(`
          id,
          product_id,
          quantity,
          daily_rate,
          days,
          subtotal,
          rental_id,
          rentals!inner (
            start_date,
            end_date,
            type
          ),
          products (
            id,
            name,
            serial_number,
            category_id,
            categories (
              name
            )
          )
        `)

      const { data, error } = await rentalQuery

      if (error) throw error

      // Filter by date range if provided
      let filteredData = data || []
      if (filters.startDate || filters.endDate) {
        filteredData = filteredData.filter((item: any) => {
          const rentalStart = item.rentals?.start_date
          if (filters.startDate && rentalStart < filters.startDate) return false
          if (filters.endDate && rentalStart > filters.endDate) return false
          return true
        })
      }

      // Filter by category
      if (filters.categoryId) {
        filteredData = filteredData.filter((item: any) =>
          item.products?.category_id === filters.categoryId
        )
      }

      // Group by product
      const productMap = new Map<string, ProductUtilizationData>()

      filteredData.forEach((item: any) => {
        const productId = item.product_id
        const productName = item.products?.name || 'Unknown'
        const serialNumber = item.products?.serial_number || 'N/A'
        const categoryName = item.products?.categories?.name || 'Uncategorized'

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            product_name: productName,
            serial_number: serialNumber,
            category_name: categoryName,
            times_rented: 0,
            total_days: 0,
            total_revenue: 0,
            avg_daily_rate: 0,
          })
        }

        const product = productMap.get(productId)!
        product.times_rented += 1
        product.total_days += item.days || 0
        product.total_revenue += item.subtotal || 0
      })

      // Calculate averages and convert to array
      const products = Array.from(productMap.values()).map(product => ({
        ...product,
        avg_daily_rate: product.total_days > 0 ? product.total_revenue / product.total_days : 0,
      }))

      // Sort by total revenue (descending)
      products.sort((a, b) => b.total_revenue - a.total_revenue)

      return {
        products,
        summary: {
          totalProducts: products.length,
          totalRevenue: products.reduce((sum, p) => sum + p.total_revenue, 0),
          totalRentalDays: products.reduce((sum, p) => sum + p.total_days, 0),
          mostPopular: products[0] || null,
        },
      }
    },
  })
}

/**
 * Revenue Report - Revenue over time
 */
export function useRevenueReport(filters: RevenueReportFilters = {}) {
  return useQuery({
    queryKey: ['revenueReport', filters],
    queryFn: async () => {
      let query = supabase
        .from('rentals')
        .select(`
          id,
          created_at,
          final_total,
          final_currency,
          status
        `)
        .order('created_at', { ascending: true })

      // Date range filter
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      // Currency filter
      if (filters.currency && filters.currency !== 'all') {
        query = query.eq('final_currency', filters.currency)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by period
      const groupBy = filters.groupBy || 'month'
      const revenueMap = new Map<string, RevenueData>()

      ;(data || []).forEach((rental: any) => {
        const date = new Date(rental.created_at)
        let period: string

        if (groupBy === 'day') {
          period = date.toISOString().split('T')[0] // YYYY-MM-DD
        } else if (groupBy === 'week') {
          // Get week number
          const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7)
          period = `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
        } else {
          // month
          period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        }

        const currency = rental.final_currency || 'EUR'
        const key = `${period}-${currency}`

        if (!revenueMap.has(key)) {
          revenueMap.set(key, {
            period,
            currency,
            total: 0,
            rental_count: 0,
          })
        }

        const revenue = revenueMap.get(key)!
        revenue.total += rental.final_total || 0
        revenue.rental_count += 1
      })

      const revenues = Array.from(revenueMap.values())
      revenues.sort((a, b) => a.period.localeCompare(b.period))

      return {
        revenues,
        summary: {
          totalRevenue: revenues.reduce((sum, r) => sum + r.total, 0),
          totalRentals: revenues.reduce((sum, r) => sum + r.rental_count, 0),
          avgRevenuePerPeriod: revenues.length > 0
            ? revenues.reduce((sum, r) => sum + r.total, 0) / revenues.length
            : 0,
        },
      }
    },
  })
}

/**
 * Subrental Profit Analysis - Profit margin for subrentals
 */
export function useSubrentalProfitAnalysis(filters: SubrentalProfitFilters = {}) {
  return useQuery({
    queryKey: ['subrentalProfit', filters],
    queryFn: async () => {
      let query = supabase
        .from('rentals')
        .select(`
          id,
          rental_number,
          supplier_name,
          start_date,
          end_date,
          final_total,
          final_currency,
          clients (
            name
          ),
          rental_items (
            quantity,
            purchase_price,
            subtotal
          )
        `)
        .eq('type', 'subrental')
        .order('created_at', { ascending: false })

      // Date range filter
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate)
      }

      // Supplier filter
      if (filters.supplierName) {
        query = query.ilike('supplier_name', `%${filters.supplierName}%`)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate profit for each subrental
      const subrentals: SubrentalProfitData[] = (data || []).map((subrental: any) => {
        // Calculate total purchase cost
        const purchaseCost = (subrental.rental_items || []).reduce(
          (sum: number, item: any) => sum + ((item.purchase_price || 0) * (item.quantity || 0)),
          0
        )

        const rentalRevenue = subrental.final_total || 0
        const profit = rentalRevenue - purchaseCost
        const profitMargin = purchaseCost > 0 ? (profit / purchaseCost) * 100 : 0

        return {
          id: subrental.id,
          rental_number: subrental.rental_number,
          supplier_name: subrental.supplier_name || 'Unknown',
          client_name: subrental.clients?.name || 'Unknown',
          start_date: subrental.start_date,
          end_date: subrental.end_date,
          purchase_cost: purchaseCost,
          rental_revenue: rentalRevenue,
          profit,
          profit_margin: profitMargin,
        }
      })

      return {
        subrentals,
        summary: {
          totalSubrentals: subrentals.length,
          totalPurchaseCost: subrentals.reduce((sum, s) => sum + s.purchase_cost, 0),
          totalRevenue: subrentals.reduce((sum, s) => sum + s.rental_revenue, 0),
          totalProfit: subrentals.reduce((sum, s) => sum + s.profit, 0),
          avgProfitMargin: subrentals.length > 0
            ? subrentals.reduce((sum, s) => sum + s.profit_margin, 0) / subrentals.length
            : 0,
        },
      }
    },
  })
}
