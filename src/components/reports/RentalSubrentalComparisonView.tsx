import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, Package, DollarSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface ComparisonViewProps {
  startDate?: string
  endDate?: string
}

interface ComparisonData {
  period: string
  rentalRevenue: number
  subrentalRevenue: number
  rentalCount: number
  subrentalCount: number
  subrentalProfit: number
}

interface SummaryStats {
  rental: {
    totalRevenue: number
    count: number
    avgValue: number
  }
  subrental: {
    totalRevenue: number
    totalCost: number
    profit: number
    margin: number
    count: number
    avgValue: number
  }
}

export function RentalSubrentalComparisonView({ startDate, endDate }: ComparisonViewProps) {
  const { t } = useTranslation()
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month')

  const { data, isLoading } = useQuery({
    queryKey: ['rentalSubrentalComparison', startDate, endDate, groupBy],
    queryFn: async () => {
      // Fetch all rentals and subrentals with items
      let query = supabase
        .from('rentals')
        .select(`
          id,
          type,
          created_at,
          final_total,
          final_currency,
          status,
          rental_items (
            purchase_price,
            quantity
          )
        `)
        .order('created_at', { ascending: true })

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by period
      const comparisonMap = new Map<string, ComparisonData>()
      const summary: SummaryStats = {
        rental: { totalRevenue: 0, count: 0, avgValue: 0 },
        subrental: { totalRevenue: 0, totalCost: 0, profit: 0, margin: 0, count: 0, avgValue: 0 },
      }

      ;(data || []).forEach((rental: any) => {
        const date = new Date(rental.created_at)
        let period: string

        if (groupBy === 'day') {
          period = date.toISOString().split('T')[0]
        } else if (groupBy === 'week') {
          const week = Math.ceil((date.getDate() - date.getDay() + 1) / 7)
          period = `${date.getFullYear()}-W${week}`
        } else {
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }

        if (!comparisonMap.has(period)) {
          comparisonMap.set(period, {
            period,
            rentalRevenue: 0,
            subrentalRevenue: 0,
            rentalCount: 0,
            subrentalCount: 0,
            subrentalProfit: 0,
          })
        }

        const periodData = comparisonMap.get(period)!
        const revenue = rental.final_total || 0

        if (rental.type === 'rental') {
          periodData.rentalRevenue += revenue
          periodData.rentalCount += 1
          summary.rental.totalRevenue += revenue
          summary.rental.count += 1
        } else if (rental.type === 'subrental') {
          // Calculate purchase cost for subrental
          const purchaseCost = (rental.rental_items || []).reduce(
            (sum: number, item: any) => sum + (item.purchase_price || 0) * item.quantity,
            0
          )
          const profit = revenue - purchaseCost

          periodData.subrentalRevenue += revenue
          periodData.subrentalCount += 1
          periodData.subrentalProfit += profit

          summary.subrental.totalRevenue += revenue
          summary.subrental.totalCost += purchaseCost
          summary.subrental.profit += profit
          summary.subrental.count += 1
        }
      })

      // Calculate averages and margin
      summary.rental.avgValue = summary.rental.count > 0
        ? summary.rental.totalRevenue / summary.rental.count
        : 0
      summary.subrental.avgValue = summary.subrental.count > 0
        ? summary.subrental.totalRevenue / summary.subrental.count
        : 0
      summary.subrental.margin = summary.subrental.totalCost > 0
        ? (summary.subrental.profit / summary.subrental.totalCost) * 100
        : 0

      return {
        comparison: Array.from(comparisonMap.values()),
        summary,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const comparison = data?.comparison || []
  const summary = data?.summary || {
    rental: { totalRevenue: 0, count: 0, avgValue: 0 },
    subrental: { totalRevenue: 0, totalCost: 0, profit: 0, margin: 0, count: 0, avgValue: 0 },
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        <Button
          variant={groupBy === 'day' ? 'default' : 'outline'}
          onClick={() => setGroupBy('day')}
          size="sm"
        >
          {t('reports.comparison.daily')}
        </Button>
        <Button
          variant={groupBy === 'week' ? 'default' : 'outline'}
          onClick={() => setGroupBy('week')}
          size="sm"
        >
          {t('reports.comparison.weekly')}
        </Button>
        <Button
          variant={groupBy === 'month' ? 'default' : 'outline'}
          onClick={() => setGroupBy('month')}
          size="sm"
        >
          {t('reports.comparison.monthly')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Rental Stats */}
        <Card cinematic className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Package className="h-3 w-3" />
                {t('reports.comparison.rentalRevenue')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-blue-500">
                €{summary.rental.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.rental.count} {t('reports.comparison.rentals')} • Avg: €
                {summary.rental.avgValue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subrental Stats */}
        <Card cinematic className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Package className="h-3 w-3" />
                {t('reports.comparison.subrentalRevenue')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-orange-500">
                €{summary.subrental.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.subrental.count} {t('reports.comparison.subrentals')} • Avg: €
                {summary.subrental.avgValue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subrental Profit */}
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {t('reports.comparison.subrentalProfit')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-green-500">
                €{summary.subrental.profit.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('reports.comparison.margin')}: {summary.subrental.margin.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Winner Card */}
        <Card
          cinematic
          className={`border-l-4 ${
            summary.rental.totalRevenue > summary.subrental.totalRevenue
              ? 'border-l-blue-500'
              : 'border-l-orange-500'
          }`}
        >
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {t('reports.comparison.topPerformer')}
              </p>
              <p className="text-2xl font-bold mt-1">
                {summary.rental.totalRevenue > summary.subrental.totalRevenue
                  ? t('reports.comparison.rental')
                  : t('reports.comparison.subrental')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                +€
                {Math.abs(summary.rental.totalRevenue - summary.subrental.totalRevenue).toFixed(2)}{' '}
                {t('reports.comparison.more')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Comparison Chart */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('reports.comparison.revenueComparison')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparison}>
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
              <Bar dataKey="rentalRevenue" fill="#3b82f6" name={t('reports.comparison.rental')} />
              <Bar
                dataKey="subrentalRevenue"
                fill="#f97316"
                name={t('reports.comparison.subrental')}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Trend Chart (Subrental only) */}
      {summary.subrental.count > 0 && (
        <Card cinematic>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t('reports.comparison.subrentalProfitTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparison}>
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
                <Line
                  type="monotone"
                  dataKey="subrentalProfit"
                  stroke="#10b981"
                  strokeWidth={2}
                  name={t('reports.comparison.profit')}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
