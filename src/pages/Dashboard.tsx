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
  useUpcomingReturns,
  useLowStockProducts,
} from '@/hooks/api/useDashboardStats'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

export function Dashboard() {
  const { t } = useTranslation()

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(5)
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(5)
  const { data: topClients, isLoading: clientsLoading } = useTopClients(5)
  const { data: revenueTrend, isLoading: trendLoading } = useRevenueTrend(30)
  const { data: upcomingReturns, isLoading: upcomingLoading } = useUpcomingReturns(7)
  const { data: lowStockProducts, isLoading: lowStockLoading } = useLowStockProducts(2)

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        {/* Active Subrentals */}
        <Card cinematic className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('dashboard.stats.activeSubrentals')}
                </p>
                <p className="text-3xl font-bold font-mono mt-2">
                  {stats?.activeSubrentals || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-purple-500 font-semibold">+{stats?.activeSubrentalsToday || 0}</span>{' '}
                  {t('dashboard.stats.today')}
                </p>
              </div>
              <Truck className="h-12 w-12 text-purple-500 opacity-50" />
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

        {/* Total Profit */}
        <Card cinematic className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('dashboard.stats.totalProfit')}
                </p>
                <p className="text-3xl font-bold font-mono mt-2 text-emerald-500">
                  €{(stats?.totalProfit || 0).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard.stats.fromSubrentals')}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card cinematic className="border-l-4 border-l-cyan-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('dashboard.stats.avgProfitMargin')}
                </p>
                <p className="text-3xl font-bold font-mono mt-2 text-cyan-500">
                  {(stats?.avgProfitMargin || 0).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard.stats.averageMargin')}
                </p>
              </div>
              <BarChart3 className="h-12 w-12 text-cyan-500 opacity-50" />
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

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Revenue Trend Chart */}
        <Card cinematic className="lg:col-span-2 xl:col-span-1">
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

        {/* Distribution Pie Chart */}
        <Card cinematic>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('dashboard.distribution.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('dashboard.distribution.subtitle')}
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: t('dashboard.distribution.rentals'), value: stats?.rentalCount || 0 },
                      { name: t('dashboard.distribution.subrentals'), value: stats?.subrentalCount || 0 },
                    ]}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={({ value }) => value}
                    outerRadius={65}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#a855f7" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? '']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
                  />
                </PieChart>
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

      {/* Upcoming Returns & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Returns (Next 7 Days) */}
        <Card cinematic>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('dashboard.upcomingReturns.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('dashboard.upcomingReturns.subtitle')}
                </p>
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (upcomingReturns || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.upcomingReturns.noReturns')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(upcomingReturns || []).slice(0, 5).map((rental) => (
                  <Link
                    key={rental.id}
                    to={`/${rental.type === 'subrental' ? 'subrentals' : 'rentals'}/${rental.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        rental.days_until_due <= 1
                          ? 'bg-red-500/10 text-red-500'
                          : rental.days_until_due <= 3
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold">{rental.rental_number}</p>
                      <p className="text-xs text-muted-foreground">{rental.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          rental.days_until_due <= 1
                            ? 'text-red-500'
                            : rental.days_until_due <= 3
                            ? 'text-amber-500'
                            : 'text-blue-500'
                        }`}
                      >
                        {rental.days_until_due === 0
                          ? t('dashboard.upcomingReturns.today')
                          : rental.days_until_due === 1
                          ? t('dashboard.upcomingReturns.tomorrow')
                          : `${rental.days_until_due} ${t('dashboard.upcomingReturns.days')}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rental.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card cinematic>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('dashboard.lowStock.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('dashboard.lowStock.subtitle')}
                </p>
              </div>
              <Package className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (lowStockProducts || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Package className="h-12 w-12 text-green-500/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.lowStock.allGood')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(lowStockProducts || []).slice(0, 5).map((product) => (
                  <Link
                    key={product.id}
                    to={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        product.available_quantity === 0
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {product.serial_number} • {product.category_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold font-mono ${
                          product.available_quantity === 0 ? 'text-red-500' : 'text-amber-500'
                        }`}
                      >
                        {product.available_quantity}/{product.stock_quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.available_quantity === 0
                          ? t('dashboard.lowStock.outOfStock')
                          : t('dashboard.lowStock.lowStock')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
