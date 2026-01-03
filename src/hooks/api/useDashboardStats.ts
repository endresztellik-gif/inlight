import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  activeRentals: number
  activeRentalsToday: number
  activeSubrentals: number
  activeSubrentalsToday: number
  pendingReturns: number
  pendingReturnsToday: number
  overdueReturns: number
  revenueToday: number
  revenueThisWeek: number
  revenueThisMonth: number
  totalProfit: number
  avgProfitMargin: number
  lowStockCount: number
  totalClients: number
  activeClients: number
  rentalCount: number
  subrentalCount: number
}

export interface RecentActivity {
  id: string
  type: 'rental' | 'subrental' | 'return' | 'client'
  title: string
  subtitle: string
  timestamp: string
  status?: string
}

export interface TopProduct {
  id: string
  name: string
  serial_number: string
  times_rented: number
  revenue: number
}

export interface TopClient {
  id: string
  name: string
  company: string | null
  total_rentals: number
  total_revenue: number
}

export interface RevenueTrend {
  date: string
  revenue: number
}

export interface UpcomingReturn {
  id: string
  rental_number: string
  type: 'rental' | 'subrental'
  client_name: string
  end_date: string
  days_until_due: number
  status: string
}

export interface LowStockProduct {
  id: string
  name: string
  serial_number: string
  available_quantity: number
  stock_quantity: number
  category_name: string
}

/**
 * Get dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // Fetch all rentals (including type for subrental tracking)
      const { data: allRentals, error: rentalsError } = await supabase
        .from('rentals')
        .select('id, type, status, final_total, created_at, start_date, end_date')
        .order('created_at', { ascending: false })

      if (rentalsError) throw rentalsError

      // Calculate stats (separate rentals vs subrentals)
      const activeRentals = allRentals?.filter(
        r => r.status === 'active' && r.type === 'rental'
      ).length || 0
      const activeRentalsToday = allRentals?.filter(
        r => r.status === 'active' && r.type === 'rental' && new Date(r.created_at) >= today
      ).length || 0

      const activeSubrentals = allRentals?.filter(
        r => r.status === 'active' && r.type === 'subrental'
      ).length || 0
      const activeSubrentalsToday = allRentals?.filter(
        r => r.status === 'active' && r.type === 'subrental' && new Date(r.created_at) >= today
      ).length || 0

      const pendingReturns = allRentals?.filter(r => r.status === 'pending_return').length || 0
      const pendingReturnsToday = allRentals?.filter(
        r => r.status === 'pending_return' && new Date(r.end_date) <= now
      ).length || 0

      const overdueReturns = allRentals?.filter(
        r => (r.status === 'active' || r.status === 'pending_return') &&
             new Date(r.end_date) < today
      ).length || 0

      // Distribution counts
      const rentalCount = allRentals?.filter(r => r.type === 'rental').length || 0
      const subrentalCount = allRentals?.filter(r => r.type === 'subrental').length || 0

      const revenueToday = allRentals
        ?.filter(r => new Date(r.created_at) >= today)
        .reduce((sum, r) => sum + (r.final_total || 0), 0) || 0

      const revenueThisWeek = allRentals
        ?.filter(r => new Date(r.created_at) >= weekAgo)
        .reduce((sum, r) => sum + (r.final_total || 0), 0) || 0

      const revenueThisMonth = allRentals
        ?.filter(r => new Date(r.created_at) >= monthStart)
        .reduce((sum, r) => sum + (r.final_total || 0), 0) || 0

      // Calculate profit for subrentals
      const subrentalIds = allRentals
        ?.filter(r => r.type === 'subrental')
        .map(r => r.id) || []

      let totalProfit = 0
      let avgProfitMargin = 0

      if (subrentalIds.length > 0) {
        // Fetch rental items for subrentals with purchase_price
        const { data: subrentalItems, error: itemsError } = await supabase
          .from('rental_items')
          .select('rental_id, quantity, purchase_price, subtotal')
          .in('rental_id', subrentalIds)

        if (itemsError) throw itemsError

        // Calculate profit for each subrental
        const subrentalProfits = new Map<string, { revenue: number; cost: number }>()

        subrentalItems?.forEach((item: any) => {
          const rentalId = item.rental_id
          if (!subrentalProfits.has(rentalId)) {
            subrentalProfits.set(rentalId, { revenue: 0, cost: 0 })
          }
          const data = subrentalProfits.get(rentalId)!
          data.revenue += item.subtotal || 0
          data.cost += (item.purchase_price || 0) * (item.quantity || 0)
        })

        // Calculate total profit and average margin
        let totalMargin = 0
        let marginCount = 0

        subrentalProfits.forEach((data) => {
          const profit = data.revenue - data.cost
          totalProfit += profit

          if (data.cost > 0) {
            const margin = (profit / data.cost) * 100
            totalMargin += margin
            marginCount++
          }
        })

        avgProfitMargin = marginCount > 0 ? totalMargin / marginCount : 0
      }

      // Fetch products for low stock count
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, available_quantity')
        .eq('is_active', true)

      if (productsError) throw productsError

      const lowStockCount = products?.filter(p => p.available_quantity <= 2).length || 0

      // Fetch clients count
      const { count: totalClients, error: clientsCountError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

      if (clientsCountError) throw clientsCountError

      const { count: activeClients, error: activeClientsError } = await supabase
        .from('rentals')
        .select('client_id', { count: 'exact', head: true })
        .eq('status', 'active')

      if (activeClientsError) throw activeClientsError

      const stats: DashboardStats = {
        activeRentals,
        activeRentalsToday,
        activeSubrentals,
        activeSubrentalsToday,
        pendingReturns,
        pendingReturnsToday,
        overdueReturns,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
        totalProfit,
        avgProfitMargin,
        lowStockCount,
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        rentalCount,
        subrentalCount,
      }

      return stats
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  })
}

/**
 * Get recent activity
 */
export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['recentActivity', limit],
    queryFn: async () => {
      // Fetch recent rentals
      const { data: rentals, error: rentalsError } = await supabase
        .from('rentals')
        .select(`
          id,
          rental_number,
          type,
          status,
          created_at,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (rentalsError) throw rentalsError

      // Transform to activity items
      const activities: RecentActivity[] = (rentals || []).map((rental: any) => ({
        id: rental.id,
        type: rental.type === 'subrental' ? 'subrental' : 'rental',
        title: rental.rental_number,
        subtitle: rental.clients?.name || 'Unknown Client',
        timestamp: rental.created_at,
        status: rental.status,
      }))

      return activities
    },
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Get top products by revenue
 */
export function useTopProducts(limit: number = 5) {
  return useQuery({
    queryKey: ['topProducts', limit],
    queryFn: async () => {
      // Fetch all rental items with product info
      const { data: rentalItems, error } = await supabase
        .from('rental_items')
        .select(`
          id,
          product_id,
          subtotal,
          products (
            id,
            name,
            serial_number
          )
        `)

      if (error) throw error

      // Group by product and calculate revenue
      const productMap = new Map<string, TopProduct>()

      ;(rentalItems || []).forEach((item: any) => {
        const productId = item.product_id
        const productName = item.products?.name || 'Unknown'
        const serialNumber = item.products?.serial_number || 'N/A'

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            id: productId,
            name: productName,
            serial_number: serialNumber,
            times_rented: 0,
            revenue: 0,
          })
        }

        const product = productMap.get(productId)!
        product.times_rented += 1
        product.revenue += item.subtotal || 0
      })

      // Convert to array and sort by revenue
      const products = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)

      return products
    },
    refetchInterval: 5 * 60 * 1000,
  })
}

/**
 * Get top clients by revenue
 */
export function useTopClients(limit: number = 5) {
  return useQuery({
    queryKey: ['topClients', limit],
    queryFn: async () => {
      // Fetch all rentals with client info
      const { data: rentals, error } = await supabase
        .from('rentals')
        .select(`
          id,
          client_id,
          final_total,
          clients (
            id,
            name,
            company
          )
        `)

      if (error) throw error

      // Group by client
      const clientMap = new Map<string, TopClient>()

      ;(rentals || []).forEach((rental: any) => {
        const clientId = rental.client_id
        const clientName = rental.clients?.name || 'Unknown'
        const company = rental.clients?.company || null

        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, {
            id: clientId,
            name: clientName,
            company,
            total_rentals: 0,
            total_revenue: 0,
          })
        }

        const client = clientMap.get(clientId)!
        client.total_rentals += 1
        client.total_revenue += rental.final_total || 0
      })

      // Convert to array and sort by revenue
      const clients = Array.from(clientMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, limit)

      return clients
    },
    refetchInterval: 5 * 60 * 1000,
  })
}

/**
 * Get revenue trend for last 30 days
 */
export function useRevenueTrend(days: number = 30) {
  return useQuery({
    queryKey: ['revenueTrend', days],
    queryFn: async () => {
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - days)

      // Fetch rentals from last N days
      const { data: rentals, error } = await supabase
        .from('rentals')
        .select('created_at, final_total')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date
      const revenueMap = new Map<string, number>()

      // Initialize all dates with 0
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        revenueMap.set(dateStr, 0)
      }

      // Add actual revenue
      ;(rentals || []).forEach((rental: any) => {
        const dateStr = rental.created_at.split('T')[0]
        const current = revenueMap.get(dateStr) || 0
        revenueMap.set(dateStr, current + (rental.final_total || 0))
      })

      // Convert to array
      const trend: RevenueTrend[] = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      }))

      return trend
    },
    refetchInterval: 5 * 60 * 1000,
  })
}

/**
 * Get upcoming returns (next 7 days)
 */
export function useUpcomingReturns(days: number = 7) {
  return useQuery({
    queryKey: ['upcomingReturns', days],
    queryFn: async () => {
      const now = new Date()
      const futureDate = new Date(now)
      futureDate.setDate(futureDate.getDate() + days)

      // Fetch rentals that are active or pending return and due within next N days
      const { data: rentals, error } = await supabase
        .from('rentals')
        .select(`
          id,
          rental_number,
          type,
          end_date,
          status,
          clients (
            name
          )
        `)
        .in('status', ['active', 'pending_return'])
        .gte('end_date', now.toISOString())
        .lte('end_date', futureDate.toISOString())
        .order('end_date', { ascending: true })

      if (error) throw error

      // Transform to upcoming returns
      const upcomingReturns: UpcomingReturn[] = (rentals || []).map((rental: any) => {
        const endDate = new Date(rental.end_date)
        const daysUntilDue = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return {
          id: rental.id,
          rental_number: rental.rental_number,
          type: rental.type,
          client_name: rental.clients?.name || 'Unknown',
          end_date: rental.end_date,
          days_until_due: daysUntilDue,
          status: rental.status,
        }
      })

      return upcomingReturns
    },
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Get low stock products
 */
export function useLowStockProducts(threshold: number = 2) {
  return useQuery({
    queryKey: ['lowStockProducts', threshold],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          serial_number,
          available_quantity,
          stock_quantity,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .lte('available_quantity', threshold)
        .order('available_quantity', { ascending: true })

      if (error) throw error

      const lowStockProducts: LowStockProduct[] = (products || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        serial_number: product.serial_number,
        available_quantity: product.available_quantity,
        stock_quantity: product.stock_quantity,
        category_name: product.categories?.name || 'Unknown',
      }))

      return lowStockProducts
    },
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
