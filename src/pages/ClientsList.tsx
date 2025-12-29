import { useState } from 'react'
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
  Edit
} from 'lucide-react'

// Mock data
const clients = [
  {
    id: '1',
    name: 'Budapest Film Studio',
    email: 'contact@budapestfilm.hu',
    phone: '+36 1 234 5678',
    address: '1052 Budapest, Váci utca 45.',
    taxNumber: '12345678-2-41',
    activeRentals: 2,
    totalRentals: 15,
    totalRevenue: 45200,
    lastRental: '2025-01-28',
    status: 'active'
  },
  {
    id: '2',
    name: 'Creative Vision Ltd',
    email: 'info@creativevision.hu',
    phone: '+36 30 987 6543',
    address: '1068 Budapest, Benczúr utca 12.',
    taxNumber: '87654321-1-44',
    activeRentals: 1,
    totalRentals: 8,
    totalRevenue: 18900,
    lastRental: '2025-01-27',
    status: 'active'
  },
  {
    id: '3',
    name: 'Horizon Productions',
    email: 'hello@horizonprod.com',
    phone: '+36 20 555 4321',
    address: '1132 Budapest, Váci út 76.',
    taxNumber: '11223344-2-42',
    activeRentals: 0,
    totalRentals: 22,
    totalRevenue: 67800,
    lastRental: '2025-01-26',
    status: 'active'
  },
  {
    id: '4',
    name: 'Skyline Media',
    email: 'contact@skylinemedia.hu',
    phone: '+36 1 444 5566',
    address: '1054 Budapest, Hold utca 29.',
    taxNumber: '99887766-1-41',
    activeRentals: 0,
    totalRentals: 4,
    totalRevenue: 8200,
    lastRental: '2025-01-25',
    status: 'active'
  },
  {
    id: '5',
    name: 'Indie Collective',
    email: 'team@indiecollective.hu',
    phone: '+36 70 123 4567',
    address: '1075 Budapest, Madách tér 8.',
    taxNumber: '55443322-2-43',
    activeRentals: 1,
    totalRentals: 12,
    totalRevenue: 28500,
    lastRental: '2025-01-24',
    status: 'active'
  }
]

export function ClientsList() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  )

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.activeRentals > 0).length
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0)

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            Manage your client database
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          New Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Clients
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
                  Active Clients
                </p>
                <p className="text-2xl font-bold font-mono mt-1">{activeClients}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold font-mono mt-1">€{totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card cinematic>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client, index) => (
          <Card
            key={client.id}
            cinematic
            className="hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer animate-in slide-in-from-bottom duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{client.name}</CardTitle>
                  {client.activeRentals > 0 && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-primary/20 text-primary border border-primary/30">
                      {client.activeRentals} active rental{client.activeRentals > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">{client.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="text-xs">{client.address}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Rentals</p>
                  <p className="font-mono font-semibold text-lg">{client.totalRentals}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-mono font-semibold text-lg text-primary">
                    €{(client.totalRevenue / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-muted-foreground">
                Last rental: <span className="font-mono">{client.lastRental}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card cinematic>
          <CardContent className="py-16">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">No clients found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
