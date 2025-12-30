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
  Folder,
  Package,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAllCategories, useDeleteCategory, useCategoryStats } from '@/hooks/api/useCategories'

export function CategoriesList() {
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()

  const { data: categories, isLoading } = useAllCategories()
  const { data: stats } = useCategoryStats()
  const deleteCategory = useDeleteCategory()

  // Filter categories by search query
  const filteredCategories = (categories || []).filter(category => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      category.name.toLowerCase().includes(query) ||
      (category.name_en && category.name_en.toLowerCase().includes(query)) ||
      (category.name_hu && category.name_hu.toLowerCase().includes(query)) ||
      (category.description && category.description.toLowerCase().includes(query))
    )
  })

  const handleDelete = async (id: string, name: string) => {
    if (confirm(t('categories.deleteConfirm', { name }))) {
      try {
        await deleteCategory.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete category:', err)
      }
    }
  }

  // Get product count for a category
  const getProductCount = (categoryId: string) => {
    const stat = stats?.find(s => s.id === categoryId)
    return stat?.productCount || 0
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('categories.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('categories.subtitle')}
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/admin/categories/new">
            <Plus className="h-5 w-5" />
            {t('categories.newCategory')}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card cinematic>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('categories.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('categories.stats.total')}
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {categories?.length || 0}
                </p>
              </div>
              <Folder className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('categories.stats.active')}
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {categories?.filter(c => c.is_active).length || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('categories.stats.totalProducts')}
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {stats?.reduce((sum, s) => sum + s.productCount, 0) || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">
              {t('categories.noResults.title')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('categories.noResults.subtitle')}
            </p>
          </div>
        ) : (
          filteredCategories.map((category, index) => (
            <Card
              key={category.id}
              cinematic
              className={`hover:border-primary/50 transition-all cursor-pointer ${
                !category.is_active ? 'opacity-60' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {category.icon ? (
                      <div className="text-3xl">{category.icon}</div>
                    ) : (
                      <Folder className="h-8 w-8 text-primary" />
                    )}
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      {!category.is_active && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <EyeOff className="h-3 w-3" />
                          {t('categories.inactive')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Multilingual names */}
                <div className="space-y-1 text-xs">
                  {category.name_en && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">🇬🇧</span>
                      <span className="font-medium">{category.name_en}</span>
                    </div>
                  )}
                  {category.name_hu && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">🇭🇺</span>
                      <span className="font-medium">{category.name_hu}</span>
                    </div>
                  )}
                </div>

                {/* Product count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                  <Package className="h-4 w-4" />
                  <span>
                    {getProductCount(category.id)} {t('categories.products')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <Link to={`/admin/categories/${category.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      {t('common.edit')}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deleteCategory.isPending}
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
