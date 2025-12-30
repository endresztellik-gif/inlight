import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProductUtilization } from '@/hooks/api/useReports'
import { useCategories } from '@/hooks/api/useCategories'

interface ProductUtilizationViewProps {
  startDate?: string
  endDate?: string
}

export function ProductUtilizationView({ startDate, endDate }: ProductUtilizationViewProps) {
  const { t } = useTranslation()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: categories } = useCategories()
  const { data, isLoading } = useProductUtilization({
    startDate,
    endDate,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const products = data?.products || []
  const summary = data?.summary || {
    totalProducts: 0,
    totalRevenue: 0,
    totalRentalDays: 0,
    mostPopular: null,
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.product.totalProducts')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1">
                {summary.totalProducts}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.product.totalRevenue')}
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
                {t('reports.product.totalDays')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-blue-500">
                {summary.totalRentalDays}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('reports.product.mostPopular')}
                </p>
                <p className="text-sm font-semibold mt-1 text-amber-500 truncate">
                  {summary.mostPopular?.product_name || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card cinematic>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
            >
              {t('reports.filters.all')}
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={categoryFilter === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category.id)}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Products */}
      {products.slice(0, 10).length > 0 && (
        <Card cinematic>
          <CardHeader>
            <CardTitle className="text-xl">{t('reports.product.top10')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.slice(0, 10).map((product, index) => (
                <div
                  key={product.product_id}
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
                    <p className="font-semibold">{product.product_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-muted-foreground">
                        {product.serial_number}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {product.category_name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-green-500">
                      €{product.total_revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.times_rented} {t('reports.product.rentals')} · {product.total_days} {t('reports.product.days')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Products Table */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-xl">{t('reports.product.allProducts')}</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('reports.product.noProducts')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.product.productName')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.product.category')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.product.timesRented')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.product.totalDays')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.product.avgDailyRate')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.product.totalRevenue')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr
                      key={product.product_id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{product.product_name}</p>
                          <p className="text-xs font-mono text-muted-foreground">
                            {product.serial_number}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {product.category_name}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono">{product.times_rented}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono">{product.total_days}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-sm">
                          €{product.avg_daily_rate.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-semibold text-green-500">
                          €{product.total_revenue.toFixed(2)}
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
