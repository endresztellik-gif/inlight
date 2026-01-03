import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  RotateCcw,
  Loader2,
  Truck
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSubrental, useProcessReturn } from '@/hooks/api/useRentals'

const statusConfig = {
  active: { color: 'text-primary bg-primary/20 border-primary/30' },
  pending_return: { color: 'text-amber-400 bg-amber-400/20 border-amber-400/30' },
  completed: { color: 'text-green-500 bg-green-500/20 border-green-500/30' },
  cancelled: { color: 'text-red-500 bg-red-500/20 border-red-500/30' }
}

export function SubrentalDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const { data: rental, isLoading, error } = useSubrental(id)
  const processReturn = useProcessReturn()

  const [returnMode, setReturnMode] = useState(false)
  const [returnItems, setReturnItems] = useState<Record<string, { condition: string; returned: boolean; damageDescription?: string }>>({})

  // Calculate days left
  const calculateDaysLeft = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Handle return item state
  const handleReturnChange = (itemId: string, field: 'condition' | 'returned' | 'damageDescription', value: string | boolean) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        condition: field === 'condition' ? (value as string) : (prev[itemId]?.condition || 'good'),
        returned: field === 'returned' ? (value as boolean) : (prev[itemId]?.returned || false),
        damageDescription: field === 'damageDescription' ? (value as string) : prev[itemId]?.damageDescription,
      }
    }))
  }

  // Complete return process
  const handleCompleteReturn = async () => {
    if (!rental) return

    try {
      const items = rental.rental_items.map(item => ({
        id: item.id,
        condition_on_return: returnItems[item.id]?.condition || 'good',
        is_returned: returnItems[item.id]?.returned || false,
        damage_description: returnItems[item.id]?.damageDescription || null,
      }))

      await processReturn.mutateAsync({
        rentalId: rental.id,
        items,
      })

      setReturnMode(false)
      setReturnItems({})
    } catch (err) {
      console.error('Failed to process return:', err)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error State
  if (error || !rental) {
    return (
      <div className="p-8">
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-8 flex items-center gap-4 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">Failed to load rental</p>
              <p className="text-sm opacity-80">{error?.message || 'Rental not found'}</p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/subrentals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rentals
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const status = rental.status || 'draft'
  const daysLeft = calculateDaysLeft(rental.end_date)

  // Calculate profit margin
  const totalPurchaseCost = rental.rental_items.reduce(
    (sum, item) => sum + ((item.purchase_price || 0) * item.quantity),
    0
  )
  const profit = (rental.final_total || 0) - totalPurchaseCost
  const profitMargin = totalPurchaseCost > 0
    ? ((profit / totalPurchaseCost) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/subrentals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-mono">{rental.rental_number}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{rental.project_name}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border ${
            statusConfig[status as keyof typeof statusConfig].color
          }`}>
            <CheckCircle className="h-4 w-4" />
            {t(`rentals.status.${status}`)}
          </span>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            {t('subrentalDetail.exportPdf')}
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Edit className="h-5 w-5" />
            {t('subrentalDetail.edit')}
          </Button>
          {status === 'active' && (
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setReturnMode(!returnMode)}
            >
              <RotateCcw className="h-5 w-5" />
              {returnMode ? t('subrentalDetail.cancelReturn') : t('subrentalDetail.processReturn')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('subrentalDetail.clientInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{rental.clients.name}</p>
                {rental.clients.company && (
                  <p className="text-sm text-muted-foreground mt-1">{rental.clients.company}</p>
                )}
              </div>
              <div className="grid gap-3">
                {rental.clients.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{rental.clients.email}</span>
                  </div>
                )}
                {rental.clients.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{rental.clients.phone}</span>
                  </div>
                )}
                {rental.clients.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{rental.clients.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                {t('subrentalDetail.supplierInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('subrentalDetail.supplierName')}
                </p>
                <p className="text-lg font-semibold">{rental.supplier_name || '-'}</p>
              </div>
              {rental.supplier_contact && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('subrentalDetail.contact')}
                  </p>
                  <p className="font-mono text-sm">{rental.supplier_contact}</p>
                </div>
              )}
              {rental.supplier_notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('subrentalDetail.notes')}
                  </p>
                  <p className="text-sm">{rental.supplier_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rental Items */}
          <Card cinematic>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('subrentalDetail.rentalItems')} ({rental.rental_items.length})
                </CardTitle>
                {returnMode && (
                  <span className="text-sm text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {t('subrentalDetail.returnModeActive')}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-medium">{t('subrentalDetail.table.item')}</th>
                      <th className="p-4 font-medium">{t('subrentalDetail.table.serial')}</th>
                      <th className="p-4 font-medium">{t('subrentalDetail.table.qty')}</th>
                      <th className="p-4 font-medium">{t('subrentalDetail.table.dailyRate')}</th>
                      <th className="p-4 font-medium">{t('subrentalDetail.table.days')}</th>
                      <th className="p-4 font-medium">{t('subrentalDetail.table.purchasePrice')}</th>
                      <th className="p-4 font-medium">{t('subrentalDetail.table.subtotal')}</th>
                      {returnMode && <th className="p-4 font-medium">{t('subrentalDetail.table.condition')}</th>}
                      {returnMode && <th className="p-4 font-medium">{t('subrentalDetail.table.return')}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rental.rental_items.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{item.products.name}</div>
                          <div className="text-xs text-muted-foreground">{item.products.category_id}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.products.serial_number}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono">{item.quantity}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm">€{item.daily_rate}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono">{item.days}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm">€{item.purchase_price?.toFixed(2) || '-'}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-semibold text-primary">
                            €{item.subtotal}
                          </span>
                        </td>
                        {returnMode && (
                          <td className="p-4">
                            <div className="space-y-2">
                              <select
                                className="bg-input border border-border rounded px-2 py-1 text-sm w-full"
                                value={returnItems[item.id]?.condition || 'good'}
                                onChange={(e) => handleReturnChange(item.id, 'condition', e.target.value)}
                              >
                                <option value="excellent">{t('subrentalDetail.conditions.excellent')}</option>
                                <option value="good">{t('subrentalDetail.conditions.good')}</option>
                                <option value="fair">{t('subrentalDetail.conditions.fair')}</option>
                                <option value="damaged">{t('subrentalDetail.conditions.damaged')}</option>
                              </select>
                              {(returnItems[item.id]?.condition === 'damaged') && (
                                <textarea
                                  className="bg-input border border-border rounded px-2 py-1 text-sm w-full"
                                  placeholder={t('subrentalDetail.damageDescription')}
                                  maxLength={200}
                                  rows={2}
                                  value={returnItems[item.id]?.damageDescription || ''}
                                  onChange={(e) => handleReturnChange(item.id, 'damageDescription', e.target.value)}
                                />
                              )}
                            </div>
                          </td>
                        )}
                        {returnMode && (
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                              checked={returnItems[item.id]?.returned || false}
                              onChange={(e) => handleReturnChange(item.id, 'returned', e.target.checked)}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {returnMode && (
            <Card cinematic className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('subrentalDetail.returnReady')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('subrentalDetail.returnCheck')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setReturnMode(false)} disabled={processReturn.isPending}>
                      {t('subrentalDetail.cancel')}
                    </Button>
                    <Button className="gap-2" onClick={handleCompleteReturn} disabled={processReturn.isPending}>
                      {processReturn.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          {t('subrentalDetail.completeReturn')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rental Period */}
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('subrentalDetail.rentalPeriod')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('subrentalDetail.startDate')}</p>
                <p className="font-mono text-lg font-semibold mt-1">{new Date(rental.start_date).toLocaleDateString('en-GB')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('subrentalDetail.endDate')}</p>
                <p className="font-mono text-lg font-semibold mt-1">{new Date(rental.end_date).toLocaleDateString('en-GB')}</p>
              </div>
              {status === 'active' && daysLeft > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">{t('subrentalDetail.timeRemaining')}</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {daysLeft} {t('subrentalDetail.days')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card cinematic className="amber-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {t('subrentalDetail.financialSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rental.final_total && (
                <>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="font-semibold">{t('newRental.financial.total')}</span>
                    <span className="text-2xl font-bold font-mono text-primary">
                      {rental.final_currency || '€'}{rental.final_total.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subrentalDetail.financial.purchaseCost')}</span>
                      <span className="font-mono">€{totalPurchaseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subrentalDetail.financial.profit')}</span>
                      <span className={`font-mono font-semibold ${profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        €{profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subrentalDetail.financial.margin')}</span>
                      <span className={`font-mono ${parseFloat(profitMargin) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitMargin}%
                      </span>
                    </div>
                  </div>
                </>
              )}
              {rental.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">{rental.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card cinematic>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Download className="h-4 w-4" />
                {t('subrentalDetail.downloadInvoice')}
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Download className="h-4 w-4" />
                {t('subrentalDetail.downloadContract')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
                {t('subrentalDetail.cancelRental')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
