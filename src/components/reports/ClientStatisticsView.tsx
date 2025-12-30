import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClientStatistics } from '@/hooks/api/useReports'

interface ClientStatisticsViewProps {
  startDate?: string
  endDate?: string
}

export function ClientStatisticsView({ startDate, endDate }: ClientStatisticsViewProps) {
  const { t } = useTranslation()

  const { data, isLoading } = useClientStatistics({
    startDate,
    endDate,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const clients = data?.clients || []
  const summary = data?.summary || {
    totalClients: 0,
    totalRevenue: 0,
    avgRevenuePerClient: 0,
    topClient: null,
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.client.totalClients')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1">
                {summary.totalClients}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.client.totalRevenue')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-green-500">
                €{summary.totalRevenue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.client.avgPerClient')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-blue-500">
                €{summary.avgRevenuePerClient.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('reports.client.topClient')}
                </p>
                <p className="text-sm font-semibold mt-1 text-amber-500 truncate">
                  {summary.topClient?.client_name || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Clients */}
      {clients.slice(0, 10).length > 0 && (
        <Card cinematic>
          <CardHeader>
            <CardTitle className="text-xl">{t('reports.client.top10')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.slice(0, 10).map((client, index) => (
                <div
                  key={client.client_id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0
                        ? 'bg-amber-500 text-white'
                        : index === 1
                        ? 'bg-gray-400 text-white'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{client.client_name}</p>
                    {client.company && (
                      <p className="text-xs text-muted-foreground">{client.company}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-green-500">
                      €{client.total_revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.total_rentals} {t('reports.client.rentals')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Clients Table */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-xl">{t('reports.client.allClients')}</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('reports.client.noClients')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.client.clientName')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.client.company')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.client.totalRentals')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.client.totalRevenue')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.client.avgValue')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.client.lastRental')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr
                      key={client.client_id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-semibold">{client.client_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {client.company || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono">{client.total_rentals}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-semibold text-green-500">
                          €{client.total_revenue.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-sm">
                          €{client.avg_rental_value.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-mono">
                          {client.last_rental_date
                            ? new Date(client.last_rental_date).toLocaleDateString()
                            : '-'}
                        </span>
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
