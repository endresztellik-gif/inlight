import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRentalReport } from '@/hooks/api/useReports'
import { Link } from 'react-router-dom'
import type { ReportFilters } from './AdvancedFilters'

interface RentalReportViewProps {
  filters: ReportFilters
}

export function RentalReportView({ filters }: RentalReportViewProps) {
  const { t } = useTranslation()

  const { data, isLoading } = useRentalReport({
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status && filters.status.length > 0 ? filters.status.join(',') : 'all',
  })

  // Client-side filtering based on advanced filters
  const filteredRentals = useMemo(() => {
    if (!data?.rentals) return []

    let result = [...data.rentals]

    // Filter by rental type
    if (filters.rentalType && filters.rentalType !== 'all') {
      result = result.filter(rental => rental.type === filters.rentalType)
    }

    // Filter by client search
    if (filters.clientSearch) {
      const search = filters.clientSearch.toLowerCase()
      result = result.filter(rental =>
        rental.client_name?.toLowerCase().includes(search)
      )
    }

    // Filter by product search (search in rental items - would need to join data)
    // This would require backend support or additional data fetching
    // For now, we'll skip this as it requires rental_items data

    // Filter by amount range
    if (filters.minAmount !== undefined) {
      result = result.filter(rental => rental.final_total >= filters.minAmount!)
    }

    if (filters.maxAmount !== undefined) {
      result = result.filter(rental => rental.final_total <= filters.maxAmount!)
    }

    return result
  }, [data?.rentals, filters])

  // Recalculate summary based on filtered rentals
  const summary = useMemo(() => {
    const activeCount = filteredRentals.filter(r => r.status === 'active').length
    const completedCount = filteredRentals.filter(r => r.status === 'completed').length
    const totalRevenue = filteredRentals.reduce((sum, r) => sum + r.final_total, 0)

    return {
      totalCount: filteredRentals.length,
      activeCount,
      completedCount,
      totalRevenue,
      avgDailyRate: data?.summary?.avgDailyRate || 0,
    }
  }, [filteredRentals, data?.summary])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.rental.totalRentals')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1">
                {summary.totalCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.rental.active')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-green-500">
                {summary.activeCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.rental.completed')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-blue-500">
                {summary.completedCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.rental.totalRevenue')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-amber-500">
                €{summary.totalRevenue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rentals Table */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-xl">{t('reports.rental.rentalsList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRentals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('reports.rental.noRentals')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.rental.rentalNumber')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.rental.client')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.rental.project')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.rental.period')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.rental.type')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.rental.status')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.rental.total')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRentals.map((rental, index) => (
                    <tr
                      key={rental.id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-semibold">
                          {rental.rental_number}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{rental.client_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{rental.project_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-mono">
                          {new Date(rental.start_date).toLocaleDateString()} -{' '}
                          {new Date(rental.end_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            rental.type === 'rental'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-purple-500/10 text-purple-500'
                          }`}
                        >
                          {rental.type === 'rental' ? t('rentals.rental') : t('subrentals.rental')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            rental.status === 'active'
                              ? 'bg-green-500/10 text-green-500'
                              : rental.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {t(`rentals.status.${rental.status}`)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-semibold">
                          {rental.final_currency} {rental.final_total.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to={
                              rental.type === 'rental'
                                ? `/rentals/${rental.id}`
                                : `/subrentals/${rental.id}`
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
