import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type { QueuedMutation } from '@/lib/offlineQueue'

interface ConflictResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflict: QueuedMutation | null
  onResolve: (resolution: 'keep_local' | 'keep_remote' | 'merge') => void
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  conflict,
  onResolve,
}: ConflictResolutionDialogProps) {
  const { t } = useTranslation()
  const [selectedResolution, setSelectedResolution] = useState<'keep_local' | 'keep_remote' | 'merge'>('keep_local')

  if (!conflict) return null

  const handleResolve = () => {
    onResolve(selectedResolution)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t('offline.conflict.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('offline.conflict.description')}
            </AlertDescription>
          </Alert>

          {/* Mutation Details */}
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <p className="text-sm font-semibold mb-2">{t('offline.conflict.mutationDetails')}</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">{t('offline.conflict.type')}:</span>{' '}
                <span className="font-mono">{conflict.type}</span>
              </p>
              <p>
                <span className="text-muted-foreground">{t('offline.conflict.timestamp')}:</span>{' '}
                <span className="font-mono">{new Date(conflict.timestamp).toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t('offline.conflict.chooseResolution')}</p>

            {/* Keep Local */}
            <button
              onClick={() => setSelectedResolution('keep_local')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedResolution === 'keep_local'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <CheckCircle
                  className={`h-5 w-5 mt-0.5 ${
                    selectedResolution === 'keep_local' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <div>
                  <p className="font-semibold">{t('offline.conflict.keepLocal')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('offline.conflict.keepLocalDescription')}
                  </p>
                </div>
              </div>
            </button>

            {/* Keep Remote */}
            <button
              onClick={() => setSelectedResolution('keep_remote')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedResolution === 'keep_remote'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <XCircle
                  className={`h-5 w-5 mt-0.5 ${
                    selectedResolution === 'keep_remote' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <div>
                  <p className="font-semibold">{t('offline.conflict.keepRemote')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('offline.conflict.keepRemoteDescription')}
                  </p>
                </div>
              </div>
            </button>

            {/* Merge (Advanced) */}
            <button
              onClick={() => setSelectedResolution('merge')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedResolution === 'merge'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 ${
                    selectedResolution === 'merge' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <div>
                  <p className="font-semibold">{t('offline.conflict.merge')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('offline.conflict.mergeDescription')}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleResolve}>
            {t('offline.conflict.resolve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
