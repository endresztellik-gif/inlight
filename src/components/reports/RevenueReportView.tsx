import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRevenueReport } from '@/hooks/api/useReports'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface RevenueReportViewProps {
  startDate?: string
  endDate?: string
}

export function RevenueReportView({ startDate, endDate }: RevenueReportViewProps) {
  const { t } = useTranslation()
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

  const { data, isLoading } = useRevenueReport({
    startDate,
    endDate,
    groupBy,
    currency: currencyFilter,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const revenues = data?.revenues || []
  const summary = data?.summary || {
    totalRevenue: 0,
    totalRentals: 0,
    avgRevenuePerPeriod: 0,
  }

  // Transform data for chart
  const chartData = revenues.map((rev) => ({
    period: rev.period,
    [rev.currency]: rev.total,
    rentals: rev.rental_count,
  }))

  // Group by currency for multi-currency display
  const groupedByCurrency = revenues.reduce((acc, rev) => {
    if (!acc[rev.currency]) {
      acc[rev.currency] = []
    }
    acc[rev.currency].push(rev)
    return acc
  }, {} as Record<string, typeof revenues>)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.revenue.totalRevenue')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1">
                €{summary.totalRevenue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.revenue.totalRentals')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-green-500">
                {summary.totalRentals}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('reports.revenue.avgPerPeriod')}
                </p>
                <p className="text-xl font-bold font-mono mt-1 text-blue-500">
                  €{summary.avgRevenuePerPeriod.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card cinematic>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Group By */}
            <div>
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                {t('reports.revenue.groupBy')}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={groupBy === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('day')}
                >
                  {t('reports.revenue.daily')}
                </Button>
                <Button
                  variant={groupBy === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('week')}
                >
                  {t('reports.revenue.weekly')}
                </Button>
                <Button
                  variant={groupBy === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('month')}
                >
                  {t('reports.revenue.monthly')}
                </Button>
              </div>
            </div>

            {/* Currency Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                {t('reports.revenue.currency')}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={currencyFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrencyFilter('all')}
                >
                  {t('reports.filters.all')}
                </Button>
                <Button
                  variant={currencyFilter === 'EUR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrencyFilter('EUR')}
                >
                  EUR
                </Button>
                <Button
                  variant={currencyFilter === 'HUF' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrencyFilter('HUF')}
                >
                  HUF
                </Button>
                <Button
                  variant={currencyFilter === 'USD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrencyFilter('USD')}
                >
                  USD
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <Card cinematic>
          <CardHeader>
            <CardTitle className="text-xl">{t('reports.revenue.revenueChart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="period" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {currencyFilter === 'all' ? (
                  <>
                    <Bar dataKey="EUR" fill="#10b981" name="EUR" />
                    <Bar dataKey="HUF" fill="#3b82f6" name="HUF" />
                    <Bar dataKey="USD" fill="#f59e0b" name="USD" />
                  </>
                ) : (
                  <Bar dataKey={currencyFilter} fill="#10b981" name={currencyFilter} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Currency Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(groupedByCurrency).map(([currency, revs]) => {
          const total = revs.reduce((sum, r) => sum + r.total, 0)
          const count = revs.reduce((sum, r) => sum + r.rental_count, 0)

          return (
            <Card key={currency} cinematic>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{currency}</span>
                  <span className="text-2xl font-mono font-bold text-green-500">
                    {total.toFixed(2)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('reports.revenue.rentals')}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('reports.revenue.avgPerRental')}</span>
                    <span className="font-mono">
                      {count > 0 ? (total / count).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Table */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-xl">{t('reports.revenue.detailedBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          {revenues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('reports.revenue.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.revenue.period')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.revenue.currency')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.revenue.rentals')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.revenue.total')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.revenue.avgPerRental')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenues.map((revenue, index) => (
                    <tr
                      key={`${revenue.period}-${revenue.currency}`}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm">{revenue.period}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{revenue.currency}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono">{revenue.rental_count}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-semibold text-green-500">
                          {revenue.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-sm">
                          {revenue.rental_count > 0
                            ? (revenue.total / revenue.rental_count).toFixed(2)
                            : '0.00'}
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
