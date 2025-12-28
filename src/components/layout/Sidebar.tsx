import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  Film
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Rentals', href: '/rentals', icon: Film },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Catalog', href: '/catalog', icon: Package },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card film-perforation">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
          <Film className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">iNLighT</h1>
          <p className="text-xs font-mono text-muted-foreground">RENTAL MGR</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User info & logout */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary transition-all cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-mono text-sm font-bold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Super Admin</p>
            <p className="text-xs text-muted-foreground font-mono">admin@inlight.hu</p>
          </div>
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
