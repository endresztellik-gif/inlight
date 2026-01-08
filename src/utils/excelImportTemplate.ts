import * as XLSX from 'xlsx'
import type { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row']
}

/**
 * Generate downloadable Excel import template
 * Creates a multi-sheet workbook with instructions, template, and catalog
 *
 * @param products Available products for reference
 * @param itemType Type of import (rental or subrental)
 * @param filename Optional custom filename
 */
export function generateImportTemplate(
  products: Product[],
  itemType: 'rental' | 'subrental' = 'rental',
  filename?: string
): void {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Instructions
  const instructions = [
    ['How to Import Items'],
    [''],
    ['1. Fill in the "Import Data" sheet with your products'],
    ['2. Product Code: Enter the serial number (e.g., ARRI-001)'],
    ['3. Product Name: Enter product name for validation'],
    ['4. Quantity: Number of units to rent (positive whole number)'],
  ]

  if (itemType === 'subrental') {
    instructions.push([
      '5. Purchase Price (Optional): Cost per unit per day',
    ])
  }

  instructions.push(
    [''],
    ['6. Save the file and upload via "Import Excel" button'],
    [''],
    ['Tips:'],
    ['- Product Code is required (matches serial_number in catalog)'],
    ['- Product Name is optional but recommended for verification'],
    ['- Quantity must be a positive whole number'],
    ['- Duplicate products will have quantities merged'],
    ['- Products marked with ⚠ are inactive but can still be imported'],
    [''],
    ['Matching Strategy:'],
    ['1. First tries exact match on Product Code (serial number)'],
    ['2. Then tries exact match on Product Name'],
    ['3. Finally tries fuzzy match on Product Name (80% similarity)'],
  )

  const instructionSheet = XLSX.utils.aoa_to_sheet(instructions)

  // Set column widths for instructions
  instructionSheet['!cols'] = [{ wch: 80 }]

  XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions')

  // Sheet 2: Import Data (template)
  const headers =
    itemType === 'subrental'
      ? ['Product Code', 'Product Name', 'Quantity', 'Purchase Price']
      : ['Product Code', 'Product Name', 'Quantity']

  const importData = [
    headers,
    ...(itemType === 'subrental'
      ? [['EXAMPLE-001', 'Example Product', '1', '100.00']]
      : [['EXAMPLE-001', 'Example Product', '1']]),
  ]

  const importSheet = XLSX.utils.aoa_to_sheet(importData)

  // Set column widths
  importSheet['!cols'] = [
    { wch: 20 }, // Product Code
    { wch: 30 }, // Product Name
    { wch: 10 }, // Quantity
    ...(itemType === 'subrental' ? [{ wch: 15 }] : []), // Purchase Price
  ]

  XLSX.utils.book_append_sheet(workbook, importSheet, 'Import Data')

  // Sheet 3: Available Products (reference catalog)
  const catalogData = products
    .filter((p) => p.is_active) // Only show active products
    .map((p) => ({
      'Product Code': p.serial_number || '',
      'Product Name': p.name || '',
      'Daily Rate': p.daily_rate ? `€${p.daily_rate.toFixed(2)}` : '',
      Available: p.available_quantity ?? 0,
      Category: p.category?.name || 'N/A',
      Status: p.is_active ? '✓ Active' : '⚠ Inactive',
    }))

  const catalogSheet = XLSX.utils.json_to_sheet(catalogData)

  // Set column widths
  catalogSheet['!cols'] = [
    { wch: 20 }, // Product Code
    { wch: 30 }, // Product Name
    { wch: 12 }, // Daily Rate
    { wch: 10 }, // Available
    { wch: 20 }, // Category
    { wch: 12 }, // Status
  ]

  XLSX.utils.book_append_sheet(workbook, catalogSheet, 'Available Products')

  // Download file
  const defaultFilename =
    itemType === 'subrental'
      ? 'subrental-import-template.xlsx'
      : 'rental-import-template.xlsx'

  XLSX.writeFile(workbook, filename || defaultFilename)
}

/**
 * Generate example Excel file for testing
 * Creates a pre-filled template with sample data
 *
 * @param products Sample products (at least 3 recommended)
 * @param itemType Type of import
 */
export function generateExampleImport(
  products: Product[],
  itemType: 'rental' | 'subrental' = 'rental'
): void {
  const workbook = XLSX.utils.book_new()

  // Take first 5 products as examples
  const sampleProducts = products.slice(0, 5)

  const headers =
    itemType === 'subrental'
      ? ['Product Code', 'Product Name', 'Quantity', 'Purchase Price']
      : ['Product Code', 'Product Name', 'Quantity']

  const sampleData = sampleProducts.map((p, index) => {
    const row = [
      p.serial_number || `SAMPLE-${index + 1}`,
      p.name || 'Sample Product',
      index % 2 === 0 ? '2' : '1', // Vary quantities
    ]

    if (itemType === 'subrental') {
      // Add sample purchase price (80% of daily rate)
      const purchasePrice = p.daily_rate ? (p.daily_rate * 0.8).toFixed(2) : '0.00'
      row.push(purchasePrice)
    }

    return row
  })

  const exampleSheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData])

  // Set column widths
  exampleSheet['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 10 },
    ...(itemType === 'subrental' ? [{ wch: 15 }] : []),
  ]

  XLSX.utils.book_append_sheet(workbook, exampleSheet, 'Example Import')

  const filename =
    itemType === 'subrental'
      ? 'subrental-example.xlsx'
      : 'rental-example.xlsx'

  XLSX.writeFile(workbook, filename)
}
