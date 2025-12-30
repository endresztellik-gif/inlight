import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Rental = Database['public']['Tables']['rentals']['Row']
type RentalInsert = Database['public']['Tables']['rentals']['Insert']
type RentalUpdate = Database['public']['Tables']['rentals']['Update']
type RentalItem = Database['public']['Tables']['rental_items']['Row']
type RentalItemInsert = Database['public']['Tables']['rental_items']['Insert']

// Extended types with JOINs
export interface RentalWithClient extends Rental {
  clients: {
    name: string
    email: string | null
    phone: string | null
    company: string | null
    address: string | null
  }
}

export interface RentalWithDetails extends RentalWithClient {
  rental_items: Array<RentalItem & {
    products: {
      name: string
      category_id: string
      serial_number: string
    }
  }>
}

// Fetch all rentals with client information
export function useRentals(statusFilter?: string) {
  return useQuery({
    queryKey: ['rentals', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('rentals')
        .select(`
          *,
          clients (
            name,
            email,
            phone,
            company,
            address
          )
        `)
        .order('created_at', { ascending: false })

      // Apply status filter if provided
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      return data as RentalWithClient[]
    },
  })
}

// Fetch single rental with full details
export function useRental(id: string | undefined) {
  return useQuery({
    queryKey: ['rental', id],
    queryFn: async () => {
      if (!id) throw new Error('Rental ID is required')

      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          clients (
            name,
            email,
            phone,
            company,
            address,
            tax_number,
            contact_person_name,
            contact_person_email,
            contact_person_phone
          ),
          rental_items (
            *,
            products (
              name,
              category_id,
              serial_number
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as RentalWithDetails
    },
    enabled: !!id,
  })
}

// Generate unique rental number (format: R-YYYYMMDD-XXXX)
async function generateRentalNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

  // Get count of rentals created today
  const { count, error } = await supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(today.setHours(0, 0, 0, 0)).toISOString())
    .lt('created_at', new Date(today.setHours(23, 59, 59, 999)).toISOString())

  if (error) throw error

  const nextNumber = (count || 0) + 1
  const paddedNumber = String(nextNumber).padStart(4, '0')

  return `R-${dateStr}-${paddedNumber}`
}

// Create rental with items
export function useCreateRental() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      rental: Omit<RentalInsert, 'rental_number'>
      items: Array<Omit<RentalItemInsert, 'rental_id'>>
    }) => {
      // Generate rental number
      const rentalNumber = await generateRentalNumber()

      // Create rental
      const { data: rentalData, error: rentalError } = await supabase
        .from('rentals')
        .insert({
          ...params.rental,
          rental_number: rentalNumber,
        })
        .select()
        .single()

      if (rentalError) throw rentalError

      // Create rental items
      const itemsWithRentalId = params.items.map(item => ({
        ...item,
        rental_id: rentalData.id,
      }))

      const { error: itemsError } = await supabase
        .from('rental_items')
        .insert(itemsWithRentalId)

      if (itemsError) throw itemsError

      return rentalData
    },
    onSuccess: () => {
      // Invalidate rentals queries
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
    },
  })
}

// Update rental
export function useUpdateRental() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      updates: RentalUpdate
    }) => {
      const { data, error } = await supabase
        .from('rentals')
        .update(params.updates)
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rental', data.id] })
    },
  })
}

// Update rental status
export function useUpdateRentalStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      status: string
    }) => {
      const { data, error } = await supabase
        .from('rentals')
        .update({ status: params.status })
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rental', data.id] })
    },
  })
}

// Process return (update rental_items)
export function useProcessReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      rentalId: string
      items: Array<{
        id: string
        condition_on_return: string
        is_returned: boolean
      }>
    }) => {
      // Update each rental item
      const updates = params.items.map(item =>
        supabase
          .from('rental_items')
          .update({
            condition_on_return: item.condition_on_return,
            is_returned: item.is_returned,
            returned_at: item.is_returned ? new Date().toISOString() : null,
          })
          .eq('id', item.id)
      )

      const results = await Promise.all(updates)

      // Check if all items are returned
      const allReturned = params.items.every(item => item.is_returned)

      if (allReturned) {
        // Update rental status to completed
        await supabase
          .from('rentals')
          .update({ status: 'completed' })
          .eq('id', params.rentalId)
      }

      return results
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rental', variables.rentalId] })
    },
  })
}

// Soft delete rental (cancel)
export function useDeleteRental() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('rentals')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
    },
  })
}

// Get rental statistics
export function useRentalStats() {
  return useQuery({
    queryKey: ['rental-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rentals')
        .select('status, final_total')

      if (error) throw error

      const stats = {
        active: 0,
        pending: 0,
        completed: 0,
        totalValue: 0,
      }

      data.forEach(rental => {
        if (rental.status === 'active') stats.active++
        if (rental.status === 'pending_return') stats.pending++
        if (rental.status === 'completed') stats.completed++
        if (rental.final_total) stats.totalValue += rental.final_total
      })

      return stats
    },
  })
}
