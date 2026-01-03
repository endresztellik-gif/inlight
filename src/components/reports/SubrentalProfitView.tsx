import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, TrendingDown, FileSpreadsheet, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSubrentalProfitAnalysis } from '@/hooks/api/useReports'
import { exportSubrentalProfitToXLSX } from '@/utils/exportToXLSX'
import { exportSubrentalProfitToPDF } from '@/utils/exportToPDF'

interface SubrentalProfitViewProps {
  startDate?: string
  endDate?: string
}

export function SubrentalProfitView({ startDate, endDate }: SubrentalProfitViewProps) {
  const { t } = useTranslation()

  const { data, isLoading } = useSubrentalProfitAnalysis({
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

  const subrentals = data?.subrentals || []
  const summary = data?.summary || {
    totalSubrentals: 0,
    totalPurchaseCost: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgProfitMargin: 0,
  }

  // Export handlers
  const handleExportExcel = () => {
    if (subrentals.length === 0) {
      alert('No data to export')
      return
    }
    exportSubrentalProfitToXLSX(subrentals, 'subrental-profit-report')
  }

  const handleExportPDF = () => {
    if (subrentals.length === 0) {
      alert('No data to export')
      return
    }
    exportSubrentalProfitToPDF(subrentals, 'subrental-profit-report')
  }

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      {subrentals.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            {t('reports.exportExcel')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
            {t('reports.exportPdf')}
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.profit.totalSubrentals')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1">
                {summary.totalSubrentals}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.profit.purchaseCost')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-red-500">
                €{summary.totalPurchaseCost.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.profit.revenue')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-blue-500">
                €{summary.totalRevenue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('reports.profit.totalProfit')}
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-green-500">
                €{summary.totalProfit.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {summary.avgProfitMargin > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('reports.profit.avgMargin')}
                </p>
                <p
                  className={`text-2xl font-bold font-mono mt-1 ${
                    summary.avgProfitMargin > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {summary.avgProfitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Profitable Subrentals */}
      {subrentals.slice(0, 5).length > 0 && (
        <Card cinematic>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t('reports.profit.topProfitable')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subrentals
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 5)
                .map((subrental, index) => (
                  <div
                    key={subrental.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold font-mono">{subrental.rental_number}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {subrental.client_name}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-primary">
                          {subrental.supplier_name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-green-500">
                        +€{subrental.profit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subrental.profit_margin.toFixed(1)}% {t('reports.profit.margin')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Subrentals Table */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-xl">{t('reports.profit.allSubrentals')}</CardTitle>
        </CardHeader>
        <CardContent>
          {subrentals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('reports.profit.noSubrentals')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.subrental')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.supplier')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.client')}
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.period')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.cost')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.revenue')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.profit')}
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      {t('reports.profit.margin')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subrentals.map((subrental, index) => (
                    <tr
                      key={subrental.id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-semibold">
                          {subrental.rental_number}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{subrental.supplier_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{subrental.client_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-mono">
                          {new Date(subrental.start_date).toLocaleDateString()} -{' '}
                          {new Date(subrental.end_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-red-500">
                          €{subrental.purchase_cost.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-blue-500">
                          €{subrental.rental_revenue.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-mono font-semibold ${
                            subrental.profit > 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {subrental.profit > 0 ? '+' : ''}€{subrental.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-mono font-semibold ${
                            subrental.profit_margin > 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {subrental.profit_margin.toFixed(1)}%
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

      {/* Profit Distribution */}
      {subrentals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-lg text-green-500">
                {t('reports.profit.profitable')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono">
                {subrentals.filter(s => s.profit > 0).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {((subrentals.filter(s => s.profit > 0).length / subrentals.length) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-lg text-amber-500">
                {t('reports.profit.breakEven')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono">
                {subrentals.filter(s => s.profit === 0).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {((subrentals.filter(s => s.profit === 0).length / subrentals.length) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-lg text-red-500">
                {t('reports.profit.loss')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono">
                {subrentals.filter(s => s.profit < 0).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {((subrentals.filter(s => s.profit < 0).length / subrentals.length) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
