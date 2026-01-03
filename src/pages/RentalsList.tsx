import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRentals, useRentalStats } from '@/hooks/api/useRentals'

const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    color: 'text-primary bg-primary/20 border-primary/30'
  },
  pending_return: {
    label: 'Pending Return',
    icon: AlertCircle,
    color: 'text-amber-400 bg-amber-400/20 border-amber-400/30'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-500 bg-green-500/20 border-green-500/30'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-500 bg-red-500/20 border-red-500/30'
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    color: 'text-muted-foreground bg-muted/20 border-muted/30'
  }
}

export function RentalsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { t } = useTranslation()

  // Fetch rentals and stats (ONLY type = 'rental', exclude subrentals)
  const { data: rentals, isLoading } = useRentals(statusFilter, 'rental')
  const { data: stats } = useRentalStats()

  // Calculate days left
  const calculateDaysLeft = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Filter rentals by search query
  const filteredRentals = (rentals || []).filter(rental => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      rental.rental_number.toLowerCase().includes(query) ||
      rental.clients.name.toLowerCase().includes(query) ||
      rental.project_name.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('rentals.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('rentals.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            {t('rentals.export')}
          </Button>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/rentals/new">
              <Plus className="h-5 w-5" />
              {t('rentals.newRental')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card cinematic>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('rentals.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                {t('rentals.filters.all')}
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                {t('rentals.filters.active')}
              </Button>
              <Button
                variant={statusFilter === 'pending_return' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending_return')}
                size="sm"
              >
                {t('rentals.filters.pending')}
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
              >
                {t('rentals.filters.completed')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('rentals.stats.active')}</p>
                <p className="text-2xl font-bold font-mono mt-1">{stats?.active || 0}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('rentals.stats.pending')}</p>
                <p className="text-2xl font-bold font-mono mt-1">{stats?.pending || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('rentals.stats.completed')}</p>
                <p className="text-2xl font-bold font-mono mt-1">{stats?.completed || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('rentals.stats.totalValue')}</p>
                <p className="text-2xl font-bold font-mono mt-1">€{stats?.totalValue.toFixed(0) || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rentals Table */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            {filteredRentals.length} {filteredRentals.length !== 1 ? t('rentals.rentalPlural') : t('rentals.rental')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-medium">{t('rentals.table.rentalNumber')}</th>
                      <th className="p-4 font-medium">{t('rentals.table.client')}</th>
                      <th className="p-4 font-medium">{t('rentals.table.project')}</th>
                      <th className="p-4 font-medium">{t('rentals.table.period')}</th>
                      <th className="p-4 font-medium">{t('rentals.table.total')}</th>
                      <th className="p-4 font-medium">{t('rentals.table.status')}</th>
                      <th className="p-4 font-medium">{t('rentals.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRentals.map((rental, index) => {
                      const status = rental.status || 'draft'
                      const StatusIcon = statusConfig[status as keyof typeof statusConfig].icon
                      const daysLeft = calculateDaysLeft(rental.end_date)

                      return (
                        <tr
                          key={rental.id}
                          className="hover:bg-secondary/50 transition-colors animate-in slide-in-from-bottom duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4">
                            <span className="font-mono text-sm text-primary font-semibold">
                              {rental.rental_number}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{rental.clients.name}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {rental.project_name}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-xs">
                                {new Date(rental.start_date).toLocaleDateString('en-GB')} → {new Date(rental.end_date).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                            {status === 'active' && daysLeft > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {daysLeft} {t('rentals.table.daysLeft')}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-mono font-semibold text-primary">
                              {rental.final_currency || '€'}{rental.final_total?.toFixed(0) || 0}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                              statusConfig[status as keyof typeof statusConfig].color
                            }`}>
                              <StatusIcon className="h-3 w-3" />
                              {t(`rentals.status.${status}`)}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                              <Link to={`/rentals/${rental.id}`}>
                                <Eye className="h-4 w-4" />
                                {t('rentals.table.view')}
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRentals.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground">{t('rentals.noResults.title')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('rentals.noResults.subtitle')}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
