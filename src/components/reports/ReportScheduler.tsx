import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Clock,
  Mail,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReportFilters } from './AdvancedFilters'

type ReportType = 'rentals' | 'clients' | 'products' | 'revenue' | 'profit' | 'comparison'
type RecurrenceType = 'daily' | 'weekly' | 'monthly'

export interface ScheduledReport {
  id: string
  name: string
  reportType: ReportType
  recurrence: RecurrenceType
  recipients: string[]
  filters: ReportFilters
  isActive: boolean
  nextRun: string
  createdAt: string
}

interface ReportSchedulerProps {
  currentReportType: ReportType
  currentFilters: ReportFilters
}

export function ReportScheduler({ currentReportType, currentFilters }: ReportSchedulerProps) {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState<ScheduledReport[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null)

  // Form state
  const [scheduleName, setScheduleName] = useState('')
  const [reportType, setReportType] = useState<ReportType>(currentReportType)
  const [recurrence, setRecurrence] = useState<RecurrenceType>('weekly')
  const [recipientInput, setRecipientInput] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [filters, setFilters] = useState<ReportFilters>(currentFilters)

  // Load schedules from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reportSchedules')
    if (saved) {
      try {
        setSchedules(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load report schedules:', err)
      }
    }
  }, [])

  // Save schedules to localStorage
  const saveSchedules = (updated: ScheduledReport[]) => {
    setSchedules(updated)
    localStorage.setItem('reportSchedules', JSON.stringify(updated))
  }

  // Calculate next run date based on recurrence
  const calculateNextRun = (recurrenceType: RecurrenceType): string => {
    const now = new Date()
    switch (recurrenceType) {
      case 'daily':
        now.setDate(now.getDate() + 1)
        break
      case 'weekly':
        now.setDate(now.getDate() + 7)
        break
      case 'monthly':
        now.setMonth(now.getMonth() + 1)
        break
    }
    now.setHours(9, 0, 0, 0) // Set to 9:00 AM
    return now.toISOString()
  }

  // Create or update schedule
  const handleSaveSchedule = () => {
    if (!scheduleName.trim()) {
      alert(t('reports.schedule.enterScheduleName'))
      return
    }

    if (recipients.length === 0) {
      alert(t('reports.schedule.enterRecipients'))
      return
    }

    if (editingSchedule) {
      // Update existing schedule
      const updated = schedules.map(s =>
        s.id === editingSchedule.id
          ? {
              ...s,
              name: scheduleName.trim(),
              reportType,
              recurrence,
              recipients,
              filters,
              nextRun: calculateNextRun(recurrence),
            }
          : s
      )
      saveSchedules(updated)
      setEditingSchedule(null)
    } else {
      // Create new schedule
      const newSchedule: ScheduledReport = {
        id: Date.now().toString(),
        name: scheduleName.trim(),
        reportType,
        recurrence,
        recipients,
        filters,
        isActive: true,
        nextRun: calculateNextRun(recurrence),
        createdAt: new Date().toISOString(),
      }
      saveSchedules([...schedules, newSchedule])
    }

    // Reset form
    setScheduleName('')
    setReportType(currentReportType)
    setRecurrence('weekly')
    setRecipients([])
    setRecipientInput('')
    setFilters(currentFilters)
    setShowCreateDialog(false)
  }

  // Add recipient
  const handleAddRecipient = () => {
    const email = recipientInput.trim().toLowerCase()
    if (!email) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert(t('reports.schedule.invalidEmail'))
      return
    }

    if (recipients.includes(email)) {
      alert(t('reports.schedule.duplicateEmail'))
      return
    }

    setRecipients([...recipients, email])
    setRecipientInput('')
  }

  // Remove recipient
  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email))
  }

  // Toggle schedule active status
  const handleToggleActive = (id: string) => {
    const updated = schedules.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    )
    saveSchedules(updated)
  }

  // Delete schedule
  const handleDeleteSchedule = (id: string) => {
    if (!confirm(t('reports.schedule.confirmDelete'))) return
    saveSchedules(schedules.filter(s => s.id !== id))
  }

  // Start editing schedule
  const handleEditSchedule = (schedule: ScheduledReport) => {
    setEditingSchedule(schedule)
    setScheduleName(schedule.name)
    setReportType(schedule.reportType)
    setRecurrence(schedule.recurrence)
    setRecipients(schedule.recipients)
    setFilters(schedule.filters)
    setShowCreateDialog(true)
  }

  // Cancel edit/create
  const handleCancelDialog = () => {
    setShowCreateDialog(false)
    setEditingSchedule(null)
    setScheduleName('')
    setReportType(currentReportType)
    setRecurrence('weekly')
    setRecipients([])
    setRecipientInput('')
    setFilters(currentFilters)
  }

  // Use current filters from parent
  const handleUseCurrentFilters = () => {
    setFilters(currentFilters)
  }

  // Report type options
  const reportTypeOptions = [
    { value: 'rentals' as ReportType, label: t('reports.types.rentals') },
    { value: 'clients' as ReportType, label: t('reports.types.clients') },
    { value: 'products' as ReportType, label: t('reports.types.products') },
    { value: 'revenue' as ReportType, label: t('reports.types.revenue') },
    { value: 'profit' as ReportType, label: t('reports.types.profit') },
    { value: 'comparison' as ReportType, label: t('reports.types.comparison') },
  ]

  // Recurrence options
  const recurrenceOptions = [
    { value: 'daily' as RecurrenceType, label: t('reports.schedule.daily') },
    { value: 'weekly' as RecurrenceType, label: t('reports.schedule.weekly') },
    { value: 'monthly' as RecurrenceType, label: t('reports.schedule.monthly') },
  ]

  return (
    <Card cinematic>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t('reports.schedule.title')}</CardTitle>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('reports.schedule.newSchedule')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create/Edit Dialog */}
        {showCreateDialog && (
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in duration-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingSchedule
                  ? t('reports.schedule.editSchedule')
                  : t('reports.schedule.createSchedule')}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancelDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Schedule Name */}
            <div>
              <Label htmlFor="scheduleName" className="text-sm font-medium">
                {t('reports.schedule.scheduleName')} *
              </Label>
              <Input
                id="scheduleName"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder={t('reports.schedule.scheduleNamePlaceholder')}
                className="mt-2"
              />
            </div>

            {/* Report Type */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t('reports.schedule.reportType')} *
              </Label>
              <div className="flex flex-wrap gap-2">
                {reportTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={reportType === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportType(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t('reports.schedule.recurrence')} *
              </Label>
              <div className="flex gap-2">
                {recurrenceOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={recurrence === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecurrence(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div>
              <Label htmlFor="recipientInput" className="text-sm font-medium">
                {t('reports.schedule.recipients')} *
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="recipientInput"
                  type="email"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddRecipient()
                    }
                  }}
                  placeholder="email@example.com"
                />
                <Button onClick={handleAddRecipient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Recipients List */}
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {recipients.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border"
                    >
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-mono">{email}</span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">
                  {t('reports.schedule.filters')}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseCurrentFilters}
                  className="gap-2"
                >
                  {t('reports.schedule.useCurrentFilters')}
                </Button>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono space-y-1">
                {filters.startDate && (
                  <div>Start: {filters.startDate}</div>
                )}
                {filters.endDate && (
                  <div>End: {filters.endDate}</div>
                )}
                {filters.status && filters.status.length > 0 && (
                  <div>Status: {filters.status.join(', ')}</div>
                )}
                {filters.rentalType && filters.rentalType !== 'all' && (
                  <div>Type: {filters.rentalType}</div>
                )}
                {!filters.startDate && !filters.endDate && !filters.status?.length && (
                  <div className="text-muted-foreground">
                    {t('reports.schedule.noFilters')}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button onClick={handleCancelDialog} variant="outline">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveSchedule}>
                {editingSchedule ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </div>
        )}

        {/* Scheduled Reports List */}
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('reports.schedule.noSchedules')}</p>
            <p className="text-xs mt-1">{t('reports.schedule.createFirst')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-4 rounded-lg border transition-all ${
                  schedule.isActive
                    ? 'bg-background border-border'
                    : 'bg-muted/50 border-muted opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{schedule.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          schedule.isActive
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {schedule.isActive
                          ? t('reports.schedule.active')
                          : t('reports.schedule.paused')}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">{t('reports.schedule.report')}:</span>{' '}
                        {reportTypeOptions.find(r => r.value === schedule.reportType)?.label}
                      </div>
                      <div>
                        <span className="font-medium">{t('reports.schedule.frequency')}:</span>{' '}
                        {recurrenceOptions.find(r => r.value === schedule.recurrence)?.label}
                      </div>
                      <div>
                        <span className="font-medium">{t('reports.schedule.nextRun')}:</span>{' '}
                        {new Date(schedule.nextRun).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">{t('reports.schedule.recipients')}:</span>{' '}
                        {schedule.recipients.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(schedule.id)}
                      title={
                        schedule.isActive
                          ? t('reports.schedule.pause')
                          : t('reports.schedule.resume')
                      }
                    >
                      {schedule.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSchedule(schedule)}
                      title={t('common.edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-blue-500">
              {t('reports.schedule.note')}:
            </span>{' '}
            {t('reports.schedule.noteText')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
