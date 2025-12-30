import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Printer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RentalReportView } from '@/components/reports/RentalReportView'
import { ClientStatisticsView } from '@/components/reports/ClientStatisticsView'
import { ProductUtilizationView } from '@/components/reports/ProductUtilizationView'
import { RevenueReportView } from '@/components/reports/RevenueReportView'
import { SubrentalProfitView } from '@/components/reports/SubrentalProfitView'

type ReportType = 'rentals' | 'clients' | 'products' | 'revenue' | 'profit'

export function Reports() {
  const { t } = useTranslation()
  const [selectedReport, setSelectedReport] = useState<ReportType>('rentals')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Report type options
  const reportTypes = [
    {
      key: 'rentals' as ReportType,
      icon: FileText,
      label: t('reports.types.rentals'),
      description: t('reports.types.rentalsDesc'),
    },
    {
      key: 'clients' as ReportType,
      icon: Users,
      label: t('reports.types.clients'),
      description: t('reports.types.clientsDesc'),
    },
    {
      key: 'products' as ReportType,
      icon: Package,
      label: t('reports.types.products'),
      description: t('reports.types.productsDesc'),
    },
    {
      key: 'revenue' as ReportType,
      icon: DollarSign,
      label: t('reports.types.revenue'),
      description: t('reports.types.revenueDesc'),
    },
    {
      key: 'profit' as ReportType,
      icon: TrendingUp,
      label: t('reports.types.profit'),
      description: t('reports.types.profitDesc'),
    },
  ]

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Export to Excel')
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export to PDF')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('reports.subtitle')}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            {t('reports.exportExcel')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
            {t('reports.exportPdf')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            {t('reports.print')}
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid gap-4 md:grid-cols-5">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isSelected = selectedReport === report.key

          return (
            <Card
              key={report.key}
              cinematic
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedReport(report.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : ''}`}>
                      {report.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Date Range Filter */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.filters.dateRange')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('reports.filters.startDate')}
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('reports.filters.endDate')}
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 h-11"
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
                setStartDate(lastMonth.toISOString().split('T')[0])
                setEndDate(lastMonthEnd.toISOString().split('T')[0])
              }}
            >
              {t('reports.filters.lastMonth')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                setStartDate(thisMonthStart.toISOString().split('T')[0])
                setEndDate(today.toISOString().split('T')[0])
              }}
            >
              {t('reports.filters.thisMonth')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const last30Days = new Date(today)
                last30Days.setDate(today.getDate() - 30)
                setStartDate(last30Days.toISOString().split('T')[0])
                setEndDate(today.toISOString().split('T')[0])
              }}
            >
              {t('reports.filters.last30Days')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate('')
                setEndDate('')
              }}
            >
              {t('reports.filters.clearDates')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="animate-in fade-in duration-300">
        {selectedReport === 'rentals' && (
          <RentalReportView startDate={startDate} endDate={endDate} />
        )}
        {selectedReport === 'clients' && (
          <ClientStatisticsView startDate={startDate} endDate={endDate} />
        )}
        {selectedReport === 'products' && (
          <ProductUtilizationView startDate={startDate} endDate={endDate} />
        )}
        {selectedReport === 'revenue' && (
          <RevenueReportView startDate={startDate} endDate={endDate} />
        )}
        {selectedReport === 'profit' && (
          <SubrentalProfitView startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  )
}
