import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react'

// Mock data for demonstration
const stats = [
  {
    title: 'Active Rentals',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Package,
    color: 'text-primary'
  },
  {
    title: 'Total Revenue',
    value: '€12,450',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-primary'
  },
  {
    title: 'Active Clients',
    value: '18',
    change: '+3',
    trend: 'up',
    icon: Users,
    color: 'text-primary'
  },
  {
    title: 'Pending Returns',
    value: '7',
    change: '-2',
    trend: 'down',
    icon: AlertCircle,
    color: 'text-amber-500'
  }
]

const recentRentals = [
  {
    id: 'R-20250128-0012',
    client: 'Budapest Film Studio',
    project: 'Winter Campaign 2025',
    total: '€2,450',
    status: 'active',
    dueDate: '2025-02-05'
  },
  {
    id: 'R-20250127-0008',
    client: 'Creative Vision Ltd',
    project: 'Product Showcase',
    total: '€1,890',
    status: 'active',
    dueDate: '2025-02-03'
  },
  {
    id: 'R-20250126-0015',
    client: 'Horizon Productions',
    project: 'Documentary Series',
    total: '€3,200',
    status: 'pending_return',
    dueDate: '2025-01-30'
  }
]

const topEquipment = [
  { name: 'ARRI Alexa Mini LF', rentals: 12, revenue: '€8,400' },
  { name: 'DJI Ronin 4D', rentals: 8, revenue: '€3,200' },
  { name: 'ARRI SkyPanel S60-C', rentals: 15, revenue: '€2,250' },
  { name: 'Canon CN-E Primes Set', rentals: 6, revenue: '€4,800' }
]

export function Dashboard() {

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            Overview of your rental operations
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/rentals/new">
            <Plus className="h-5 w-5" />
            New Rental
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            cinematic
            className="transition-all hover:shadow-lg hover:shadow-primary/10 animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stat.value}</div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-primary" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={stat.trend === 'up' ? 'text-primary' : 'text-muted-foreground'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Rentals */}
        <Card cinematic className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Rentals</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between p-4 rounded-md bg-secondary/50 border border-border hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="font-mono text-sm text-primary">{rental.id}</p>
                    <p className="font-medium">{rental.client}</p>
                    <p className="text-sm text-muted-foreground">{rental.project}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-mono font-semibold">{rental.total}</p>
                    <p className="text-xs text-muted-foreground">Due {rental.dueDate}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                      rental.status === 'active'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {rental.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Equipment */}
        <Card cinematic className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Top Equipment</CardTitle>
            <p className="text-sm text-muted-foreground">Most rented this month</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEquipment.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-4 p-3 rounded-md bg-secondary/50 border border-border"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-mono font-bold text-primary">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.rentals} rentals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-primary">{item.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card cinematic className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild>
              <Link to="/rentals/new">
                <Plus className="h-6 w-6" />
                <span>Create New Rental</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild>
              <Link to="/clients/new">
                <Users className="h-6 w-6" />
                <span>Add New Client</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild>
              <Link to="/catalog">
                <Package className="h-6 w-6" />
                <span>Check Inventory</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
