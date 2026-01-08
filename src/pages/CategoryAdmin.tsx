import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  Package,
  Camera,
  Lightbulb,
  Film,
  Mic,
  Grid3x3,
  Focus,
  Move,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryStats,
} from '@/hooks/api/useCategories'

// Icon mapping
const iconOptions = [
  { value: 'camera', label: 'Camera', Icon: Camera },
  { value: 'focus', label: 'Focus/Lens', Icon: Focus },
  { value: 'lightbulb', label: 'Lighting', Icon: Lightbulb },
  { value: 'mic', label: 'Audio', Icon: Mic },
  { value: 'move', label: 'Grip/Support', Icon: Move },
  { value: 'film', label: 'Media', Icon: Film },
  { value: 'package', label: 'Other', Icon: Package },
  { value: 'grid3x3', label: 'Grid', Icon: Grid3x3 },
]

interface CategoryFormData {
  name: string
  name_en: string
  name_hu: string
  description?: string
  icon: string
  display_order: number
  is_active: boolean
}

export function CategoryAdmin() {
  const { t } = useTranslation()
  const { data: categories, isLoading } = useAllCategories()
  const { data: stats } = useCategoryStats()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    name_en: '',
    name_hu: '',
    description: '',
    icon: 'package',
    display_order: 0,
    is_active: true,
  })
  const [error, setError] = useState<string | null>(null)

  // Open form for creating new category
  const handleCreate = () => {
    setEditingId(null)
    setFormData({
      name: '',
      name_en: '',
      name_hu: '',
      description: '',
      icon: 'package',
      display_order: (categories?.length || 0) + 1,
      is_active: true,
    })
    setShowForm(true)
    setError(null)
  }

  // Open form for editing existing category
  const handleEdit = (category: any) => {
    setEditingId(category.id)
    setFormData({
      name: category.name || '',
      name_en: category.name_en || '',
      name_hu: category.name_hu || '',
      description: category.description || '',
      icon: category.icon || 'package',
      display_order: category.display_order || 0,
      is_active: category.is_active ?? true,
    })
    setShowForm(true)
    setError(null)
  }

  // Cancel form
  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name_en.trim() || !formData.name_hu.trim()) {
      setError(t('admin.category.errorNameRequired'))
      return
    }

    try {
      if (editingId) {
        // Update existing category
        await updateCategory.mutateAsync({
          id: editingId,
          updates: {
            name: formData.name_en, // Default to English
            name_en: formData.name_en,
            name_hu: formData.name_hu,
            description: formData.description || null,
            icon: formData.icon,
            display_order: formData.display_order,
            is_active: formData.is_active,
          },
        })
      } else {
        // Create new category
        await createCategory.mutateAsync({
          name: formData.name_en, // Default to English
          name_en: formData.name_en,
          name_hu: formData.name_hu,
          description: formData.description || null,
          icon: formData.icon,
          display_order: formData.display_order,
          is_active: formData.is_active,
        })
      }

      handleCancel()
    } catch (err) {
      console.error('Failed to save category:', err)
      setError(err instanceof Error ? err.message : t('admin.category.errorSave'))
    }
  }

  // Delete category
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('admin.category.confirmDelete', { name }))) {
      return
    }

    try {
      await deleteCategory.mutateAsync(id)
    } catch (err) {
      console.error('Failed to delete category:', err)
      alert(t('admin.category.errorDelete'))
    }
  }

  // Move category up/down in display order
  const handleMoveOrder = async (id: string, currentOrder: number, direction: 'up' | 'down') => {
    if (!categories) return

    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
    if (newOrder < 1) return

    try {
      await updateCategory.mutateAsync({
        id,
        updates: { display_order: newOrder },
      })
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('admin.category.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('admin.category.subtitle')}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('admin.category.newCategory')}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card cinematic>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.category.totalCategories')}</p>
                <p className="text-2xl font-bold">{categories?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card cinematic>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Package className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.category.activeCategories')}</p>
                <p className="text-2xl font-bold">
                  {categories?.filter(c => c.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card cinematic>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Grid3x3 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.category.totalProducts')}</p>
                <p className="text-2xl font-bold">
                  {stats?.reduce((sum, s) => sum + s.productCount, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card cinematic className="border-primary/50">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center justify-between">
              <span>
                {editingId
                  ? t('admin.category.editCategory')
                  : t('admin.category.createCategory')}
              </span>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Names (EN/HU) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en" className="text-sm font-medium">
                    {t('admin.category.nameEn')} *
                  </Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g., Cameras"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="name_hu" className="text-sm font-medium">
                    {t('admin.category.nameHu')} *
                  </Label>
                  <Input
                    id="name_hu"
                    value={formData.name_hu}
                    onChange={(e) => setFormData({ ...formData, name_hu: e.target.value })}
                    placeholder="pl. Kamerák"
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  {t('admin.category.description')}
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('admin.category.descriptionPlaceholder')}
                  rows={3}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  {t('admin.category.icon')}
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((option) => {
                    const Icon = option.Icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: option.value })}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.icon === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Display Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order" className="text-sm font-medium">
                    {t('admin.category.displayOrder')}
                  </Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                    }
                    className="mt-2"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm">{t('admin.category.isActive')}</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="gap-2"
                >
                  {(createCategory.isPending || updateCategory.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4" />
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card cinematic>
        <CardHeader>
          <CardTitle>{t('admin.category.categoriesList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('admin.category.noCategories')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((category) => {
                  const Icon = iconOptions.find(i => i.value === category.icon)?.Icon || Package
                  const productCount = stats?.find(s => s.id === category.id)?.productCount || 0

                  return (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg border transition-all ${
                        category.is_active
                          ? 'bg-background border-border'
                          : 'bg-muted/50 border-muted opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{category.name_en}</h3>
                              <span className="text-sm text-muted-foreground">
                                / {category.name_hu}
                              </span>
                              {!category.is_active && (
                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                  {t('admin.category.inactive')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>
                                {t('admin.category.order')}: {category.display_order}
                              </span>
                              <span>
                                {productCount} {t('admin.category.products')}
                              </span>
                              {category.description && (
                                <span className="text-xs">{category.description}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOrder(category.id, category.display_order || 0, 'up')}
                            disabled={category.display_order === 1}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOrder(category.id, category.display_order || 0, 'down')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id, category.name_en || '')}
                            disabled={productCount > 0}
                            title={
                              productCount > 0
                                ? t('admin.category.cannotDeleteWithProducts')
                                : undefined
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
