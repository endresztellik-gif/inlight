import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

interface ProductsFilters {
  categoryId?: string
  searchQuery?: string
  isActive?: boolean
  isFeatured?: boolean
}

// Fetch products with optional filters
export function useProducts(filters: ProductsFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name', { ascending: true })

      // Apply filters
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured)
      }

      const { data, error } = await query

      if (error) throw error
      return data as (Product & { category: Database['public']['Tables']['categories']['Row'] })[]
    },
  })
}

// Fetch single product by ID
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Product & { category: Database['public']['Tables']['categories']['Row'] }
    },
    enabled: !!id,
  })
}

// Fetch featured products
export function useFeaturedProducts(limit = 10) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(limit)

      if (error) throw error
      return data as (Product & { category: Database['public']['Tables']['categories']['Row'] })[]
    },
  })
}

// Fetch available products (stock > 0)
export function useAvailableProducts(filters: ProductsFilters = {}) {
  return useQuery({
    queryKey: ['products', 'available', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true)
        .gt('available_quantity', 0)
        .order('name', { ascending: true })

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data as (Product & { category: Database['public']['Tables']['categories']['Row'] })[]
    },
  })
}

// Fetch all products (including inactive) - for admin
export function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name', { ascending: true })

      if (error) throw error
      return data as (Product & { category: Database['public']['Tables']['categories']['Row'] })[]
    },
  })
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select(`
          *,
          category:categories(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      updates: ProductUpdate
    }) => {
      const { data, error } = await supabase
        .from('products')
        .update(params.updates)
        .eq('id', params.id)
        .select(`
          *,
          category:categories(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', data.id] })
    },
  })
}

// Delete product (soft delete - set is_active to false)
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
