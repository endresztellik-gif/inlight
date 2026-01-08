import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { SuperAdminRoute } from './components/auth/SuperAdminRoute'
import { Sidebar } from './components/layout/Sidebar'
import { OfflineIndicator } from './components/offline/OfflineIndicator'
import { Toaster } from './components/ui/toaster'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { RentalsList } from './pages/RentalsList'
import { RentalDetail } from './pages/RentalDetail'
import { NewRental } from './pages/NewRental'
import { SubrentalsList } from './pages/SubrentalsList'
import { SubrentalDetail } from './pages/SubrentalDetail'
import { NewSubrental } from './pages/NewSubrental'
import { ClientsList } from './pages/ClientsList'
import { NewClient } from './pages/NewClient'
import { ClientDetail } from './pages/ClientDetail'
import { ClientEdit } from './pages/ClientEdit'
import { ProductCatalog } from './pages/ProductCatalog'
import { Reports } from './pages/Reports'
import { CategoriesList } from './pages/admin/CategoriesList'
import { NewCategory } from './pages/admin/NewCategory'
import { EditCategory } from './pages/admin/EditCategory'
import { ProductsList } from './pages/admin/ProductsList'
import { NewProduct } from './pages/admin/NewProduct'
import { EditProduct } from './pages/admin/EditProduct'
import { Settings } from './pages/Settings'

// Layout wrapper for authenticated pages
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
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

        <Route path="/rentals/new" element={
          <AuthenticatedLayout>
            <NewRental />
          </AuthenticatedLayout>
        } />

        <Route path="/rentals/:id" element={
          <AuthenticatedLayout>
            <RentalDetail />
          </AuthenticatedLayout>
        } />

        <Route path="/subrentals" element={
          <AuthenticatedLayout>
            <SubrentalsList />
          </AuthenticatedLayout>
        } />

        <Route path="/subrentals/new" element={
          <AuthenticatedLayout>
            <NewSubrental />
          </AuthenticatedLayout>
        } />

        <Route path="/subrentals/:id" element={
          <AuthenticatedLayout>
            <SubrentalDetail />
          </AuthenticatedLayout>
        } />

        <Route path="/clients" element={
          <AuthenticatedLayout>
            <ClientsList />
          </AuthenticatedLayout>
        } />

        <Route path="/clients/new" element={
          <AuthenticatedLayout>
            <NewClient />
          </AuthenticatedLayout>
        } />

        <Route path="/clients/:id/edit" element={
          <AuthenticatedLayout>
            <ClientEdit />
          </AuthenticatedLayout>
        } />

        <Route path="/clients/:id" element={
          <AuthenticatedLayout>
            <ClientDetail />
          </AuthenticatedLayout>
        } />

        <Route path="/catalog" element={
          <AuthenticatedLayout>
            <ProductCatalog />
          </AuthenticatedLayout>
        } />

        {/* Public catalog route (no auth required) */}
        <Route path="/public/catalog" element={<ProductCatalog />} />

        {/* Reports */}
        <Route path="/reports" element={
          <AuthenticatedLayout>
            <Reports />
          </AuthenticatedLayout>
        } />

        {/* Admin - Categories (Super Admin Only) */}
        <Route path="/admin/categories" element={
          <AuthenticatedLayout>
            <SuperAdminRoute>
              <CategoriesList />
            </SuperAdminRoute>
          </AuthenticatedLayout>
        } />

        <Route path="/admin/categories/new" element={
          <AuthenticatedLayout>
            <SuperAdminRoute>
              <NewCategory />
            </SuperAdminRoute>
          </AuthenticatedLayout>
        } />

        <Route path="/admin/categories/:id/edit" element={
          <AuthenticatedLayout>
            <SuperAdminRoute>
              <EditCategory />
            </SuperAdminRoute>
          </AuthenticatedLayout>
        } />

        {/* Admin - Products (Super Admin Only) */}
        <Route path="/admin/products" element={
          <AuthenticatedLayout>
            <SuperAdminRoute>
              <ProductsList />
            </SuperAdminRoute>
          </AuthenticatedLayout>
        } />

        <Route path="/admin/products/new" element={
          <AuthenticatedLayout>
            <SuperAdminRoute>
              <NewProduct />
            </SuperAdminRoute>
          </AuthenticatedLayout>
        } />

        <Route path="/admin/products/:id/edit" element={
          <AuthenticatedLayout>
            <SuperAdminRoute>
              <EditProduct />
            </SuperAdminRoute>
          </AuthenticatedLayout>
        } />

        <Route path="/reports" element={
          <AuthenticatedLayout>
            <div className="p-8"><h1 className="text-3xl font-bold">Reports</h1></div>
          </AuthenticatedLayout>
        } />

        <Route path="/settings" element={
          <AuthenticatedLayout>
            <Settings />
          </AuthenticatedLayout>
        } />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  )
}

export default App
