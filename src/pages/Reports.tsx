import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Printer,
  GitCompare,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { RentalReportView } from '@/components/reports/RentalReportView'
import { ClientStatisticsView } from '@/components/reports/ClientStatisticsView'
import { ProductUtilizationView } from '@/components/reports/ProductUtilizationView'
import { RevenueReportView } from '@/components/reports/RevenueReportView'
import { SubrentalProfitView } from '@/components/reports/SubrentalProfitView'
import { RentalSubrentalComparisonView } from '@/components/reports/RentalSubrentalComparisonView'
import { AdvancedFilters, type ReportFilters } from '@/components/reports/AdvancedFilters'
import { ReportScheduler } from '@/components/reports/ReportScheduler'
import {
  exportRentalsToExcel,
  exportClientStatsToExcel,
  exportProductUtilizationToExcel,
  exportRevenueToExcel,
  exportSubrentalProfitToExcel,
  exportComparisonToExcel,
  exportRentalsToPDF,
  exportClientStatsToPDF,
  exportProductUtilizationToPDF,
  exportRevenueToPDF,
  exportSubrentalProfitToPDF,
  exportComparisonToPDF,
} from '@/utils/reportExports'

type ReportType = 'rentals' | 'clients' | 'products' | 'revenue' | 'profit' | 'comparison'

export function Reports() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedReport, setSelectedReport] = useState<ReportType>('rentals')
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    status: [],
    clientSearch: '',
    productSearch: '',
    minAmount: undefined,
    maxAmount: undefined,
    rentalType: 'all',
  })

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
    {
      key: 'comparison' as ReportType,
      icon: GitCompare,
      label: t('reports.types.comparison'),
      description: t('reports.types.comparisonDesc'),
    },
  ]

  const handleExportExcel = () => {
    switch (selectedReport) {
      case 'rentals': {
        // Get all queries that start with ['rentalReport']
        const queries = queryClient.getQueriesData({ queryKey: ['rentalReport'] })
        // Take the first (most recent) match
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'rentals' in data) {
          exportRentalsToExcel(data.rentals)
        } else {
          console.warn('No rental report data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'clients': {
        const queries = queryClient.getQueriesData({ queryKey: ['clientStatistics'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'clients' in data) {
          exportClientStatsToExcel(data.clients)
        } else {
          console.warn('No client statistics data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'products': {
        const queries = queryClient.getQueriesData({ queryKey: ['productUtilization'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'products' in data) {
          exportProductUtilizationToExcel(data.products)
        } else {
          console.warn('No product utilization data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'revenue': {
        const queries = queryClient.getQueriesData({ queryKey: ['revenueReport'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'revenues' in data) {
          exportRevenueToExcel(data.revenues)
        } else {
          console.warn('No revenue report data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'profit': {
        const queries = queryClient.getQueriesData({ queryKey: ['subrentalProfit'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'subrentals' in data) {
          exportSubrentalProfitToExcel(data.subrentals)
        } else {
          console.warn('No subrental profit data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'comparison': {
        const queries = queryClient.getQueriesData({ queryKey: ['rentalSubrentalComparison'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'comparison' in data && 'summary' in data) {
          exportComparisonToExcel(data.comparison, data.summary)
        } else {
          console.warn('No comparison data available for export. Please wait for the report to load.')
        }
        break
      }
    }
  }

  const handleExportPDF = () => {
    switch (selectedReport) {
      case 'rentals': {
        // Get all queries that start with ['rentalReport']
        const queries = queryClient.getQueriesData({ queryKey: ['rentalReport'] })
        // Take the first (most recent) match
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'rentals' in data) {
          exportRentalsToPDF(data.rentals)
        } else {
          console.warn('No rental report data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'clients': {
        const queries = queryClient.getQueriesData({ queryKey: ['clientStatistics'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'clients' in data) {
          exportClientStatsToPDF(data.clients)
        } else {
          console.warn('No client statistics data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'products': {
        const queries = queryClient.getQueriesData({ queryKey: ['productUtilization'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'products' in data) {
          exportProductUtilizationToPDF(data.products)
        } else {
          console.warn('No product utilization data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'revenue': {
        const queries = queryClient.getQueriesData({ queryKey: ['revenueReport'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'revenues' in data) {
          exportRevenueToPDF(data.revenues)
        } else {
          console.warn('No revenue report data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'profit': {
        const queries = queryClient.getQueriesData({ queryKey: ['subrentalProfit'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'subrentals' in data) {
          exportSubrentalProfitToPDF(data.subrentals)
        } else {
          console.warn('No subrental profit data available for export. Please wait for the report to load.')
        }
        break
      }
      case 'comparison': {
        const queries = queryClient.getQueriesData({ queryKey: ['rentalSubrentalComparison'] })
        const data = queries.length > 0 ? queries[0][1] as any : null
        if (data && typeof data === 'object' && 'comparison' in data && 'summary' in data) {
          exportComparisonToPDF(data.comparison, data.summary)
        } else {
          console.warn('No comparison data available for export. Please wait for the report to load.')
        }
        break
      }
    }
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

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        showTypeFilter={selectedReport === 'rentals' || selectedReport === 'comparison'}
      />

      {/* Report Scheduler */}
      <ReportScheduler
        currentReportType={selectedReport}
        currentFilters={filters}
      />

      {/* Report Content */}
      <div className="animate-in fade-in duration-300">
        {selectedReport === 'rentals' && (
          <RentalReportView filters={filters} />
        )}
        {selectedReport === 'clients' && (
          <ClientStatisticsView startDate={filters.startDate || ''} endDate={filters.endDate || ''} />
        )}
        {selectedReport === 'products' && (
          <ProductUtilizationView startDate={filters.startDate || ''} endDate={filters.endDate || ''} />
        )}
        {selectedReport === 'revenue' && (
          <RevenueReportView startDate={filters.startDate || ''} endDate={filters.endDate || ''} />
        )}
        {selectedReport === 'profit' && (
          <SubrentalProfitView startDate={filters.startDate || ''} endDate={filters.endDate || ''} />
        )}

        {selectedReport === 'comparison' && (
          <RentalSubrentalComparisonView startDate={filters.startDate || ''} endDate={filters.endDate || ''} />
        )}
      </div>
    </div>
  )
}
