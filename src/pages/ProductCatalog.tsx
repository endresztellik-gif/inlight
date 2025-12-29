import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Camera,
  Lightbulb,
  Film,
  Mic,
  Grid3x3,
  DollarSign,
  Package,
  Info,
  Loader2,
  AlertCircle,
  Focus,
  Move
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '@/hooks/api/useCategories'
import { useProducts } from '@/hooks/api/useProducts'

// Icon mapping for categories
const categoryIcons: Record<string, typeof Camera> = {
  camera: Camera,
  focus: Focus,
  lightbulb: Lightbulb,
  mic: Mic,
  move: Move,
  film: Film,
  package: Package,
}

export function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { t, i18n } = useTranslation()

  // Fetch data from Supabase
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts({
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    searchQuery: searchQuery || undefined,
    isActive: true,
  })

  // Calculate category counts
  const categoriesWithCounts = useMemo(() => {
    if (!categories || !products) return []

    const allCategory = {
      id: 'all',
      name: 'All',
      name_en: 'All',
      name_hu: 'Összes',
      icon: 'grid3x3',
      count: products.length,
    }

    const categoriesData = categories.map(cat => ({
      ...cat,
      count: products.filter(p => p.category_id === cat.id).length,
    }))

    return [allCategory, ...categoriesData]
  }, [categories, products])

  const isLoading = categoriesLoading || productsLoading
  const hasError = categoriesError || productsError

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4 animate-in fade-in slide-in-from-bottom duration-700">
            <h1 className="text-5xl font-bold tracking-tight">
              {t('catalog.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('catalog.subtitle')}
            </p>
            <div className="pt-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t('catalog.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <Card cinematic className="border-destructive/50">
            <CardContent className="p-8 flex items-center gap-4 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <div>
                <p className="font-medium">Failed to load catalog</p>
                <p className="text-sm opacity-80">{categoriesError?.message || productsError?.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        {!isLoading && !hasError && (
          <>
            <div className="flex gap-3 overflow-x-auto pb-6 mb-8 border-b border-border">
              {categoriesWithCounts.map((category, index) => {
                const IconComponent = categoryIcons[category.icon || 'package'] || Grid3x3
                const categoryName = i18n.language === 'hu' ? category.name_hu : category.name_en

                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    className="gap-2 whitespace-nowrap animate-in slide-in-from-bottom duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <IconComponent className="h-4 w-4" />
                    {categoryName || category.name}
                    <span className="font-mono text-xs opacity-70">({category.count})</span>
                  </Button>
                )
              })}
            </div>
          </>
        )}

        {/* Products Grid */}
        {!isLoading && !hasError && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products?.map((product, index) => {
                const productName = i18n.language === 'hu' ? product.name_hu : product.name_en
                const productDesc = i18n.language === 'hu'
                  ? product.description_hu || product.description
                  : product.description

                return (
                  <Card
                    key={product.id}
                    cinematic
                    className="group hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer animate-in slide-in-from-bottom duration-300"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    {/* Product Image Placeholder */}
                    <div className="aspect-video bg-secondary/50 flex items-center justify-center border-b border-border group-hover:bg-secondary/70 transition-colors">
                      <Package className="h-16 w-16 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />
                    </div>

                    <CardHeader>
                      <div className="space-y-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {productName || product.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {productDesc}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Specs from JSONB */}
                      {product.specifications && (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(product.specifications as Record<string, string>).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-block px-2 py-0.5 text-xs rounded bg-primary/10 text-primary/80 border border-primary/20"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {t('catalog.pricing.daily')}
                          </p>
                          <p className="font-mono font-bold text-lg text-primary">
                            {product.currency === 'EUR' ? '€' : product.currency}{product.daily_rate}
                          </p>
                        </div>
                        {product.weekly_rate && (
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {t('catalog.pricing.weekly')}
                            </p>
                            <p className="font-mono font-bold text-lg text-primary">
                              {product.currency === 'EUR' ? '€' : product.currency}{product.weekly_rate}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between pt-2 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{product.available_quantity} {t('catalog.inStock')}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="gap-1.5">
                          <Info className="h-3 w-3" />
                          {t('catalog.details')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {products?.length === 0 && (
              <Card cinematic>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground">{t('catalog.noResults.title')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('catalog.noResults.subtitle')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* CTA Section */}
        <Card cinematic className="mt-12 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">{t('catalog.cta.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('catalog.cta.subtitle')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Film className="h-5 w-5" />
                {t('catalog.cta.requestQuote')}
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Info className="h-5 w-5" />
                {t('catalog.cta.contactUs')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
