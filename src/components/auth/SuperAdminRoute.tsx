import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface SuperAdminRouteProps {
  children: React.ReactNode
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user, profile, loading } = useAuth()
  const { t } = useTranslation()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Show access denied if not super_admin
  if (profile?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="max-w-md" cinematic>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-6 w-6" />
              {t('auth.accessDenied')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('auth.superAdminOnly')}
            </p>
            <Button
              onClick={() => window.history.back()}
              className="w-full"
            >
              {t('common.goBack')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render children if super_admin
  return <>{children}</>
}
