import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Calendar,
  User,
  Package,
  DollarSign,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/hooks/api/useClients'
import { useAvailableProducts } from '@/hooks/api/useProducts'
import { useCreateRental } from '@/hooks/api/useRentals'
import { rentalSchema, type RentalFormData } from '@/schemas/rentalSchema'

export function NewRental() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()

  // Fetch data
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: products, isLoading: productsLoading } = useAvailableProducts()
  const createRental = useCreateRental()

  // Form state with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      client_id: '',
      project_name: '',
      start_date: '',
      end_date: '',
      notes: '',
      items: [],
    },
  })

  // Dynamic items array
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  // UI state (not in schema)
  const [productSearch, setProductSearch] = useState('')
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Watch form values
  const clientId = watch('client_id')
  const startDate = watch('start_date')
  const endDate = watch('end_date')
  const watchedItems = watch('items')

  const selectedClient = clients?.find(c => c.id === clientId)

  const filteredProducts = (products || []).filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  // Calculate rental days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const days = calculateDays()

  // Update all items' days when date changes
  useEffect(() => {
    if (days > 0 && watchedItems.length > 0) {
      watchedItems.forEach((item, index) => {
        const newSubtotal = item.quantity * item.daily_rate * days
        setValue(`items.${index}.days`, days)
        setValue(`items.${index}.subtotal`, newSubtotal)
      })
    }
  }, [days, watchedItems.length])

  // Add item to rental
  const addItem = (product: NonNullable<typeof products>[0]) => {
    const existingIndex = fields.findIndex(f => f.product_id === product.id)

    if (existingIndex >= 0) {
      // Update existing item quantity
      const currentItem = watchedItems[existingIndex]
      const newQuantity = currentItem.quantity + 1
      const newSubtotal = newQuantity * product.daily_rate * days

      setValue(`items.${existingIndex}.quantity`, newQuantity)
      setValue(`items.${existingIndex}.subtotal`, newSubtotal)
    } else {
      // Add new item
      append({
        product_id: product.id,
        quantity: 1,
        daily_rate: product.daily_rate,
        days,
        subtotal: product.daily_rate * days,
      })
    }

    setProductSearch('')
    setShowProductPicker(false)
  }

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    const item = watchedItems[index]
    const newSubtotal = quantity * item.daily_rate * days

    setValue(`items.${index}.quantity`, quantity)
    setValue(`items.${index}.subtotal`, newSubtotal)
  }

  // Calculate financial totals
  const subtotal = watchedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const discountAmount = subtotal * (discount / 100)
  const taxRate = 0.27 // 27% Hungarian VAT
  const tax = (subtotal - discountAmount) * taxRate
  const total = subtotal - discountAmount + tax

  // Form submit handler
  const onSubmit = async (data: RentalFormData) => {
    setError(null)

    if (!user) {
      setError('You must be logged in to create a rental')
      return
    }

    try {
      await createRental.mutateAsync({
        rental: {
          client_id: data.client_id,
          project_name: data.project_name,
          start_date: data.start_date,
          end_date: data.end_date,
          notes: data.notes || null,
          final_currency: 'EUR',
          final_total: total,
          status: 'active',
          created_by: user.id,
        },
        items: data.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          daily_rate: item.daily_rate,
          days: item.days,
          subtotal: item.subtotal,
        })),
      })

      navigate('/rentals')
    } catch (err) {
      console.error('Failed to create rental:', err)
      setError(err instanceof Error ? err.message : 'Failed to create rental')
    }
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/rentals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('newRental.title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('newRental.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to create rental</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Project Info */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('newRental.sections.clientProject')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Selection */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('newRental.fields.client')} *
                  </label>
                  <select
                    {...register('client_id')}
                    className={`mt-2 w-full h-11 px-4 rounded-md border bg-background text-foreground font-medium ${
                      errors.client_id ? 'border-red-500' : 'border-border'
                    }`}
                    disabled={clientsLoading}
                  >
                    <option value="">{clientsLoading ? 'Loading clients...' : t('newRental.fields.clientPlaceholder')}</option>
                    {clients?.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.client_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.client_id.message as string)}
                    </p>
                  )}
                  {selectedClient && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedClient.email || ''}
                    </p>
                  )}
                </div>

                {/* Project Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('newRental.fields.project')} *
                  </label>
                  <Input
                    {...register('project_name')}
                    placeholder={t('newRental.fields.projectPlaceholder')}
                    className={`mt-2 h-11 ${errors.project_name ? 'border-red-500' : ''}`}
                  />
                  {errors.project_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.project_name.message as string)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rental Period */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t('newRental.sections.rentalPeriod')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('newRental.fields.startDate')} *
                    </label>
                    <Input
                      type="date"
                      {...register('start_date')}
                      className={`mt-2 h-11 font-mono ${errors.start_date ? 'border-red-500' : ''}`}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.start_date.message as string)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('newRental.fields.endDate')} *
                    </label>
                    <Input
                      type="date"
                      {...register('end_date')}
                      className={`mt-2 h-11 font-mono ${errors.end_date ? 'border-red-500' : ''}`}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.end_date.message as string)}
                      </p>
                    )}
                  </div>
                </div>
                {days > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">{t('newRental.fields.duration')}</p>
                    <p className="text-2xl font-bold font-mono text-primary mt-1">
                      {days} {days !== 1 ? t('newRental.fields.days') : t('newRental.fields.day')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipment Items */}
            <Card cinematic>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {t('newRental.sections.equipment')} ({fields.length} {t('newRental.equipment.items')})
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowProductPicker(!showProductPicker)}
                  >
                    <Plus className="h-4 w-4" />
                    {t('newRental.equipment.addItem')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.items && (
                  <p className="text-sm text-red-500">
                    {t(errors.items.message as string)}
                  </p>
                )}
                {/* Product Picker */}
                {showProductPicker && (
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder={t('newRental.equipment.searchPlaceholder')}
                        className="pl-10 h-11"
                      />
                    </div>
                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                      {productsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No products found</p>
                        </div>
                      ) : (
                        filteredProducts.map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addItem(product)}
                            className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-secondary/50 transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.available_quantity} {t('newRental.equipment.inStock')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-semibold text-primary">
                                €{product.daily_rate}/{t('newRental.fields.day')}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                {fields.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="p-3 font-medium">{t('newRental.equipment.table.item')}</th>
                          <th className="p-3 font-medium">{t('newRental.equipment.table.qty')}</th>
                          <th className="p-3 font-medium">{t('newRental.equipment.table.dailyRate')}</th>
                          <th className="p-3 font-medium">{t('newRental.equipment.table.days')}</th>
                          <th className="p-3 font-medium">{t('newRental.equipment.table.subtotal')}</th>
                          <th className="p-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {fields.map((field, index) => {
                          const product = products?.find(p => p.id === field.product_id)
                          const item = watchedItems[index]

                          return (
                            <tr key={field.id} className="hover:bg-secondary/50 transition-colors">
                              <td className="p-3">
                                <span className="font-medium">{product?.name || 'Unknown'}</span>
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  min="1"
                                  {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                  onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                  className="w-20 h-9 font-mono"
                                />
                              </td>
                              <td className="p-3">
                                <span className="font-mono text-sm">€{item?.daily_rate || 0}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-mono">{item?.days || 0}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-mono font-semibold text-primary">
                                  €{item?.subtotal || 0}
                                </span>
                              </td>
                              <td className="p-3">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{t('newRental.equipment.empty.title')}</p>
                    <p className="text-xs mt-1">{t('newRental.equipment.empty.subtitle')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Financial Summary */}
          <div className="space-y-6">
            <Card cinematic className="amber-glow sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {t('newRental.sections.financial')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('newRental.financial.subtotal')}</span>
                    <span className="font-mono">€{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Discount Input */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t('newRental.financial.discount')} %
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="mt-1 h-9 font-mono"
                    />
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('newRental.financial.discount')} ({discount}%)</span>
                      <span className="font-mono text-primary">-€{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('newRental.financial.tax')} (27%)</span>
                    <span className="font-mono">€{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="font-semibold">{t('newRental.financial.total')}</span>
                  <span className="text-2xl font-bold font-mono text-primary">
                    €{total.toFixed(2)}
                  </span>
                </div>

                {/* Notes */}
                <div className="pt-3 border-t border-border">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('newRental.financial.notes')}
                  </label>
                  <textarea
                    {...register('notes')}
                    placeholder={t('newRental.financial.notesPlaceholder')}
                    rows={3}
                    className={`mt-1 w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm resize-none ${
                      errors.notes ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.notes.message as string)}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t('newRental.financial.submit')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
