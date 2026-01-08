import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react'
import type { Database } from '@/types/database.types'
import {
  parseExcelFile,
  mapProductsToIds,
  validateImportItems,
  convertToFormItems,
  validateFile,
  type RawExcelRow,
  type MappedProduct,
  type ValidationResult,
  type RentalItemFormData,
  type SubrentalItemFormData,
} from '@/utils/excelImportParser'
import { generateImportTemplate } from '@/utils/excelImportTemplate'

type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row']
}

interface ExcelImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (items: RentalItemFormData[] | SubrentalItemFormData[]) => void
  itemType: 'rental' | 'subrental'
  products: Product[]
  days: number
}

export function ExcelImportDialog({
  open,
  onOpenChange,
  onImport,
  itemType,
  products,
  days,
}: ExcelImportDialogProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<ValidationResult | null>(null)
  const [mappedProducts, setMappedProducts] = useState<MappedProduct[]>([])

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPreviewData(null)
      setMappedProducts([])
      setFileError(null)
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    onOpenChange(newOpen)
  }

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      setFileError(null)
      setPreviewData(null)
      setIsProcessing(true)

      try {
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setFileError(validationError)
          setIsProcessing(false)
          return
        }

        // Parse Excel file
        const rows: RawExcelRow[] = await parseExcelFile(file)

        // Map products
        const mapped = mapProductsToIds(rows, products)
        setMappedProducts(mapped)

        // Validate
        const validation = validateImportItems(mapped, itemType)
        setPreviewData(validation)
      } catch (error) {
        console.error('Excel import error:', error)
        setFileError('excelImport.errors.parseError')
      } finally {
        setIsProcessing(false)
      }
    },
    [products, itemType]
  )

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Download template
  const handleDownloadTemplate = () => {
    generateImportTemplate(products, itemType)
  }

  // Import valid items
  const handleImport = () => {
    if (!previewData || previewData.valid.length === 0) return

    const formItems = convertToFormItems(previewData.valid, days, itemType)
    onImport(formItems as RentalItemFormData[] | SubrentalItemFormData[])
    handleOpenChange(false)
  }

  // Get status icon
  const getStatusIcon = (status: MappedProduct['status']) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t('excelImport.dialog.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          {!previewData && (
            <>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center
                  transition-colors cursor-pointer
                  ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="space-y-3">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t('excelImport.dialog.processing')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-base font-medium">
                        {t('excelImport.dialog.uploadArea.dragDrop')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('excelImport.dialog.uploadArea.orClick')}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('excelImport.dialog.uploadArea.accepted')}
                    </p>
                  </div>
                )}
              </div>

              {/* File Error */}
              {fileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t(fileError)}</AlertDescription>
                </Alert>
              )}

              {/* Download Template */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('excelImport.dialog.downloadTemplate')}
                </Button>
              </div>
            </>
          )}

          {/* Preview Table */}
          {previewData && (
            <>
              {/* Summary Stats */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">
                    {previewData.valid.length}{' '}
                    {t('excelImport.dialog.preview.matched')}
                  </span>
                </div>
                {previewData.warnings.length > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {previewData.warnings.length}{' '}
                      {t('excelImport.dialog.preview.warnings')}
                    </span>
                  </div>
                )}
                {previewData.invalid.length > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">
                      {previewData.invalid.length}{' '}
                      {t('excelImport.dialog.preview.errors')}
                    </span>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium w-12">
                          {t('excelImport.dialog.preview.status')}
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          {t('excelImport.dialog.preview.code')}
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          {t('excelImport.dialog.preview.name')}
                        </th>
                        <th className="px-4 py-2 text-right font-medium w-20">
                          {t('excelImport.dialog.preview.quantity')}
                        </th>
                        {itemType === 'subrental' && (
                          <th className="px-4 py-2 text-right font-medium w-24">
                            {t('excelImport.dialog.preview.purchasePrice')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mappedProducts.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            item.status === 'error'
                              ? 'bg-red-50 dark:bg-red-950/20'
                              : item.status === 'warning'
                              ? 'bg-yellow-50 dark:bg-yellow-950/20'
                              : ''
                          }
                        >
                          <td className="px-4 py-2">{getStatusIcon(item.status)}</td>
                          <td className="px-4 py-2 font-mono text-xs">
                            {item.row.productCode || '-'}
                          </td>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">
                                {item.product?.name || item.row.productName || '-'}
                              </p>
                              {item.matchType === 'name_fuzzy' && item.matchScore && (
                                <p className="text-xs text-muted-foreground">
                                  {t('excelImport.dialog.preview.fuzzyMatch', {
                                    score: Math.round(item.matchScore * 100),
                                  })}
                                </p>
                              )}
                              {/* Errors */}
                              {item.errors.map((error, i) => (
                                <p key={i} className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  {t(error, {
                                    code: item.row.productCode,
                                    available: item.product?.available_quantity,
                                  })}
                                </p>
                              ))}
                              {/* Warnings */}
                              {item.warnings.map((warning, i) => (
                                <p
                                  key={i}
                                  className="text-xs text-yellow-600 dark:text-yellow-400 mt-1"
                                >
                                  {t(warning)}
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            {item.validatedQuantity || '-'}
                          </td>
                          {itemType === 'subrental' && (
                            <td className="px-4 py-2 text-right font-mono">
                              {item.validatedPurchasePrice !== undefined
                                ? `€${item.validatedPurchasePrice.toFixed(2)}`
                                : '-'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warnings/Errors Summary */}
              {(previewData.warnings.length > 0 || previewData.invalid.length > 0) && (
                <div className="space-y-2">
                  {previewData.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {t('excelImport.dialog.warningsMessage', {
                          count: previewData.warnings.length,
                        })}
                      </AlertDescription>
                    </Alert>
                  )}
                  {previewData.invalid.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t('excelImport.dialog.errorsMessage', {
                          count: previewData.invalid.length,
                        })}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter>
          {previewData ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewData(null)
                  setMappedProducts([])
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                {t('excelImport.dialog.actions.back')}
              </Button>
              <Button
                onClick={handleImport}
                disabled={previewData.valid.length === 0}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {t('excelImport.dialog.actions.importValid', {
                  count: previewData.valid.length,
                })}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t('excelImport.dialog.actions.cancel')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
