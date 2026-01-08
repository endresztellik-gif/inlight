import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { del } from 'idb-keyval'

/**
 * Custom IndexedDB Persister for React Query
 *
 * Stores query cache in IndexedDB for offline support
 * Cache TTL: 24 hours
 */

const CACHE_KEY = 'react_query_offline_cache'
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

/**
 * Create QueryClient with offline support
 */
export function createOfflineQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 24 hours
        gcTime: CACHE_TTL,
        staleTime: 1000 * 60 * 5, // 5 minutes (when online, refetch stale data)

        // Retry strategy
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          // Retry up to 2 times for other errors
          return failureCount < 2
        },

        // Network mode: always use cache when offline
        networkMode: 'offlineFirst',
      },
      mutations: {
        // Network mode: queue mutations when offline
        networkMode: 'offlineFirst',
        retry: 1,
      },
    },
  })

  // Setup persistence
  const persister = createSyncStoragePersister({
    storage: window.localStorage, // Fallback to localStorage
    key: CACHE_KEY,
    throttleTime: 1000, // Throttle saves to 1 second
  })

  persistQueryClient({
    queryClient,
    persister,
    maxAge: CACHE_TTL,
    dehydrateOptions: {
      // Only persist successful queries
      shouldDehydrateQuery: (query) => {
        return query.state.status === 'success'
      },
    },
  })

  return queryClient
}

/**
 * Clear all persisted query cache
 */
export async function clearPersistedCache(): Promise<void> {
  window.localStorage.removeItem(CACHE_KEY)
  await del(CACHE_KEY)
}

/**
 * Get cache statistics
 */
export async function getCacheStats(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache()
  const queries = cache.getAll()

  return {
    totalQueries: queries.length,
    successQueries: queries.filter(q => q.state.status === 'success').length,
    errorQueries: queries.filter(q => q.state.status === 'error').length,
    loadingQueries: queries.filter(q => q.state.status === 'pending').length,
    staleQueries: queries.filter(q => q.isStale()).length,
  }
}
