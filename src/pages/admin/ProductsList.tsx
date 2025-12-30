import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  Eye,
  EyeOff,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAllProducts, useDeleteProduct } from '@/hooks/api/useProducts'
import { useCategories } from '@/hooks/api/useCategories'

export function ProductsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const { t } = useTranslation()

  const { data: products, isLoading } = useAllProducts()
  const { data: categories } = useCategories()
  const deleteProduct = useDeleteProduct()

  // Filter products by search query and category
  const filteredProducts = (products || []).filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        (product.serial_number && product.serial_number.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category?.name && product.category.name.toLowerCase().includes(query))

      if (!matchesSearch) return false
    }

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      if (product.category_id !== categoryFilter) return false
    }

    return true
  })

  const handleDelete = async (id: string, name: string) => {
    if (confirm(t('products.deleteConfirm', { name }))) {
      try {
        await deleteProduct.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete product:', err)
      }
    }
  }

  // Calculate stats
  const stats = {
    total: products?.length || 0,
    active: products?.filter(p => p.is_active).length || 0,
    lowStock: products?.filter(p => p.is_active && p.available_quantity <= 2).length || 0,
    totalValue: products?.reduce((sum, p) => sum + (p.is_active ? (p.daily_rate || 0) * (p.stock_quantity || 0) : 0), 0) || 0
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('products.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('products.subtitle')}
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/admin/products/new">
            <Plus className="h-5 w-5" />
            {t('products.newProduct')}
          </Link>
        </Button>
      </div>

      {/* Search & Filter */}
      <Card cinematic>
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('products.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
            >
              {t('products.filters.all')}
            </Button>
            {categories?.map(category => (
              <Button
                key={category.id}
                variant={categoryFilter === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category.id)}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('products.stats.total')}
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {stats.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('products.stats.active')}
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {stats.active}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('products.stats.lowStock')}
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {stats.lowStock}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('products.stats.totalValue')}
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  €{stats.totalValue.toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">
              {t('products.noResults.title')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('products.noResults.subtitle')}
            </p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              cinematic
              className={`hover:border-primary/50 transition-all cursor-pointer ${
                !product.is_active ? 'opacity-60' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {product.serial_number}
                      </span>
                      {product.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {product.category.icon} {product.category.name}
                        </span>
                      )}
                    </div>
                    {!product.is_active && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <EyeOff className="h-3 w-3" />
                        {t('products.inactive')}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Stock & Pricing */}
                <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {t('products.stock')}
                    </p>
                    <p className={`font-mono font-semibold ${
                      product.available_quantity <= 2
                        ? 'text-amber-500'
                        : 'text-foreground'
                    }`}>
                      {product.available_quantity} / {product.stock_quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {t('products.dailyRate')}
                    </p>
                    <p className="font-mono font-semibold">
                      €{product.daily_rate?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <Link to={`/admin/products/${product.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      {t('common.edit')}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deleteProduct.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
