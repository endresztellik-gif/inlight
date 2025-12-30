import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

// Fetch all active categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      return data as Category[]
    },
  })
}

// Fetch all categories (including inactive) - for admin
export function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      return data as Category[]
    },
  })
}

// Fetch single category by ID
export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Category
    },
    enabled: !!id,
  })
}

// Create category
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (category: Omit<CategoryInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

// Update category
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      updates: CategoryUpdate
    }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(params.updates)
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', data.id] })
    },
  })
}

// Delete category (soft delete - set is_active to false)
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

// Get category statistics (number of products per category)
export function useCategoryStats() {
  return useQuery({
    queryKey: ['category-stats'],
    queryFn: async () => {
      // Get all categories with product count
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, name_en, name_hu')
        .eq('is_active', true)

      if (catError) throw catError

      // Get product counts per category
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true)

      if (prodError) throw prodError

      // Count products per category
      const counts = products.reduce((acc, p) => {
        acc[p.category_id] = (acc[p.category_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        name_en: cat.name_en,
        name_hu: cat.name_hu,
        productCount: counts[cat.id] || 0
      }))
    },
  })
}
