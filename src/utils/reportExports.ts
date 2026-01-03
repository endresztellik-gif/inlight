import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type {
  RentalReportData,
  ClientStatData,
  ProductUtilizationData,
  RevenueData,
  SubrentalProfitData,
} from '@/hooks/api/useReports'

/**
 * Excel Export Functions
 */

export function exportRentalsToExcel(data: RentalReportData[], filename = 'rentals-report.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(rental => ({
      'Rental Number': rental.rental_number,
      'Type': rental.type.toUpperCase(),
      'Client': rental.client_name,
      'Project': rental.project_name,
      'Start Date': rental.start_date,
      'End Date': rental.end_date,
      'Status': rental.status,
      'Total': rental.final_total,
      'Currency': rental.final_currency,
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rentals')
  XLSX.writeFile(workbook, filename)
}

export function exportClientStatsToExcel(data: ClientStatData[], filename = 'client-statistics.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(client => ({
      'Client': client.client_name,
      'Company': client.company || '-',
      'Total Rentals': client.total_rentals,
      'Total Revenue': client.total_revenue.toFixed(2),
      'Average Rental Value': client.avg_rental_value.toFixed(2),
      'Last Rental': client.last_rental_date || '-',
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Client Statistics')
  XLSX.writeFile(workbook, filename)
}

export function exportProductUtilizationToExcel(data: ProductUtilizationData[], filename = 'product-utilization.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(product => ({
      'Product': product.product_name,
      'Serial Number': product.serial_number,
      'Category': product.category_name,
      'Times Rented': product.times_rented,
      'Total Days': product.total_days,
      'Total Revenue': product.total_revenue.toFixed(2),
      'Avg Daily Rate': product.avg_daily_rate.toFixed(2),
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Utilization')
  XLSX.writeFile(workbook, filename)
}

export function exportRevenueToExcel(data: RevenueData[], filename = 'revenue-report.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(revenue => ({
      'Period': revenue.period,
      'Currency': revenue.currency,
      'Total Revenue': revenue.total.toFixed(2),
      'Rental Count': revenue.rental_count,
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue')
  XLSX.writeFile(workbook, filename)
}

export function exportSubrentalProfitToExcel(data: SubrentalProfitData[], filename = 'subrental-profit.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(subrental => ({
      'Subrental Number': subrental.rental_number,
      'Supplier': subrental.supplier_name,
      'Client': subrental.client_name,
      'Start Date': subrental.start_date,
      'End Date': subrental.end_date,
      'Purchase Cost': subrental.purchase_cost.toFixed(2),
      'Rental Revenue': subrental.rental_revenue.toFixed(2),
      'Profit': subrental.profit.toFixed(2),
      'Profit Margin %': subrental.profit_margin.toFixed(1),
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Subrental Profit')
  XLSX.writeFile(workbook, filename)
}

/**
 * PDF Export Functions
 */

export function exportRentalsToPDF(data: RentalReportData[], filename = 'rentals-report.pdf') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Rentals Report', 14, 22)

  doc.setFontSize(10)
  const dateStr = new Date().toLocaleString()
  doc.text('Generated: ' + dateStr, 14, 30)

  autoTable(doc, {
    startY: 35,
    head: [['Rental #', 'Type', 'Client', 'Project', 'Start', 'End', 'Total']],
    body: data.map(rental => [
      rental.rental_number,
      rental.type.toUpperCase(),
      rental.client_name,
      rental.project_name,
      rental.start_date,
      rental.end_date,
      rental.final_currency + ' ' + rental.final_total.toFixed(2),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save(filename)
}

export function exportClientStatsToPDF(data: ClientStatData[], filename = 'client-statistics.pdf') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Client Statistics', 14, 22)

  doc.setFontSize(10)
  const dateStr = new Date().toLocaleString()
  doc.text('Generated: ' + dateStr, 14, 30)

  autoTable(doc, {
    startY: 35,
    head: [['Client', 'Company', 'Rentals', 'Revenue', 'Avg Value']],
    body: data.map(client => [
      client.client_name,
      client.company || '-',
      client.total_rentals.toString(),
      client.total_revenue.toFixed(2),
      client.avg_rental_value.toFixed(2),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save(filename)
}

export function exportProductUtilizationToPDF(data: ProductUtilizationData[], filename = 'product-utilization.pdf') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Product Utilization Report', 14, 22)

  doc.setFontSize(10)
  const dateStr = new Date().toLocaleString()
  doc.text('Generated: ' + dateStr, 14, 30)

  autoTable(doc, {
    startY: 35,
    head: [['Product', 'Category', 'Times Rented', 'Total Days', 'Revenue']],
    body: data.map(product => [
      product.product_name,
      product.category_name,
      product.times_rented.toString(),
      product.total_days.toString(),
      product.total_revenue.toFixed(2),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save(filename)
}

export function exportRevenueToPDF(data: RevenueData[], filename = 'revenue-report.pdf') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Revenue Report', 14, 22)

  doc.setFontSize(10)
  const dateStr = new Date().toLocaleString()
  doc.text('Generated: ' + dateStr, 14, 30)

  const totalRevenue = data.reduce((sum, item) => sum + item.total, 0)
  const totalRentals = data.reduce((sum, item) => sum + item.rental_count, 0)

  doc.setFontSize(12)
  doc.text('Total Revenue: ' + totalRevenue.toFixed(2), 14, 42)
  doc.text('Total Rentals: ' + totalRentals, 14, 50)

  autoTable(doc, {
    startY: 60,
    head: [['Period', 'Currency', 'Revenue', 'Rental Count']],
    body: data.map(revenue => [
      revenue.period,
      revenue.currency,
      revenue.total.toFixed(2),
      revenue.rental_count.toString(),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save(filename)
}

export function exportSubrentalProfitToPDF(data: SubrentalProfitData[], filename = 'subrental-profit.pdf') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Subrental Profit Analysis', 14, 22)

  doc.setFontSize(10)
  const dateStr = new Date().toLocaleString()
  doc.text('Generated: ' + dateStr, 14, 30)

  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.rental_revenue, 0)
  const totalCost = data.reduce((sum, item) => sum + item.purchase_cost, 0)
  const avgMargin = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(1) : '0'

  doc.setFontSize(12)
  doc.text('Total Revenue: ' + totalRevenue.toFixed(2), 14, 42)
  doc.text('Total Cost: ' + totalCost.toFixed(2), 14, 50)
  doc.text('Total Profit: ' + totalProfit.toFixed(2), 14, 58)
  doc.text('Avg Margin: ' + avgMargin + '%', 14, 66)

  autoTable(doc, {
    startY: 75,
    head: [['Subrental #', 'Supplier', 'Client', 'Cost', 'Revenue', 'Profit', 'Margin %']],
    body: data.map(sub => [
      sub.rental_number,
      sub.supplier_name,
      sub.client_name,
      sub.purchase_cost.toFixed(2),
      sub.rental_revenue.toFixed(2),
      sub.profit.toFixed(2),
      sub.profit_margin.toFixed(1),
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save(filename)
}

/**
 * Comparison Report Export Types
 */
export interface ComparisonData {
  period: string
  rentalRevenue: number
  subrentalRevenue: number
  rentalCount: number
  subrentalCount: number
  subrentalProfit: number
}

export interface ComparisonSummary {
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

/**
 * Comparison Report - Excel Export
 */
export function exportComparisonToExcel(
  comparison: ComparisonData[],
  summary: ComparisonSummary,
  filename = 'rental-subrental-comparison.xlsx'
) {
  // Sheet 1: Summary
  const summaryData = [
    { Metric: 'Rental Revenue', Value: summary.rental.totalRevenue.toFixed(2), Type: 'Rental' },
    { Metric: 'Rental Count', Value: summary.rental.count, Type: 'Rental' },
    { Metric: 'Avg Rental Value', Value: summary.rental.avgValue.toFixed(2), Type: 'Rental' },
    { Metric: '', Value: '', Type: '' }, // Empty row
    { Metric: 'Subrental Revenue', Value: summary.subrental.totalRevenue.toFixed(2), Type: 'Subrental' },
    { Metric: 'Subrental Count', Value: summary.subrental.count, Type: 'Subrental' },
    { Metric: 'Avg Subrental Value', Value: summary.subrental.avgValue.toFixed(2), Type: 'Subrental' },
    { Metric: 'Purchase Cost', Value: summary.subrental.totalCost.toFixed(2), Type: 'Subrental' },
    { Metric: 'Profit', Value: summary.subrental.profit.toFixed(2), Type: 'Subrental' },
    { Metric: 'Profit Margin', Value: summary.subrental.margin.toFixed(1) + '%', Type: 'Subrental' },
  ]
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)

  // Sheet 2: Detailed Comparison
  const detailedData = comparison.map(item => ({
    Period: item.period,
    'Rental Revenue': item.rentalRevenue.toFixed(2),
    'Rental Count': item.rentalCount,
    'Subrental Revenue': item.subrentalRevenue.toFixed(2),
    'Subrental Count': item.subrentalCount,
    'Subrental Profit': item.subrentalProfit.toFixed(2),
    'Total Revenue': (item.rentalRevenue + item.subrentalRevenue).toFixed(2),
  }))
  const detailedSheet = XLSX.utils.json_to_sheet(detailedData)

  // Create workbook with both sheets
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Comparison')
  XLSX.writeFile(workbook, filename)
}

/**
 * Comparison Report - PDF Export
 */
export function exportComparisonToPDF(
  comparison: ComparisonData[],
  summary: ComparisonSummary,
  filename = 'rental-subrental-comparison.pdf'
) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text('Rental vs Subrental Comparison Report', 14, 20)

  // Summary Section
  doc.setFontSize(14)
  doc.text('Summary', 14, 35)

  doc.setFontSize(10)
  let yPos = 45

  // Rental Summary
  doc.text('Rental:', 14, yPos)
  doc.text(`Total Revenue: €${summary.rental.totalRevenue.toFixed(2)}`, 20, yPos + 6)
  doc.text(`Count: ${summary.rental.count}`, 20, yPos + 12)
  doc.text(`Avg Value: €${summary.rental.avgValue.toFixed(2)}`, 20, yPos + 18)

  yPos += 30

  // Subrental Summary
  doc.text('Subrental:', 14, yPos)
  doc.text(`Total Revenue: €${summary.subrental.totalRevenue.toFixed(2)}`, 20, yPos + 6)
  doc.text(`Count: ${summary.subrental.count}`, 20, yPos + 12)
  doc.text(`Avg Value: €${summary.subrental.avgValue.toFixed(2)}`, 20, yPos + 18)
  doc.text(`Purchase Cost: €${summary.subrental.totalCost.toFixed(2)}`, 20, yPos + 24)
  doc.text(`Profit: €${summary.subrental.profit.toFixed(2)}`, 20, yPos + 30)
  doc.text(`Margin: ${summary.subrental.margin.toFixed(1)}%`, 20, yPos + 36)

  // Detailed Comparison Table
  autoTable(doc, {
    startY: yPos + 45,
    head: [['Period', 'Rental Rev', 'Rental Count', 'Subrental Rev', 'Subrental Count', 'Subrental Profit']],
    body: comparison.map(item => [
      item.period,
      '€' + item.rentalRevenue.toFixed(2),
      item.rentalCount,
      '€' + item.subrentalRevenue.toFixed(2),
      item.subrentalCount,
      '€' + item.subrentalProfit.toFixed(2),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save(filename)
}
