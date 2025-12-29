import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Mock data
const rentals = [
  {
    id: 'R-20250128-0012',
    client: 'Budapest Film Studio',
    project: 'Winter Campaign 2025',
    startDate: '2025-01-15',
    endDate: '2025-02-05',
    total: '€2,450',
    status: 'active',
    itemCount: 8,
    daysLeft: 7
  },
  {
    id: 'R-20250127-0008',
    client: 'Creative Vision Ltd',
    project: 'Product Showcase',
    startDate: '2025-01-20',
    endDate: '2025-02-03',
    total: '€1,890',
    status: 'active',
    itemCount: 5,
    daysLeft: 5
  },
  {
    id: 'R-20250126-0015',
    client: 'Horizon Productions',
    project: 'Documentary Series',
    startDate: '2025-01-10',
    endDate: '2025-01-30',
    total: '€3,200',
    status: 'pending_return',
    itemCount: 12,
    daysLeft: 1
  },
  {
    id: 'R-20250125-0003',
    client: 'Skyline Media',
    project: 'Corporate Video',
    startDate: '2025-01-05',
    endDate: '2025-01-25',
    total: '€980',
    status: 'completed',
    itemCount: 3,
    daysLeft: -4
  },
  {
    id: 'R-20250124-0009',
    client: 'Indie Collective',
    project: 'Short Film "Echoes"',
    startDate: '2025-01-18',
    endDate: '2025-02-10',
    total: '€4,200',
    status: 'active',
    itemCount: 15,
    daysLeft: 12
  },
  {
    id: 'R-20250123-0001',
    client: 'National Theater',
    project: 'Stage Recording',
    startDate: '2025-01-01',
    endDate: '2025-01-20',
    total: '€1,650',
    status: 'cancelled',
    itemCount: 7,
    daysLeft: -9
  }
]

const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    color: 'text-primary bg-primary/20 border-primary/30'
  },
  pending_return: {
    label: 'Pending Return',
    icon: AlertCircle,
    color: 'text-amber-400 bg-amber-400/20 border-amber-400/30'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-500 bg-green-500/20 border-green-500/30'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-500 bg-red-500/20 border-red-500/30'
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    color: 'text-muted-foreground bg-muted/20 border-muted/30'
  }
}

export function RentalsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { t } = useTranslation()

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch =
      rental.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.project.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('rentals.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('rentals.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            {t('rentals.export')}
          </Button>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/rentals/new">
              <Plus className="h-5 w-5" />
              {t('rentals.newRental')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card cinematic>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('rentals.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                {t('rentals.filters.all')}
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                {t('rentals.filters.active')}
              </Button>
              <Button
                variant={statusFilter === 'pending_return' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending_return')}
                size="sm"
              >
                {t('rentals.filters.pending')}
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
              >
                {t('rentals.filters.completed')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold font-mono mt-1">3</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold font-mono mt-1">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold font-mono mt-1">1</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Value</p>
                <p className="text-2xl font-bold font-mono mt-1">€14,370</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rentals Table */}
      <Card cinematic>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            {filteredRentals.length} Rental{filteredRentals.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 font-medium">Rental #</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Period</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRentals.map((rental, index) => {
                  const StatusIcon = statusConfig[rental.status as keyof typeof statusConfig].icon
                  return (
                    <tr
                      key={rental.id}
                      className="hover:bg-secondary/50 transition-colors animate-in slide-in-from-bottom duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-primary font-semibold">
                          {rental.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{rental.client}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {rental.project}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-xs">
                            {rental.startDate} → {rental.endDate}
                          </span>
                        </div>
                        {rental.status === 'active' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {rental.daysLeft} days left
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{rental.itemCount}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-semibold text-primary">
                          {rental.total}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          statusConfig[rental.status as keyof typeof statusConfig].color
                        }`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[rental.status as keyof typeof statusConfig].label}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                          <Link to={`/rentals/${rental.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredRentals.length === 0 && (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">No rentals found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
