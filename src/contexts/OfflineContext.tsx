import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getPendingMutations,
  updateMutationStatus,
  removeFromQueue,
  getQueueStats,
  type QueuedMutation,
} from '@/lib/offlineQueue'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

interface OfflineContextType {
  isOnline: boolean
  isSyncing: boolean
  queuedMutationsCount: number
  syncNow: () => Promise<void>
  queueStats: {
    total: number
    pending: number
    syncing: number
    failed: number
    success: number
  }
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [queuedMutationsCount, setQueuedMutationsCount] = useState(0)
  const [queueStats, setQueueStats] = useState({
    total: 0,
    pending: 0,
    syncing: 0,
    failed: 0,
    success: 0,
  })

  // Update queue stats
  const updateStats = useCallback(async () => {
    const stats = await getQueueStats()
    setQueueStats(stats)
    setQueuedMutationsCount(stats.pending + stats.syncing)
  }, [])

  // Sync offline mutations
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return
    }

    setIsSyncing(true)

    try {
      const pending = await getPendingMutations()

      if (pending.length === 0) {
        setIsSyncing(false)
        return
      }

      toast({
        title: t('offline.syncStart', { count: pending.length }),
        description: t('offline.syncDescription'),
      })

      const results = {
        success: 0,
        failed: 0,
        conflicts: [] as QueuedMutation[],
      }

      // Process each mutation
      for (const mutation of pending) {
        await updateMutationStatus(mutation.id, 'syncing')

        try {
          // Execute the mutation based on type
          await executeMutation(mutation)

          // Mark as success
          await updateMutationStatus(mutation.id, 'success')
          results.success++

          // Remove from queue after 5 seconds (keep for undo)
          setTimeout(() => {
            removeFromQueue(mutation.id)
            updateStats()
          }, 5000)
        } catch (error: any) {
          // Check if it's a conflict error (409 status)
          if (error?.status === 409 || error?.message?.includes('conflict')) {
            results.conflicts.push(mutation)
            await updateMutationStatus(mutation.id, 'failed', 'Conflict detected')
          } else {
            results.failed++
            await updateMutationStatus(mutation.id, 'failed', error.message)
          }
        }
      }

      // Show sync results
      if (results.success > 0) {
        toast({
          title: t('offline.syncSuccess', { count: results.success }),
          variant: 'default',
        })
      }

      if (results.conflicts.length > 0) {
        toast({
          title: t('offline.syncConflicts', { count: results.conflicts.length }),
          description: t('offline.syncConflictsDescription'),
          variant: 'destructive',
        })
      }

      if (results.failed > 0) {
        toast({
          title: t('offline.syncFailed', { count: results.failed }),
          variant: 'destructive',
        })
      }

      // Invalidate relevant queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['rentals'] })
      await queryClient.invalidateQueries({ queryKey: ['subrentals'] })
      await queryClient.invalidateQueries({ queryKey: ['products'] })

      await updateStats()
    } catch (error) {
      console.error('Sync failed:', error)
      toast({
        title: t('offline.syncError'),
        variant: 'destructive',
      })
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, queryClient, toast, t, updateStats])

  // Execute mutation based on type
  async function executeMutation(mutation: QueuedMutation) {
    const { type, data } = mutation

    // Import supabase client dynamically to avoid circular dependencies
    const { supabase } = await import('@/lib/supabase')

    switch (type) {
      case 'rental_create': {
        const { rental, items } = data

        // Insert rental
        const { data: rentalData, error: rentalError } = await supabase
          .from('rentals')
          .insert(rental)
          .select()
          .single()

        if (rentalError) throw rentalError

        // Insert rental items
        const itemsWithRentalId = items.map((item: any) => ({
          ...item,
          rental_id: rentalData.id,
        }))

        const { error: itemsError } = await supabase
          .from('rental_items')
          .insert(itemsWithRentalId)

        if (itemsError) throw itemsError
        break
      }

      case 'subrental_create': {
        const { rental, items } = data

        // Insert subrental (stored in rentals table with type='subrental')
        const { data: subrentalData, error: subrentalError } = await supabase
          .from('rentals')
          .insert({
            ...rental,
            type: 'subrental', // Set type to subrental
          })
          .select()
          .single()

        if (subrentalError) throw subrentalError

        // Insert rental items
        const itemsWithRentalId = items.map((item: any) => ({
          ...item,
          rental_id: subrentalData.id,
        }))

        const { error: itemsError } = await supabase
          .from('rental_items')
          .insert(itemsWithRentalId)

        if (itemsError) throw itemsError
        break
      }

      case 'rental_return': {
        const { rentalId, returnDate, returnNotes } = data

        const { error } = await supabase
          .from('rentals')
          .update({
            status: 'completed',
            actual_end_date: returnDate,
            return_notes: returnNotes,
          })
          .eq('id', rentalId)

        if (error) throw error
        break
      }

      default:
        throw new Error(`Unknown mutation type: ${type}`)
    }
  }

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: t('offline.backOnline'),
        description: t('offline.backOnlineDescription'),
      })

      // Auto-sync when coming back online
      setTimeout(() => {
        syncNow()
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: t('offline.nowOffline'),
        description: t('offline.nowOfflineDescription'),
        variant: 'destructive',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncNow, toast, t])

  // Update stats on mount and periodically
  useEffect(() => {
    updateStats()

    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000)

    return () => clearInterval(interval)
  }, [updateStats])

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        queuedMutationsCount,
        syncNow,
        queueStats,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}
