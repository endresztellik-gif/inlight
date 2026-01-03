import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Filter,
  Save,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ReportFilters {
  startDate?: string
  endDate?: string
  status?: string[]
  clientSearch?: string
  productSearch?: string
  minAmount?: number
  maxAmount?: number
  rentalType?: 'rental' | 'subrental' | 'all'
}

interface SavedFilter {
  id: string
  name: string
  filters: ReportFilters
  createdAt: string
}

interface AdvancedFiltersProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
  showTypeFilter?: boolean
}

export function AdvancedFilters({ filters, onFiltersChange, showTypeFilter = true }: AdvancedFiltersProps) {
  const { t } = useTranslation()
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [filterName, setFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reportFilters')
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load saved filters:', err)
      }
    }
  }, [])

  // Save filters to localStorage
  const saveCurrentFilters = () => {
    if (!filterName.trim()) {
      alert(t('reports.filters.enterFilterName'))
      return
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    }

    const updated = [...savedFilters, newFilter]
    setSavedFilters(updated)
    localStorage.setItem('reportFilters', JSON.stringify(updated))

    setFilterName('')
    setShowSaveDialog(false)
  }

  // Load saved filter
  const loadFilter = (filter: SavedFilter) => {
    onFiltersChange(filter.filters)
  }

  // Delete saved filter
  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id)
    setSavedFilters(updated)
    localStorage.setItem('reportFilters', JSON.stringify(updated))
  }

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      status: [],
      clientSearch: '',
      productSearch: '',
      minAmount: undefined,
      maxAmount: undefined,
      rentalType: 'all',
    })
  }

  // Status options
  const statusOptions = [
    { value: 'draft', label: t('rentals.status.draft') },
    { value: 'active', label: t('rentals.status.active') },
    { value: 'pending_return', label: t('rentals.status.pending_return') },
    { value: 'completed', label: t('rentals.status.completed') },
    { value: 'cancelled', label: t('rentals.status.cancelled') },
  ]

  // Toggle status in filter
  const toggleStatus = (status: string) => {
    const current = filters.status || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]

    onFiltersChange({ ...filters, status: updated })
  }

  return (
    <Card cinematic>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t('reports.filters.advanced')}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {t('reports.filters.save')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('reports.filters.clear')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Save Filter Dialog */}
        {showSaveDialog && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in duration-200">
            <Label htmlFor="filterName" className="text-sm font-medium">
              {t('reports.filters.filterName')}
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="filterName"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder={t('reports.filters.filterNamePlaceholder')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveCurrentFilters()
                }}
              />
              <Button onClick={saveCurrentFilters} size="sm">
                {t('common.save')}
              </Button>
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="outline"
                size="sm"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t('reports.filters.savedFilters')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <button
                    onClick={() => loadFilter(filter)}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {filter.name}
                  </button>
                  <button
                    onClick={() => deleteFilter(filter.id)}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">
                {t('reports.filters.startDate')}
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">
                {t('reports.filters.endDate')}
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="minAmount" className="text-sm font-medium">
                {t('reports.filters.minAmount')}
              </Label>
              <Input
                id="minAmount"
                type="number"
                min="0"
                step="0.01"
                value={filters.minAmount || ''}
                onChange={(e) => onFiltersChange({ ...filters, minAmount: parseFloat(e.target.value) || undefined })}
                placeholder="€0.00"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="maxAmount" className="text-sm font-medium">
                {t('reports.filters.maxAmount')}
              </Label>
              <Input
                id="maxAmount"
                type="number"
                min="0"
                step="0.01"
                value={filters.maxAmount || ''}
                onChange={(e) => onFiltersChange({ ...filters, maxAmount: parseFloat(e.target.value) || undefined })}
                placeholder="€999999.99"
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            {t('reports.filters.status')}
          </Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = (filters.status || []).includes(option.value)
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleStatus(option.value)}
                  className="gap-2"
                >
                  {option.label}
                  {isSelected && <X className="h-3 w-3" />}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Rental Type Filter */}
        {showTypeFilter && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              {t('reports.filters.rentalType')}
            </Label>
            <div className="flex gap-2">
              <Button
                variant={filters.rentalType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFiltersChange({ ...filters, rentalType: 'all' })}
              >
                {t('reports.filters.all')}
              </Button>
              <Button
                variant={filters.rentalType === 'rental' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFiltersChange({ ...filters, rentalType: 'rental' })}
              >
                {t('reports.filters.rentalsOnly')}
              </Button>
              <Button
                variant={filters.rentalType === 'subrental' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFiltersChange({ ...filters, rentalType: 'subrental' })}
              >
                {t('reports.filters.subrentalsOnly')}
              </Button>
            </div>
          </div>
        )}

        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientSearch" className="text-sm font-medium">
              {t('reports.filters.searchClient')}
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="clientSearch"
                type="text"
                value={filters.clientSearch || ''}
                onChange={(e) => onFiltersChange({ ...filters, clientSearch: e.target.value })}
                placeholder={t('reports.filters.clientPlaceholder')}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="productSearch" className="text-sm font-medium">
              {t('reports.filters.searchProduct')}
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="productSearch"
                type="text"
                value={filters.productSearch || ''}
                onChange={(e) => onFiltersChange({ ...filters, productSearch: e.target.value })}
                placeholder={t('reports.filters.productPlaceholder')}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filters.status?.length || filters.clientSearch || filters.productSearch || filters.minAmount || filters.maxAmount) && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {t('reports.filters.activeFilters')}:
            </p>
            <div className="flex flex-wrap gap-2">
              {filters.status?.map((status) => (
                <div
                  key={status}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                >
                  {statusOptions.find(o => o.value === status)?.label}
                </div>
              ))}
              {filters.clientSearch && (
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  Client: {filters.clientSearch}
                </div>
              )}
              {filters.productSearch && (
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  Product: {filters.productSearch}
                </div>
              )}
              {filters.minAmount && (
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  Min: €{filters.minAmount}
                </div>
              )}
              {filters.maxAmount && (
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  Max: €{filters.maxAmount}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
