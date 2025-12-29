import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { RentalsList } from './pages/RentalsList'
import { RentalDetail } from './pages/RentalDetail'

// Layout wrapper for authenticated pages
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated routes */}
        <Route path="/dashboard" element={
          <AuthenticatedLayout>
            <Dashboard />
          </AuthenticatedLayout>
        } />

        <Route path="/rentals" element={
          <AuthenticatedLayout>
            <RentalsList />
          </AuthenticatedLayout>
        } />

        <Route path="/rentals/:id" element={
          <AuthenticatedLayout>
            <RentalDetail />
          </AuthenticatedLayout>
        } />

        <Route path="/clients" element={
          <AuthenticatedLayout>
            <div className="p-8"><h1 className="text-3xl font-bold">Clients</h1></div>
          </AuthenticatedLayout>
        } />

        <Route path="/catalog" element={
          <AuthenticatedLayout>
            <div className="p-8"><h1 className="text-3xl font-bold">Catalog</h1></div>
          </AuthenticatedLayout>
        } />

        <Route path="/reports" element={
          <AuthenticatedLayout>
            <div className="p-8"><h1 className="text-3xl font-bold">Reports</h1></div>
          </AuthenticatedLayout>
        } />

        <Route path="/settings" element={
          <AuthenticatedLayout>
            <div className="p-8"><h1 className="text-3xl font-bold">Settings</h1></div>
          </AuthenticatedLayout>
        } />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
