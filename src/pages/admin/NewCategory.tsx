import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { useCreateCategory } from '@/hooks/api/useCategories'

export function NewCategory() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createCategory = useCreateCategory()

  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [nameHu, setNameHu] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('categories.form.nameRequired'))
      return
    }

    try {
      await createCategory.mutateAsync({
        name: name.trim(),
        name_en: nameEn.trim() || null,
        name_hu: nameHu.trim() || null,
        description: description.trim() || null,
        icon: icon.trim() || null,
        display_order: displayOrder,
        is_active: true,
      })

      navigate('/admin/categories')
    } catch (err) {
      console.error('Failed to create category:', err)
      setError(err instanceof Error ? err.message : t('categories.form.createError'))
    }
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
          <h1 className="text-4xl font-bold tracking-tight">{t('categories.form.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('categories.form.subtitle')}
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
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('categories.form.namePlaceholder')}
                    className="mt-2 h-11"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('categories.form.nameHint')}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('categories.form.description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('categories.form.descriptionPlaceholder')}
                    rows={3}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('categories.form.icon')}
                  </label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📷"
                    className="mt-2 h-11 text-2xl"
                    maxLength={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('categories.form.iconHint')}
                  </p>
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
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                      className="h-9 font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('categories.form.displayOrderHint')}
                  </p>
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
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Cameras"
                    className="mt-2 h-11"
                  />
                </div>

                {/* Hungarian Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    🇭🇺 {t('categories.form.nameHu')}
                  </label>
                  <Input
                    value={nameHu}
                    onChange={(e) => setNameHu(e.target.value)}
                    placeholder="Kamerák"
                    className="mt-2 h-11"
                  />
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
                  disabled={createCategory.isPending}
                >
                  {createCategory.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('categories.form.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t('categories.form.submit')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/admin/categories')}
                  disabled={createCategory.isPending}
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
