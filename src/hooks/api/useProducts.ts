import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

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
