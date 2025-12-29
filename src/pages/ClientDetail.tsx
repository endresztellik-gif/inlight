import { Link, useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Users,
  Loader2,
  AlertCircle,
  Receipt
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClient } from '@/hooks/api/useClients'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Fetch client data
  const { data: client, isLoading, error } = useClient(id)

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error State
  if (error || !client) {
    return (
      <div className="p-8">
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-8 flex items-center gap-4 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">Failed to load client</p>
              <p className="text-sm opacity-80">{error?.message || 'Client not found'}</p>
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
            <Link to="/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{client.name}</h1>
            {client.company && (
              <p className="text-muted-foreground mt-1 text-lg">{client.company}</p>
            )}
          </div>
        </div>
        <Button size="lg" className="gap-2" onClick={() => navigate(`/clients/${id}/edit`)}>
          <Edit className="h-5 w-5" />
          {t('clients.detail.edit')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t('clients.detail.contactInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Email */}
                {client.email && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      {t('clients.form.email')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${client.email}`}
                        className="font-mono text-sm hover:text-primary transition-colors"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {client.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      {t('clients.form.phone')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${client.phone}`}
                        className="font-mono text-sm hover:text-primary transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              {client.address && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {t('clients.form.address')}
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{client.address}</p>
                  </div>
                </div>
              )}

              {/* Tax Number */}
              {client.tax_number && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {t('clients.form.taxNumber')}
                  </p>
                  <p className="font-mono text-sm">{client.tax_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Person */}
          {(client.contact_person_name || client.contact_person_email || client.contact_person_phone) && (
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t('clients.form.contactPerson')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.contact_person_name && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      {t('clients.form.contactPersonName')}
                    </p>
                    <p className="font-semibold">{client.contact_person_name}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {client.contact_person_email && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        {t('clients.form.contactPersonEmail')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${client.contact_person_email}`}
                          className="font-mono text-sm hover:text-primary transition-colors"
                        >
                          {client.contact_person_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {client.contact_person_phone && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        {t('clients.form.contactPersonPhone')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${client.contact_person_phone}`}
                          className="font-mono text-sm hover:text-primary transition-colors"
                        >
                          {client.contact_person_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('clients.form.notes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card cinematic className="amber-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                {t('clients.detail.rentalHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {t('clients.detail.noRentals')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {t('clients.detail.clientInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('clients.detail.status')}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${client.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  <p className="text-sm font-medium">
                    {client.is_active ? t('clients.detail.active') : t('clients.detail.inactive')}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('clients.detail.createdAt')}
                </p>
                <p className="text-sm mt-1">
                  {new Date(client.created_at).toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('clients.detail.updatedAt')}
                </p>
                <p className="text-sm mt-1">
                  {new Date(client.updated_at).toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
