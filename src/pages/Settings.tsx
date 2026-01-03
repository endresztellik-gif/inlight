import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Lock,
  Globe,
  Palette,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/lib/supabase'

export function Settings() {
  const { t, i18n } = useTranslation()
  const { user, profile } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileSuccess(false)
    setProfileError(null)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', user!.id)

      if (error) throw error

      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      console.error('Profile update error:', err)
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordSuccess(false)
    setPasswordError(null)

    // Validation
    if (newPassword.length < 8) {
      setPasswordError(t('settings.security.passwordTooShort'))
      setPasswordLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.security.passwordMismatch'))
      setPasswordLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      console.error('Password change error:', err)
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Section */}
        <Card cinematic>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>{t('settings.profile.title')}</CardTitle>
            </div>
            <CardDescription>{t('settings.profile.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('settings.profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.profile.emailReadOnly')}
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('settings.profile.fullName')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('settings.profile.fullNamePlaceholder')}
                />
              </div>

              {/* Role (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role">{t('settings.profile.role')}</Label>
                <Input
                  id="role"
                  type="text"
                  value={profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Success/Error Messages */}
              {profileSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-500">{t('settings.profile.updateSuccess')}</p>
                </div>
              )}

              {profileError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-500">{profileError}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full gap-2" disabled={profileLoading}>
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('settings.profile.updating')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t('settings.profile.updateButton')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card cinematic>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>{t('settings.security.title')}</CardTitle>
            </div>
            <CardDescription>{t('settings.security.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('settings.security.newPassword')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('settings.security.newPasswordPlaceholder')}
                  minLength={8}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('settings.security.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('settings.security.confirmPasswordPlaceholder')}
                  minLength={8}
                  required
                />
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {t('settings.security.passwordRequirements')}
                </p>
              </div>

              {/* Success/Error Messages */}
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-500">{t('settings.security.changeSuccess')}</p>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-500">{passwordError}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full gap-2" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('settings.security.changing')}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {t('settings.security.changeButton')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card cinematic className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>{t('settings.preferences.title')}</CardTitle>
            </div>
            <CardDescription>{t('settings.preferences.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Language Preference */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <Label>{t('settings.preferences.language')}</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={i18n.language === 'en' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('en')}
                    className="gap-2"
                  >
                    🇬🇧 English
                  </Button>
                  <Button
                    type="button"
                    variant={i18n.language === 'hu' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('hu')}
                    className="gap-2"
                  >
                    🇭🇺 Magyar
                  </Button>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <Label>{t('settings.preferences.theme')}</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    ☀️ {t('theme.lightMode')}
                  </Button>
                  <Button
                    type="button"
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    🌙 {t('theme.darkMode')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.autoSave')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
