import { useOffline } from '@/contexts/OfflineContext'
import { useTranslation } from 'react-i18next'
import { WifiOff, Wifi, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function OfflineIndicator() {
  const { t } = useTranslation()
  const { isOnline, isSyncing, queuedMutationsCount, syncNow, queueStats } = useOffline()

  // Don't show anything if online and no pending mutations
  if (isOnline && queuedMutationsCount === 0 && !isSyncing) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        !isOnline ? 'bg-destructive text-destructive-foreground' : 'bg-amber-500 text-white'
      )}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          {!isOnline ? (
            <WifiOff className="h-5 w-5" />
          ) : isSyncing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : queuedMutationsCount > 0 ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <Wifi className="h-5 w-5" />
          )}

          {/* Status Message */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {!isOnline && t('offline.indicator.offline')}
              {isOnline && isSyncing && t('offline.indicator.syncing')}
              {isOnline && !isSyncing && queuedMutationsCount > 0 && (
                <>
                  {t('offline.indicator.pendingChanges', { count: queuedMutationsCount })}
                </>
              )}
            </span>
            <span className="text-xs opacity-90">
              {!isOnline && t('offline.indicator.offlineDescription')}
              {isOnline && isSyncing && t('offline.indicator.syncingDescription')}
              {isOnline && !isSyncing && queuedMutationsCount > 0 && (
                <>
                  {t('offline.indicator.clickToSync')}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Stats Badge */}
          {queueStats.failed > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-600/20 text-xs font-mono">
              <AlertCircle className="h-3 w-3" />
              {queueStats.failed} {t('offline.indicator.failed')}
            </div>
          )}

          {/* Sync Button */}
          {isOnline && queuedMutationsCount > 0 && !isSyncing && (
            <Button
              size="sm"
              variant="secondary"
              onClick={syncNow}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('offline.indicator.syncNow')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
