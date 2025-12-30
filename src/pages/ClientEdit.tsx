import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Users,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClient, useUpdateClient } from '@/hooks/api/useClients'
import { clientSchema, type ClientFormData } from '@/schemas/clientSchema'

export function ClientEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: client, isLoading: isLoadingClient, error: loadError } = useClient(id)
  const updateClient = useUpdateClient()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      tax_number: '',
      contact_person_name: '',
      contact_person_email: '',
      contact_person_phone: '',
      notes: '',
    },
  })

  // Watch values for preview
  const name = watch('name')
  const companyName = watch('company')
  const email = watch('email')
  const phone = watch('phone')
  const address = watch('address')
  const taxNumber = watch('tax_number')
  const contactPersonName = watch('contact_person_name')
  const contactPersonEmail = watch('contact_person_email')
  const contactPersonPhone = watch('contact_person_phone')

  // Load client data into form
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        tax_number: client.tax_number || '',
        contact_person_name: client.contact_person_name || '',
        contact_person_email: client.contact_person_email || '',
        contact_person_phone: client.contact_person_phone || '',
        notes: client.notes || '',
      })
    }
  }, [client, reset])

  const onSubmit = async (data: ClientFormData) => {
    if (!id) {
      setFormError('root', { message: 'Client ID is missing' })
      return
    }

    try {
      await updateClient.mutateAsync({
        id,
        updates: {
          name: data.name,
          company: data.company || null,
          email: data.email,
          phone: data.phone,
          address: data.address || null,
          tax_number: data.tax_number || null,
          contact_person_name: data.contact_person_name || null,
          contact_person_email: data.contact_person_email || null,
          contact_person_phone: data.contact_person_phone || null,
          notes: data.notes || null,
        },
      })

      navigate(`/clients/${id}`)
    } catch (err) {
      console.error('Failed to update client:', err)
      setFormError('root', {
        message: err instanceof Error ? err.message : 'Failed to update client',
      })
    }
  }

  // Loading State
  if (isLoadingClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error State
  if (loadError || !client) {
    return (
      <div className="p-8">
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-8 flex items-center gap-4 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">Failed to load client</p>
              <p className="text-sm opacity-80">{loadError?.message || 'Client not found'}</p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/clients/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('clients.edit.title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('clients.edit.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errors.root && (
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to update client</p>
              <p className="text-sm opacity-80">{errors.root.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t('clients.form.basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.name')} *
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="John Doe"
                      className={`mt-2 h-11 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.name.message as string)}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.companyName')}
                    </label>
                    <Input
                      {...register('company')}
                      placeholder="Film Production Ltd"
                      className={`mt-2 h-11 ${errors.company ? 'border-red-500' : ''}`}
                    />
                    {errors.company && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.company.message as string)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.email')} *
                    </label>
                    <Input
                      type="email"
                      {...register('email')}
                      placeholder="contact@company.com"
                      className={`mt-2 h-11 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.email.message as string)}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.phone')} *
                    </label>
                    <Input
                      type="tel"
                      {...register('phone')}
                      placeholder="+36 30 123 4567"
                      className={`mt-2 h-11 font-mono ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.phone.message as string)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('clients.form.address')}
                  </label>
                  <textarea
                    {...register('address')}
                    placeholder="1052 Budapest, Váci utca 45."
                    rows={2}
                    className={`mt-2 w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm resize-none ${
                      errors.address ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.address.message as string)}
                    </p>
                  )}
                </div>

                {/* Tax Number */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('clients.form.taxNumber')}
                  </label>
                  <Input
                    {...register('tax_number')}
                    placeholder="12345678-2-41"
                    className={`mt-2 h-11 font-mono ${errors.tax_number ? 'border-red-500' : ''}`}
                  />
                  {errors.tax_number && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.tax_number.message as string)}
                    </p>
                  )}
                  {!errors.tax_number && (
                    <p className="text-xs text-muted-foreground mt-1">{t('clients.form.taxNumberHint')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Person */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t('clients.form.contactPerson')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Person Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('clients.form.contactPersonName')}
                  </label>
                  <Input
                    {...register('contact_person_name')}
                    placeholder="Jane Smith"
                    className={`mt-2 h-11 ${errors.contact_person_name ? 'border-red-500' : ''}`}
                  />
                  {errors.contact_person_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.contact_person_name.message as string)}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Contact Person Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.contactPersonEmail')}
                    </label>
                    <Input
                      type="email"
                      {...register('contact_person_email')}
                      placeholder="jane@company.com"
                      className={`mt-2 h-11 ${errors.contact_person_email ? 'border-red-500' : ''}`}
                    />
                    {errors.contact_person_email && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.contact_person_email.message as string)}
                      </p>
                    )}
                  </div>

                  {/* Contact Person Phone */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.contactPersonPhone')}
                    </label>
                    <Input
                      type="tel"
                      {...register('contact_person_phone')}
                      placeholder="+36 30 987 6543"
                      className={`mt-2 h-11 font-mono ${errors.contact_person_phone ? 'border-red-500' : ''}`}
                    />
                    {errors.contact_person_phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {t(errors.contact_person_phone.message as string)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('clients.form.additionalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('clients.form.notes')}
                  </label>
                  <textarea
                    {...register('notes')}
                    placeholder={t('clients.form.notesPlaceholder')}
                    rows={4}
                    className={`mt-2 w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm resize-none ${
                      errors.notes ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500 mt-1">
                      {t(errors.notes.message as string)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-6">
            <Card cinematic className="amber-glow sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('clients.form.summary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Preview */}
                <div className="space-y-3">
                  {name && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('clients.form.name')}</p>
                      <p className="font-semibold mt-1">{name}</p>
                    </div>
                  )}

                  {companyName && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('clients.form.companyName')}</p>
                      <p className="font-semibold mt-1">{companyName}</p>
                    </div>
                  )}

                  {email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{email}</span>
                    </div>
                  )}

                  {phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{phone}</span>
                    </div>
                  )}

                  {address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-xs">{address}</span>
                    </div>
                  )}

                  {taxNumber && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('clients.form.taxNumber')}</p>
                      <p className="font-mono text-sm mt-1">{taxNumber}</p>
                    </div>
                  )}

                  {contactPersonName && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('clients.form.contactPerson')}</p>
                      <p className="font-semibold mt-1">{contactPersonName}</p>
                      {contactPersonEmail && (
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">{contactPersonEmail}</p>
                      )}
                      {contactPersonPhone && (
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">{contactPersonPhone}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t('clients.edit.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {t('clients.edit.submit')}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    asChild
                    disabled={isSubmitting}
                  >
                    <Link to={`/clients/${id}`}>{t('clients.form.cancel')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
