import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { useCreateProduct } from '@/hooks/api/useProducts'
import { useCategories } from '@/hooks/api/useCategories'

export function NewProduct() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createProduct = useCreateProduct()
  const { data: categories } = useCategories()

  const [name, setName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [stockQuantity, setStockQuantity] = useState(1)
  const [availableQuantity, setAvailableQuantity] = useState(1)
  const [dailyRate, setDailyRate] = useState(0)
  const [weeklyRate, setWeeklyRate] = useState(0)
  const [isFeatured, setIsFeatured] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('products.form.nameRequired'))
      return
    }

    if (!serialNumber.trim()) {
      setError(t('products.form.skuRequired'))
      return
    }

    if (!categoryId) {
      setError(t('products.form.categoryRequired'))
      return
    }

    if (dailyRate <= 0) {
      setError(t('products.form.dailyRateRequired'))
      return
    }

    try {
      await createProduct.mutateAsync({
        name: name.trim(),
        serial_number: serialNumber.trim().toUpperCase(),
        category_id: categoryId,
        description: description.trim() || null,
        specifications: specifications.trim() ? JSON.parse(`{"text": "${specifications.trim()}"}`) : null,
        image_url: imageUrl.trim() || null,
        stock_quantity: stockQuantity,
        available_quantity: availableQuantity,
        daily_rate: dailyRate,
        weekly_rate: weeklyRate > 0 ? weeklyRate : null,
        is_featured: isFeatured,
        is_active: true,
        condition: 'excellent',
        created_by: 'current-user-id',
        currency: 'EUR',
      })

      navigate('/admin/products')
    } catch (err) {
      console.error('Failed to create product:', err)
      setError(err instanceof Error ? err.message : t('products.form.createError'))
    }
  }

  // Calculate suggested weekly rate if not set
  const suggestedWeeklyRate = dailyRate * 6 // 1 day free

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
          <h1 className="text-4xl font-bold tracking-tight">{t('products.form.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('products.form.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('products.form.namePlaceholder')}
                    className="mt-2 h-11"
                  />
                </div>

                {/* Serial Number & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('products.form.sku')} *
                    </label>
                    <Input
                      required
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                      placeholder="CAM-001"
                      className="mt-2 h-11 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('products.form.category')} *
                    </label>
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="mt-2 w-full h-11 px-3 rounded-md border border-border bg-background text-foreground text-sm"
                    >
                      <option value="">{t('products.form.selectCategory')}</option>
                      {categories?.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('products.form.descriptionPlaceholder')}
                    rows={3}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none"
                  />
                </div>

                {/* Specifications */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('products.form.specifications')}
                  </label>
                  <textarea
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    placeholder={t('products.form.specificationsPlaceholder')}
                    rows={3}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('products.form.specificationsHint')}
                  </p>
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
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="h-9 font-mono text-sm"
                    />
                  </div>
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
                      required
                      value={stockQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setStockQuantity(val)
                        // Auto-adjust available if needed
                        if (availableQuantity > val) {
                          setAvailableQuantity(val)
                        }
                      }}
                      className="mt-2 h-11 font-mono"
                    />
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
                      required
                      value={availableQuantity}
                      onChange={(e) => setAvailableQuantity(parseInt(e.target.value) || 0)}
                      className="mt-2 h-11 font-mono"
                    />
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
                      required
                      value={dailyRate}
                      onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                      className="h-11 font-mono"
                    />
                  </div>
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
                      value={weeklyRate}
                      onChange={(e) => setWeeklyRate(parseFloat(e.target.value) || 0)}
                      placeholder={suggestedWeeklyRate.toFixed(2)}
                      className="h-11 font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('products.form.weeklyRateHint', { amount: suggestedWeeklyRate.toFixed(2) })}
                  </p>
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
                      {serialNumber || 'SN-000'}
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
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="featured" className="text-sm cursor-pointer flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {t('products.form.featured')}
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={createProduct.isPending}
                >
                  {createProduct.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('products.form.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t('products.form.submit')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                  disabled={createProduct.isPending}
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
