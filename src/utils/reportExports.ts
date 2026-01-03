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
