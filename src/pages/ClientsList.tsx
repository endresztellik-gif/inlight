import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Building2,
  TrendingUp,
  Eye,
  Edit,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClients } from '@/hooks/api/useClients'

export function ClientsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Fetch clients from Supabase
  const { data: clients, isLoading, error } = useClients({
    searchQuery: searchQuery || undefined,
    isActive: true,
  })

  const totalClients = clients?.length || 0
  const activeClients = totalClients // All fetched clients are active

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('clients.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('clients.subtitle')}
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/clients/new">
            <Plus className="h-5 w-5" />
            {t('clients.newClient')}
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card cinematic className="border-destructive/50">
          <CardContent className="p-8 flex items-center gap-4 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">Failed to load clients</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card cinematic className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('clients.stats.totalClients')}
                  </p>
                  <p className="text-2xl font-bold font-mono mt-1">{totalClients}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card cinematic className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('clients.stats.activeClients')}
                  </p>
                  <p className="text-2xl font-bold font-mono mt-1">{activeClients}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card cinematic>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('clients.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients?.map((client, index) => (
              <Card
                key={client.id}
                cinematic
                className="hover:shadow-lg hover:shadow-primary/10 transition-all animate-in slide-in-from-bottom duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      {client.company && (
                        <p className="text-sm text-muted-foreground mt-1">{client.company}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    {client.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="font-mono">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span className="text-xs">{client.address}</span>
                      </div>
                    )}
                  </div>

                  {client.tax_number && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">{t('clients.card.taxNumber')}</p>
                      <p className="font-mono text-sm mt-1">{client.tax_number}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {clients?.length === 0 && (
            <Card cinematic>
              <CardContent className="py-16">
                <div className="text-center">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground">{t('clients.noResults.title')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('clients.noResults.subtitle')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
