import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SubrentalProfitData } from '@/hooks/api/useReports'

/**
 * Export Subrental Profit Report to PDF
 */
export function exportSubrentalProfitToPDF(
  data: SubrentalProfitData[],
  filename: string = 'subrental-profit-report'
) {
  // Create new PDF document
  const doc = new jsPDF('landscape')

  // Add title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Subrental Profit Report', 14, 15)

  // Add subtitle with date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const today = new Date().toLocaleDateString()
  doc.text(`Generated: ${today}`, 14, 22)

  // Calculate summary
  const totalPurchaseCost = data.reduce((sum, item) => sum + item.purchase_cost, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.rental_revenue, 0)
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0)
  const avgMargin = data.length > 0
    ? data.reduce((sum, item) => sum + item.profit_margin, 0) / data.length
    : 0

  // Add summary section
  const summaryY = 30
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, summaryY)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Subrentals: ${data.length}`, 14, summaryY + 7)
  doc.text(`Total Purchase Cost: €${totalPurchaseCost.toFixed(2)}`, 14, summaryY + 12)
  doc.text(`Total Revenue: €${totalRevenue.toFixed(2)}`, 14, summaryY + 17)
  doc.text(`Total Profit: €${totalProfit.toFixed(2)}`, 80, summaryY + 7)
  doc.text(`Avg Profit Margin: ${avgMargin.toFixed(1)}%`, 80, summaryY + 12)
  doc.text(`Profitable: ${data.filter(s => s.profit > 0).length}`, 80, summaryY + 17)

  // Prepare table data
  const tableData = data.map((item) => [
    item.rental_number,
    item.supplier_name,
    item.client_name,
    `${new Date(item.start_date).toLocaleDateString()} - ${new Date(item.end_date).toLocaleDateString()}`,
    `€${item.purchase_cost.toFixed(2)}`,
    `€${item.rental_revenue.toFixed(2)}`,
    `€${item.profit.toFixed(2)}`,
    `${item.profit_margin.toFixed(1)}%`,
  ])

  // Add table
  autoTable(doc, {
    head: [[
      'Subrental #',
      'Supplier',
      'Client',
      'Period',
      'Cost',
      'Revenue',
      'Profit',
      'Margin',
    ]],
    body: tableData,
    startY: summaryY + 25,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' }, // Subrental #
      1: { cellWidth: 35 }, // Supplier
      2: { cellWidth: 35 }, // Client
      3: { cellWidth: 45, fontSize: 7 }, // Period
      4: { cellWidth: 22, halign: 'right', textColor: [220, 38, 38] }, // Cost (red)
      5: { cellWidth: 22, halign: 'right', textColor: [59, 130, 246] }, // Revenue (blue)
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }, // Profit
      7: { cellWidth: 18, halign: 'right', fontStyle: 'bold' }, // Margin
    },
    didParseCell: function(data) {
      // Color profit column based on value
      if (data.column.index === 6 && data.section === 'body') {
        const profitValue = parseFloat(data.cell.text[0].replace(/[€,]/g, ''))
        if (profitValue > 0) {
          data.cell.styles.textColor = [34, 197, 94] // Green
        } else if (profitValue < 0) {
          data.cell.styles.textColor = [220, 38, 38] // Red
        }
      }
      // Color margin column based on value
      if (data.column.index === 7 && data.section === 'body') {
        const marginValue = parseFloat(data.cell.text[0].replace('%', ''))
        if (marginValue > 0) {
          data.cell.styles.textColor = [34, 197, 94] // Green
        } else if (marginValue < 0) {
          data.cell.styles.textColor = [220, 38, 38] // Red
        }
      }
    },
    margin: { top: 30, left: 14, right: 14 },
  })

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
    doc.text(
      'iNLighT Rental Manager',
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    )
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${timestamp}.pdf`

  // Download PDF
  doc.save(fullFilename)
}

/**
 * Export Generic Report Data to PDF
 */
export function exportGenericDataToPDF<T extends Record<string, any>>(
  data: T[],
  title: string,
  filename: string = 'report'
) {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  const doc = new jsPDF('landscape')

  // Add title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 15)

  // Add date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const today = new Date().toLocaleDateString()
  doc.text(`Generated: ${today}`, 14, 22)

  // Prepare table headers and data
  const columns = Object.keys(data[0])
  const tableData = data.map((row) => columns.map((col) => String(row[col] || '')))

  // Add table
  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: 30,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    margin: { top: 30 },
  })

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Download
  const timestamp = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${timestamp}.pdf`
  doc.save(fullFilename)
}
