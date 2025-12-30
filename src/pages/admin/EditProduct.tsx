import { useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  DollarSign,
  Hash,
  Image as ImageIcon,
  Star
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProduct, useUpdateProduct } from '@/hooks/api/useProducts'
import { useCategories } from '@/hooks/api/useCategories'
import { productSchema, type ProductFormData } from '@/schemas/productSchema'

export function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: product, isLoading: loadingProduct } = useProduct(id)
  const updateProduct = useUpdateProduct()
  const { data: categories } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      serial_number: '',
      category_id: '',
      description: '',
      description_hu: '',
      specifications: '',
      image_url: '',
      stock_quantity: 1,
      available_quantity: 1,
      daily_rate: 0,
      weekly_rate: 0,
      is_featured: false,
      is_active: true,
    },
  })

  // Watch values for preview
  const name = watch('name')
  const serialNumber = watch('serial_number')
  const description = watch('description')
  const imageUrl = watch('image_url')
  const stockQuantity = watch('stock_quantity')
  const availableQuantity = watch('available_quantity')
  const dailyRate = watch('daily_rate')
  const isFeatured = watch('is_featured')

  // Load product data
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        serial_number: product.serial_number || '',
        category_id: product.category_id,
        description: product.description || '',
        description_hu: '',
        specifications: typeof product.specifications === 'string' ? product.specifications : '',
        image_url: product.image_url || '',
        stock_quantity: product.stock_quantity || 1,
        available_quantity: product.available_quantity || 1,
        daily_rate: product.daily_rate || 0,
        weekly_rate: product.weekly_rate || 0,
        is_featured: product.is_featured || false,
        is_active: product.is_active ?? true,
      })
    }
  }, [product, reset])

  const onSubmit = async (data: ProductFormData) => {
    if (!id) {
      setFormError('root', { message: 'Product ID is missing' })
      return
    }

    try {
      await updateProduct.mutateAsync({
        id,
        updates: {
          name: data.name.trim(),
          serial_number: data.serial_number.trim().toUpperCase(),
          category_id: data.category_id,
          description: data.description?.trim() || null,
          specifications: data.specifications?.trim() ? JSON.parse(`{"text": "${data.specifications.trim()}"}`) : null,
          image_url: data.image_url?.trim() || null,
          stock_quantity: data.stock_quantity,
          available_quantity: data.available_quantity,
          daily_rate: data.daily_rate,
          weekly_rate: data.weekly_rate && data.weekly_rate > 0 ? data.weekly_rate : null,
          is_featured: data.is_featured || false,
          is_active: data.is_active ?? true,
        }
      })

      navigate('/admin/products')
    } catch (err) {
      console.error('Failed to update product:', err)
      setFormError('root', {
        message: err instanceof Error ? err.message : t('products.edit.updateError'),
      })
    }
  }

  // Calculate suggested weekly rate if not set
  const suggestedWeeklyRate = dailyRate * 6 // 1 day free

  // Show loading state
  if (loadingProduct) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show error if product not found
  if (!product) {
    return (
      <div className="p-8">
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-8 text-destructive">
            {t('products.edit.notFound')}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('products.edit.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('products.edit.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('products.form.basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.name')} *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder={t('products.form.namePlaceholder')}
                    className={`mt-2 h-11 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.name.message as string)}
                    </p>
                  )}
                </div>

                {/* SKU & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('products.form.sku')} *
                    </label>
                    <Input
                      {...register('serial_number')}
                      onChange={(e) => setValue('serial_number', e.target.value.toUpperCase())}
                      placeholder="CAM-001"
                      className={`mt-2 h-11 font-mono ${errors.serial_number ? 'border-red-500' : ''}`}
                    />
                    {errors.serial_number && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.serial_number.message as string)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('products.form.category')} *
                    </label>
                    <select
                      {...register('category_id')}
                      className={`mt-2 w-full h-11 px-3 rounded-md border bg-background text-foreground text-sm ${
                        errors.category_id ? 'border-red-500' : 'border-border'
                      }`}
                    >
                      <option value="">{t('products.form.selectCategory')}</option>
                      {categories?.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.category_id.message as string)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.description')}
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder={t('products.form.descriptionPlaceholder')}
                    rows={3}
                    className={`mt-2 w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm resize-none ${
                      errors.description ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.description.message as string)}
                    </p>
                  )}
                </div>

                {/* Specifications */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.specifications')}
                  </label>
                  <textarea
                    {...register('specifications')}
                    placeholder={t('products.form.specificationsPlaceholder')}
                    rows={3}
                    className={`mt-2 w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm resize-none font-mono ${
                      errors.specifications ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.specifications && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.specifications.message as string)}
                    </p>
                  )}
                  {!errors.specifications && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('products.form.specificationsHint')}
                    </p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.imageUrl')}
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="url"
                      {...register('image_url')}
                      placeholder="https://example.com/image.jpg"
                      className={`h-9 font-mono text-sm ${errors.image_url ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.image_url && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.image_url.message as string)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  {t('products.form.inventory')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Stock Quantity */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('products.form.totalQuantity')} *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      {...register('stock_quantity', {
                        valueAsNumber: true,
                        onChange: (e) => {
                          const val = parseInt(e.target.value) || 1
                          const currentAvailable = watch('available_quantity')
                          if (currentAvailable > val) {
                            setValue('available_quantity', val)
                          }
                        },
                      })}
                      className={`mt-2 h-11 font-mono ${errors.stock_quantity ? 'border-red-500' : ''}`}
                    />
                    {errors.stock_quantity && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.stock_quantity.message as string)}
                      </p>
                    )}
                  </div>

                  {/* Available Quantity */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('products.form.availableQuantity')} *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={stockQuantity}
                      {...register('available_quantity', { valueAsNumber: true })}
                      className={`mt-2 h-11 font-mono ${errors.available_quantity ? 'border-red-500' : ''}`}
                    />
                    {errors.available_quantity && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.available_quantity.message as string)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {t('products.form.pricing')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Daily Rate */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.dailyRate')} *
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground">€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('daily_rate', { valueAsNumber: true })}
                      className={`h-11 font-mono ${errors.daily_rate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.daily_rate && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.daily_rate.message as string)}
                    </p>
                  )}
                </div>

                {/* Weekly Rate */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.weeklyRate')}
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground">€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('weekly_rate', { valueAsNumber: true })}
                      placeholder={suggestedWeeklyRate.toFixed(2)}
                      className={`h-11 font-mono ${errors.weekly_rate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.weekly_rate && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.weekly_rate.message as string)}
                    </p>
                  )}
                  {!errors.weekly_rate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('products.form.weeklyRateHint', { amount: suggestedWeeklyRate.toFixed(2) })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Preview & Submit */}
          <div className="space-y-6">
            {/* Preview */}
            <Card cinematic className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('products.form.preview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Card */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={name || 'Product preview'}
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x300/333/999?text=No+Image'
                      }}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {name || t('products.form.namePlaceholder')}
                      </p>
                      {isFeatured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {serialNumber || 'SKU-000'}
                    </p>
                  </div>

                  {description && (
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                    <div>
                      <p className="text-muted-foreground">{t('products.stock')}</p>
                      <p className="font-mono font-semibold">{availableQuantity} / {stockQuantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('products.dailyRate')}</p>
                      <p className="font-mono font-semibold">€{dailyRate.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <input
                    type="checkbox"
                    id="featured"
                    {...register('is_featured')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="featured" className="text-sm cursor-pointer flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {t('products.form.featured')}
                  </label>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <input
                    type="checkbox"
                    id="active"
                    {...register('is_active')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="active" className="text-sm cursor-pointer flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {t('products.form.active')}
                  </label>
                </div>

                {/* Error */}
                {errors.root && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {errors.root.message}
                  </div>
                )}

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
                      {t('products.edit.updating')}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t('products.edit.submit')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
