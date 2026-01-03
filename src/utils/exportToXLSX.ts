import * as XLSX from 'xlsx'
import type { SubrentalProfitData } from '@/hooks/api/useReports'

/**
 * Export Subrental Profit Report to XLSX (Excel)
 */
export function exportSubrentalProfitToXLSX(
  data: SubrentalProfitData[],
  filename: string = 'subrental-profit-report'
) {
  // Prepare data for Excel
  const excelData = data.map((item) => ({
    'Subrental Number': item.rental_number,
    'Supplier': item.supplier_name,
    'Client': item.client_name,
    'Start Date': new Date(item.start_date).toLocaleDateString(),
    'End Date': new Date(item.end_date).toLocaleDateString(),
    'Purchase Cost (EUR)': item.purchase_cost.toFixed(2),
    'Rental Revenue (EUR)': item.rental_revenue.toFixed(2),
    'Profit (EUR)': item.profit.toFixed(2),
    'Profit Margin (%)': item.profit_margin.toFixed(1),
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Subrental Number
    { wch: 25 }, // Supplier
    { wch: 25 }, // Client
    { wch: 12 }, // Start Date
    { wch: 12 }, // End Date
    { wch: 18 }, // Purchase Cost
    { wch: 18 }, // Rental Revenue
    { wch: 15 }, // Profit
    { wch: 18 }, // Profit Margin
  ]
  worksheet['!cols'] = columnWidths

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Profit Report')

  // Add summary sheet
  if (data.length > 0) {
    const totalPurchaseCost = data.reduce((sum, item) => sum + item.purchase_cost, 0)
    const totalRevenue = data.reduce((sum, item) => sum + item.rental_revenue, 0)
    const totalProfit = data.reduce((sum, item) => sum + item.profit, 0)
    const avgMargin = data.reduce((sum, item) => sum + item.profit_margin, 0) / data.length

    const summaryData = [
      { Metric: 'Total Subrentals', Value: data.length.toString() },
      { Metric: 'Total Purchase Cost (EUR)', Value: totalPurchaseCost.toFixed(2) },
      { Metric: 'Total Revenue (EUR)', Value: totalRevenue.toFixed(2) },
      { Metric: 'Total Profit (EUR)', Value: totalProfit.toFixed(2) },
      { Metric: 'Average Profit Margin (%)', Value: avgMargin.toFixed(1) },
      { Metric: 'Profitable Subrentals', Value: data.filter(s => s.profit > 0).length.toString() },
      { Metric: 'Loss-Making Subrentals', Value: data.filter(s => s.profit < 0).length.toString() },
    ]

    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
  }

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${timestamp}.xlsx`

  // Download file
  XLSX.writeFile(workbook, fullFilename)
}

/**
 * Export Generic Report Data to XLSX
 */
export function exportGenericDataToXLSX<T extends Record<string, any>>(
  data: T[],
  sheetName: string = 'Report',
  filename: string = 'report'
) {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Create worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Auto-size columns based on content
  const columnKeys = Object.keys(data[0])
  const columnWidths = columnKeys.map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key] || '').length)
    )
    return { wch: Math.min(maxLength + 2, 50) } // Max 50 chars wide
  })
  worksheet['!cols'] = columnWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${timestamp}.xlsx`

  // Download
  XLSX.writeFile(workbook, fullFilename)
}
