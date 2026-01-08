import * as XLSX from 'xlsx'
import type { Database } from '@/types/database.types'
import { calculateSimilarity } from './levenshtein'

type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row']
}

// Raw data from Excel file
export interface RawExcelRow {
  productCode?: string
  productName?: string
  quantity?: string | number
  purchasePrice?: string | number
}

// Mapped product with validation status
export interface MappedProduct {
  row: RawExcelRow
  product: Product | null
  matchType?: 'serial' | 'name_exact' | 'name_fuzzy' | 'none'
  matchScore?: number
  status: 'matched' | 'warning' | 'error'
  warnings: string[]
  errors: string[]
  validatedQuantity?: number
  validatedPurchasePrice?: number
}

// Validation result
export interface ValidationResult {
  valid: MappedProduct[]
  invalid: MappedProduct[]
  warnings: MappedProduct[]
  total: number
}

// Form data types
export interface RentalItemFormData {
  product_id: string
  quantity: number
  daily_rate: number
  days: number
  subtotal: number
}

export interface SubrentalItemFormData extends RentalItemFormData {
  purchase_price: number
}

/**
 * Parse Excel file to raw data
 * Supports both .xlsx and .xls formats
 *
 * @param file Excel file to parse
 * @returns Promise<RawExcelRow[]> Array of raw rows
 * @throws Error if file cannot be parsed
 */
export async function parseExcelFile(file: File): Promise<RawExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('No data in file'))
          return
        }

        // Read workbook
        const workbook = XLSX.read(data, { type: 'binary' })

        // Use first sheet
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          reject(new Error('Excel file has no sheets'))
          return
        }

        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON (expecting headers in first row)
        const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
          header: ['productCode', 'productName', 'quantity', 'purchasePrice'],
          range: 1, // Skip header row
          defval: '', // Default value for empty cells
          blankrows: false, // Skip blank rows
        })

        // Filter out completely empty rows
        const filteredData = jsonData.filter(
          (row) => row.productCode || row.productName || row.quantity
        )

        if (filteredData.length === 0) {
          reject(new Error('Excel file contains no data'))
          return
        }

        resolve(filteredData)
      } catch (error) {
        reject(new Error('Failed to parse Excel file'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsBinaryString(file)
  })
}

/**
 * Fuzzy match product name
 * Returns best matching product if similarity > 80%
 *
 * @param input Product name to match
 * @param products Available products
 * @param threshold Minimum similarity (0-1), default 0.8
 * @returns Best matching product or null
 */
export function fuzzyMatchProduct(
  input: string,
  products: Product[],
  threshold: number = 0.8
): { product: Product; score: number } | null {
  const inputLower = input.toLowerCase().trim()

  let bestMatch: { product: Product; score: number } | null = null
  let bestScore = 0

  products.forEach((product) => {
    const names = [
      product.name,
      product.name_en,
      product.name_hu,
    ].filter(Boolean) as string[]

    names.forEach((name) => {
      const score = calculateSimilarity(inputLower, name.toLowerCase().trim())

      if (score > threshold && score > bestScore) {
        bestMatch = { product, score }
        bestScore = score
      }
    })
  })

  return bestMatch
}

/**
 * Map Excel rows to products
 * Tries multiple matching strategies in priority order
 *
 * @param rows Raw Excel rows
 * @param products Available products
 * @returns Array of mapped products with match status
 */
export function mapProductsToIds(
  rows: RawExcelRow[],
  products: Product[]
): MappedProduct[] {
  return rows.map((row) => {
    let product: Product | null = null
    let matchType: MappedProduct['matchType'] = 'none'
    let matchScore: number | undefined

    // Strategy 1: Exact match on serial_number
    if (row.productCode) {
      product =
        products.find(
          (p) =>
            p.serial_number?.toLowerCase().trim() ===
            row.productCode?.toString().toLowerCase().trim()
        ) || null

      if (product) {
        matchType = 'serial'
      }
    }

    // Strategy 2: Exact match on name (any language)
    if (!product && row.productName) {
      const nameLower = row.productName.toString().toLowerCase().trim()

      product =
        products.find(
          (p) =>
            p.name?.toLowerCase().trim() === nameLower ||
            p.name_en?.toLowerCase().trim() === nameLower ||
            p.name_hu?.toLowerCase().trim() === nameLower
        ) || null

      if (product) {
        matchType = 'name_exact'
      }
    }

    // Strategy 3: Fuzzy match on name
    if (!product && row.productName) {
      const fuzzyResult = fuzzyMatchProduct(row.productName.toString(), products)
      if (fuzzyResult) {
        product = fuzzyResult.product
        matchType = 'name_fuzzy'
        matchScore = fuzzyResult.score
      }
    }

    // Initial status
    const status: MappedProduct['status'] = product ? 'matched' : 'error'

    return {
      row,
      product,
      matchType,
      matchScore,
      status,
      warnings: [],
      errors: [],
    }
  })
}

/**
 * Validate mapped products
 * Checks for errors and warnings
 *
 * @param mapped Mapped products
 * @param itemType Type of items (rental or subrental)
 * @returns ValidationResult with categorized items
 */
export function validateImportItems(
  mapped: MappedProduct[],
  itemType: 'rental' | 'subrental'
): ValidationResult {
  const result: ValidationResult = {
    valid: [],
    invalid: [],
    warnings: [],
    total: mapped.length,
  }

  mapped.forEach((item) => {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate product existence
    if (!item.product) {
      errors.push('excelImport.errors.productNotFound')
      item.status = 'error'
      result.invalid.push({ ...item, errors, warnings })
      return
    }

    // Validate quantity
    const qty = parseFloat(item.row.quantity?.toString() || '0')
    if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      errors.push('excelImport.errors.invalidQuantity')
    } else {
      item.validatedQuantity = qty

      // Check stock availability (rental only)
      if (
        itemType === 'rental' &&
        item.product.available_quantity !== null &&
        qty > item.product.available_quantity
      ) {
        errors.push('excelImport.errors.stockShortage')
      }
    }

    // Validate purchase price (subrental only)
    if (itemType === 'subrental' && item.row.purchasePrice !== undefined) {
      const price = parseFloat(item.row.purchasePrice?.toString() || '0')
      if (isNaN(price) || price < 0) {
        errors.push('excelImport.errors.invalidPurchasePrice')
      } else {
        item.validatedPurchasePrice = price
      }
    } else if (itemType === 'subrental') {
      // Default to 0 if not provided
      item.validatedPurchasePrice = 0
    }

    // Check for warnings
    if (!item.product.is_active) {
      warnings.push('excelImport.warnings.inactiveProduct')
    }

    if (item.product.condition === 'damaged') {
      warnings.push('excelImport.warnings.damagedProduct')
    }

    if (item.matchType === 'name_fuzzy') {
      warnings.push('excelImport.warnings.fuzzyMatch')
    }

    // Categorize
    item.errors = errors
    item.warnings = warnings

    if (errors.length > 0) {
      item.status = 'error'
      result.invalid.push(item)
    } else if (warnings.length > 0) {
      item.status = 'warning'
      result.warnings.push(item)
      result.valid.push(item)
    } else {
      item.status = 'matched'
      result.valid.push(item)
    }
  })

  return result
}

/**
 * Convert mapped products to form items
 * Merges duplicate products (same product_id)
 *
 * @param mapped Validated mapped products
 * @param days Number of rental days
 * @param itemType Type of items (rental or subrental)
 * @returns Array of form data items
 */
export function convertToFormItems(
  mapped: MappedProduct[],
  days: number,
  itemType: 'rental' | 'subrental'
): RentalItemFormData[] | SubrentalItemFormData[] {
  // Merge duplicates by product_id
  const mergedMap = new Map<string, MappedProduct>()

  mapped.forEach((item) => {
    if (!item.product || !item.validatedQuantity) return

    const existing = mergedMap.get(item.product.id)

    if (existing && existing.validatedQuantity) {
      // Merge quantities
      existing.validatedQuantity += item.validatedQuantity

      // For subrental, average purchase prices (weighted by quantity)
      if (
        itemType === 'subrental' &&
        existing.validatedPurchasePrice !== undefined &&
        item.validatedPurchasePrice !== undefined
      ) {
        const totalQty = existing.validatedQuantity
        const prevQty = existing.validatedQuantity - item.validatedQuantity
        existing.validatedPurchasePrice =
          (existing.validatedPurchasePrice * prevQty +
            item.validatedPurchasePrice * item.validatedQuantity) /
          totalQty
      }
    } else {
      mergedMap.set(item.product.id, { ...item })
    }
  })

  // Convert to form items
  const formItems: (RentalItemFormData | SubrentalItemFormData)[] = []

  mergedMap.forEach((item) => {
    if (!item.product || !item.validatedQuantity) return

    const dailyRate = item.product.daily_rate || 0
    const subtotal = item.validatedQuantity * dailyRate * days

    if (itemType === 'subrental') {
      formItems.push({
        product_id: item.product.id,
        quantity: item.validatedQuantity,
        daily_rate: dailyRate,
        days,
        subtotal,
        purchase_price: item.validatedPurchasePrice || 0,
      })
    } else {
      formItems.push({
        product_id: item.product.id,
        quantity: item.validatedQuantity,
        daily_rate: dailyRate,
        days,
        subtotal,
      })
    }
  })

  return formItems
}

/**
 * Validate file before parsing
 * Checks file type and size
 *
 * @param file File to validate
 * @returns Validation error or null if valid
 */
export function validateFile(file: File): string | null {
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ]

  const ALLOWED_EXTENSIONS = ['.xls', '.xlsx']
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  )

  if (!ALLOWED_TYPES.includes(file.type) && !hasValidExtension) {
    return 'excelImport.errors.invalidFileType'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'excelImport.errors.fileTooLarge'
  }

  return null
}

/**
 * Sanitize Excel input to prevent XSS
 *
 * @param value Any value from Excel cell
 * @returns Sanitized string
 */
export function sanitizeExcelInput(value: unknown): string {
  const str = String(value || '').trim()

  // Escape HTML entities
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
