import { get, set, del, keys } from 'idb-keyval'

/**
 * Offline Queue System
 *
 * Stores mutations when offline and syncs them when online.
 * Uses IndexedDB via idb-keyval for persistent storage.
 */

export interface QueuedMutation {
  id: string
  timestamp: number
  type: 'rental_create' | 'rental_update' | 'rental_return' | 'subrental_create' | 'subrental_update'
  data: any
  status: 'pending' | 'syncing' | 'failed' | 'success'
  error?: string
  retryCount: number
}

export interface ConflictResolution {
  mutationId: string
  resolution: 'keep_local' | 'keep_remote' | 'merge'
  mergedData?: any
}

const QUEUE_PREFIX = 'offline_queue_'
const MAX_RETRY_COUNT = 3

/**
 * Add mutation to offline queue
 */
export async function addToQueue(
  type: QueuedMutation['type'],
  data: any
): Promise<string> {
  const id = `${QUEUE_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const mutation: QueuedMutation = {
    id,
    timestamp: Date.now(),
    type,
    data,
    status: 'pending',
    retryCount: 0,
  }

  await set(id, mutation)
  return id
}

/**
 * Get all queued mutations
 */
export async function getAllQueuedMutations(): Promise<QueuedMutation[]> {
  const allKeys = await keys()
  const queueKeys = allKeys.filter(key =>
    typeof key === 'string' && key.startsWith(QUEUE_PREFIX)
  )

  const mutations: QueuedMutation[] = []
  for (const key of queueKeys) {
    const mutation = await get(key)
    if (mutation) {
      mutations.push(mutation)
    }
  }

  return mutations.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Get pending mutations only
 */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const all = await getAllQueuedMutations()
  return all.filter(m => m.status === 'pending' && m.retryCount < MAX_RETRY_COUNT)
}

/**
 * Update mutation status
 */
export async function updateMutationStatus(
  id: string,
  status: QueuedMutation['status'],
  error?: string
): Promise<void> {
  const mutation = await get(id)
  if (mutation) {
    mutation.status = status
    if (error) {
      mutation.error = error
    }
    if (status === 'failed') {
      mutation.retryCount++
    }
    await set(id, mutation)
  }
}

/**
 * Remove mutation from queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  await del(id)
}

/**
 * Clear all completed mutations
 */
export async function clearCompletedMutations(): Promise<void> {
  const all = await getAllQueuedMutations()
  const completed = all.filter(m => m.status === 'success')

  for (const mutation of completed) {
    await removeFromQueue(mutation.id)
  }
}

/**
 * Clear all mutations (use with caution!)
 */
export async function clearAllMutations(): Promise<void> {
  const allKeys = await keys()
  const queueKeys = allKeys.filter(key =>
    typeof key === 'string' && key.startsWith(QUEUE_PREFIX)
  )

  for (const key of queueKeys) {
    await del(key)
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const all = await getAllQueuedMutations()

  return {
    total: all.length,
    pending: all.filter(m => m.status === 'pending').length,
    syncing: all.filter(m => m.status === 'syncing').length,
    failed: all.filter(m => m.status === 'failed').length,
    success: all.filter(m => m.status === 'success').length,
  }
}

/**
 * Detect potential conflicts
 *
 * A conflict occurs when:
 * 1. Local mutation tries to update a resource
 * 2. That resource was modified on the server since the local mutation was created
 */
export function detectConflict(
  localMutation: QueuedMutation,
  serverData: any
): boolean {
  // If server data was updated after local mutation was created
  if (serverData.updated_at) {
    const serverTimestamp = new Date(serverData.updated_at).getTime()
    return serverTimestamp > localMutation.timestamp
  }

  // For new resources, no conflict possible
  if (localMutation.type.includes('_create')) {
    return false
  }

  return false
}
