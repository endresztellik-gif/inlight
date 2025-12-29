import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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

export function ClientEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Fetch client data
  const { data: client, isLoading: isLoadingClient, error: loadError } = useClient(id)
  const updateClient = useUpdateClient()

  // Form states
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [contactPersonName, setContactPersonName] = useState('')
  const [contactPersonEmail, setContactPersonEmail] = useState('')
  const [contactPersonPhone, setContactPersonPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Initialize form with client data
  useEffect(() => {
    if (client) {
      setName(client.name)
      setCompanyName(client.company || '')
      setEmail(client.email || '')
      setPhone(client.phone || '')
      setAddress(client.address || '')
      setTaxNumber(client.tax_number || '')
      setContactPersonName(client.contact_person_name || '')
      setContactPersonEmail(client.contact_person_email || '')
      setContactPersonPhone(client.contact_person_phone || '')
      setNotes(client.notes || '')
    }
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!id) {
      setError('Client ID is missing')
      return
    }

    try {
      await updateClient.mutateAsync({
        id,
        updates: {
          name,
          company: companyName || null,
          email,
          phone,
          address: address || null,
          tax_number: taxNumber || null,
          contact_person_name: contactPersonName || null,
          contact_person_email: contactPersonEmail || null,
          contact_person_phone: contactPersonPhone || null,
          notes: notes || null,
        }
      })

      // Navigate back to client detail on success
      navigate(`/clients/${id}`)
    } catch (err) {
      console.error('Failed to update client:', err)
      setError(err instanceof Error ? err.message : 'Failed to update client')
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
      {error && (
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to update client</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
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
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-2 h-11"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.companyName')}
                    </label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Film Production Ltd"
                      className="mt-2 h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.email')} *
                    </label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="mt-2 h-11"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.phone')} *
                    </label>
                    <Input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+36 30 123 4567"
                      className="mt-2 h-11 font-mono"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('clients.form.address')}
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="1052 Budapest, Váci utca 45."
                    rows={2}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none"
                  />
                </div>

                {/* Tax Number */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t('clients.form.taxNumber')}
                  </label>
                  <Input
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="12345678-2-41"
                    className="mt-2 h-11 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('clients.form.taxNumberHint')}</p>
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
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    placeholder="Jane Smith"
                    className="mt-2 h-11"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Contact Person Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.contactPersonEmail')}
                    </label>
                    <Input
                      type="email"
                      value={contactPersonEmail}
                      onChange={(e) => setContactPersonEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="mt-2 h-11"
                    />
                  </div>

                  {/* Contact Person Phone */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {t('clients.form.contactPersonPhone')}
                    </label>
                    <Input
                      type="tel"
                      value={contactPersonPhone}
                      onChange={(e) => setContactPersonPhone(e.target.value)}
                      placeholder="+36 30 987 6543"
                      className="mt-2 h-11 font-mono"
                    />
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
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('clients.form.notesPlaceholder')}
                    rows={4}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none"
                  />
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
                    disabled={!name || !email || !phone || updateClient.isPending}
                  >
                    {updateClient.isPending ? (
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
                    disabled={updateClient.isPending}
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
