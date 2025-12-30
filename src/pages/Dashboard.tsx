import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Plus,
  Film,
  Truck,
  TrendingUp,
  Clock,
  Loader2,
  ArrowRight,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useDashboardStats,
  useRecentActivity,
  useTopProducts,
  useTopClients,
  useRevenueTrend,
} from '@/hooks/api/useDashboardStats'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

export function Dashboard() {
  const { t } = useTranslation()

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(5)
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(5)
  const { data: topClients, isLoading: clientsLoading } = useTopClients(5)
  const { data: revenueTrend, isLoading: trendLoading } = useRevenueTrend(30)

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasAlerts =
    (stats?.pendingReturnsToday || 0) > 0 ||
    (stats?.overdueReturns || 0) > 0 ||
    (stats?.lowStockCount || 0) > 0

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/rentals/new">
            <Plus className="h-5 w-5" />
            {t('dashboard.newRental')}
          </Link>
        </Button>
      </div>

      {/* Alerts Section */}
      {hasAlerts && (
        <Card cinematic className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-5 w-5" />
              {t('dashboard.alerts.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(stats?.overdueReturns || 0) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>
                    <strong>{stats?.overdueReturns}</strong> {t('dashboard.alerts.overdueReturns')}
                  </span>
                </div>
              )}
              {(stats?.pendingReturnsToday || 0) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    <strong>{stats?.pendingReturnsToday}</strong> {t('dashboard.alerts.dueToday')}
                  </span>
                </div>
              )}
              {(stats?.lowStockCount || 0) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-amber-500" />
                  <span>
                    <strong>{stats?.lowStockCount}</strong> {t('dashboard.alerts.lowStock')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Rentals */}
        <Card cinematic className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('dashboard.stats.activeRentals')}
                </p>
                <p className="text-3xl font-bold font-mono mt-2">
                  {stats?.activeRentals || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-semibold">+{stats?.activeRentalsToday || 0}</span>{' '}
                  {t('dashboard.stats.today')}
                </p>
              </div>
              <Package className="h-12 w-12 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Returns */}
        <Card cinematic className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('dashboard.stats.pendingReturns')}
                </p>
                <p className="text-3xl font-bold font-mono mt-2">
                  {stats?.pendingReturns || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-amber-500 font-semibold">{stats?.pendingReturnsToday || 0}</span>{' '}
                  {t('dashboard.stats.dueToday')}
                </p>
              </div>
              <Clock className="h-12 w-12 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue This Month */}
        <Card cinematic className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('dashboard.stats.revenueMonth')}
                </p>
                <p className="text-3xl font-bold font-mono mt-2">
                  €{(stats?.revenueThisMonth || 0).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500 font-semibold">€{(stats?.revenueToday || 0).toFixed(0)}</span>{' '}
                  {t('dashboard.stats.today')}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card cinematic className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('dashboard.stats.activeClients')}
                </p>
                <p className="text-3xl font-bold font-mono mt-2">
                  {stats?.activeClients || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard.stats.of')} {stats?.totalClients || 0} {t('dashboard.stats.total')}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card cinematic className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard.quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/rentals/new">
                <Film className="h-5 w-5" />
                <span className="text-xs">{t('dashboard.quickActions.newRental')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/subrentals/new">
                <Truck className="h-5 w-5" />
                <span className="text-xs">{t('dashboard.quickActions.newSubrental')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/clients/new">
                <Users className="h-5 w-5" />
                <span className="text-xs">{t('dashboard.quickActions.newClient')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/admin/products/new">
                <Package className="h-5 w-5" />
                <span className="text-xs">{t('dashboard.quickActions.newProduct')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/reports">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">{t('dashboard.quickActions.viewReports')}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card cinematic>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('dashboard.revenueTrend.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('dashboard.revenueTrend.subtitle')}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number | undefined) => [`€${(value || 0).toFixed(2)}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card cinematic>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t('dashboard.recentActivity.title')}</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link to="/rentals">
                  {t('dashboard.recentActivity.viewAll')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {(recentActivity || []).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === 'subrental'
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {activity.type === 'subrental' ? (
                        <Truck className="h-4 w-4" />
                      ) : (
                        <Film className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card cinematic>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.topProducts.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {(topProducts || []).map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {product.serial_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-green-500">
                        €{product.revenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.times_rented} {t('dashboard.topProducts.rentals')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card cinematic>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.topClients.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {(topClients || []).map((client, index) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{client.name}</p>
                      {client.company && (
                        <p className="text-xs text-muted-foreground">{client.company}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-green-500">
                        €{client.total_revenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.total_rentals} {t('dashboard.topClients.rentals')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
