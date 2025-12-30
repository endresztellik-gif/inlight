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
  Folder,
  Globe,
  Hash
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCategory, useUpdateCategory } from '@/hooks/api/useCategories'
import { categorySchema, type CategoryFormData } from '@/schemas/categorySchema'

export function EditCategory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: category, isLoading: loadingCategory } = useCategory(id)
  const updateCategory = useUpdateCategory()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      name_en: '',
      name_hu: '',
      description: '',
      icon: '',
      display_order: 0,
    },
  })

  // Watch values for preview
  const name = watch('name')
  const nameEn = watch('name_en')
  const nameHu = watch('name_hu')
  const description = watch('description')
  const icon = watch('icon')
  const displayOrder = watch('display_order')

  // Load category data into form
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        name_en: category.name_en || '',
        name_hu: category.name_hu || '',
        description: category.description || '',
        icon: category.icon || '',
        display_order: category.display_order || 0,
      })
    }
  }, [category, reset])

  const onSubmit = async (data: CategoryFormData) => {
    if (!id) {
      setFormError('root', { message: 'Category ID is missing' })
      return
    }

    try {
      await updateCategory.mutateAsync({
        id,
        updates: {
          name: data.name.trim(),
          name_en: data.name_en?.trim() || null,
          name_hu: data.name_hu?.trim() || null,
          description: data.description?.trim() || null,
          icon: data.icon?.trim() || null,
          display_order: data.display_order,
          is_active: true,
        },
      })

      navigate('/admin/categories')
    } catch (err) {
      console.error('Failed to update category:', err)
      setFormError('root', {
        message: err instanceof Error ? err.message : t('categories.edit.updateError'),
      })
    }
  }

  // Show loading state
  if (loadingCategory) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show error if category not found
  if (!category) {
    return (
      <div className="p-8">
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-8 text-destructive">
            {t('categories.edit.notFound')}
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
          <Link to="/admin/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('categories.edit.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('categories.edit.subtitle')}
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
                  <Folder className="h-5 w-5 text-primary" />
                  {t('categories.form.basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name (Primary) */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('categories.form.name')} *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder={t('categories.form.namePlaceholder')}
                    className={`mt-2 h-11 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.name.message as string)}
                    </p>
                  )}
                  {!errors.name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('categories.form.nameHint')}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('categories.form.description')}
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder={t('categories.form.descriptionPlaceholder')}
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

                {/* Icon */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('categories.form.icon')}
                  </label>
                  <Input
                    {...register('icon')}
                    placeholder="📷"
                    className={`mt-2 h-11 text-2xl ${errors.icon ? 'border-red-500' : ''}`}
                    maxLength={2}
                  />
                  {errors.icon && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.icon.message as string)}
                    </p>
                  )}
                  {!errors.icon && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('categories.form.iconHint')}
                    </p>
                  )}
                </div>

                {/* Display Order */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('categories.form.displayOrder')}
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      {...register('display_order', { valueAsNumber: true })}
                      className={`h-9 font-mono ${errors.display_order ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.display_order && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.display_order.message as string)}
                    </p>
                  )}
                  {!errors.display_order && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('categories.form.displayOrderHint')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Multilingual Names */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t('categories.form.multilingual')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* English Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    🇬🇧 {t('categories.form.nameEn')}
                  </label>
                  <Input
                    {...register('name_en')}
                    placeholder="Cameras"
                    className={`mt-2 h-11 ${errors.name_en ? 'border-red-500' : ''}`}
                  />
                  {errors.name_en && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.name_en.message as string)}
                    </p>
                  )}
                </div>

                {/* Hungarian Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    🇭🇺 {t('categories.form.nameHu')}
                  </label>
                  <Input
                    {...register('name_hu')}
                    placeholder="Kamerák"
                    className={`mt-2 h-11 ${errors.name_hu ? 'border-red-500' : ''}`}
                  />
                  {errors.name_hu && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.name_hu.message as string)}
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
                  {t('categories.form.preview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Card */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {icon ? (
                      <div className="text-3xl">{icon}</div>
                    ) : (
                      <Folder className="h-8 w-8 text-primary" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {name || t('categories.form.namePlaceholder')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{displayOrder}
                      </p>
                    </div>
                  </div>

                  {description && (
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}

                  {(nameEn || nameHu) && (
                    <div className="space-y-1 text-xs pt-2 border-t border-border">
                      {nameEn && (
                        <div className="flex items-center gap-2">
                          <span>🇬🇧</span>
                          <span className="font-medium">{nameEn}</span>
                        </div>
                      )}
                      {nameHu && (
                        <div className="flex items-center gap-2">
                          <span>🇭🇺</span>
                          <span className="font-medium">{nameHu}</span>
                        </div>
                      )}
                    </div>
                  )}
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
                      {t('categories.edit.updating')}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t('categories.edit.submit')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/admin/categories')}
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
