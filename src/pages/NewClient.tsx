import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Users
} from 'lucide-react'

export function NewClient() {
  const navigate = useNavigate()

  // Form states
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [contactPersonName, setContactPersonName] = useState('')
  const [contactPersonEmail, setContactPersonEmail] = useState('')
  const [contactPersonPhone, setContactPersonPhone] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save to Supabase
    console.log('Creating client:', {
      name,
      companyName,
      email,
      phone,
      address,
      taxNumber,
      contactPersonName,
      contactPersonEmail,
      contactPersonPhone,
      notes
    })
    navigate('/clients')
  }

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">New Client</h1>
            <p className="text-muted-foreground mt-1 text-sm">Add a new client to your database</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Name *
                    </label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-2 h-11"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Company Name
                    </label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Film Production Ltd"
                      className="mt-2 h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Email *
                    </label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="mt-2 h-11"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Phone *
                    </label>
                    <Input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+36 30 123 4567"
                      className="mt-2 h-11 font-mono"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="1052 Budapest, Váci utca 45."
                    rows={2}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none"
                  />
                </div>

                {/* Tax Number */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Tax Number
                  </label>
                  <Input
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="12345678-2-41"
                    className="mt-2 h-11 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Hungarian format: XXXXXXXX-X-XX</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Person */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Contact Person (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Person Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Contact Person Name
                  </label>
                  <Input
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    placeholder="Jane Smith"
                    className="mt-2 h-11"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Contact Person Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Contact Person Email
                    </label>
                    <Input
                      type="email"
                      value={contactPersonEmail}
                      onChange={(e) => setContactPersonEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="mt-2 h-11"
                    />
                  </div>

                  {/* Contact Person Phone */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Contact Person Phone
                    </label>
                    <Input
                      type="tel"
                      value={contactPersonPhone}
                      onChange={(e) => setContactPersonPhone(e.target.value)}
                      placeholder="+36 30 987 6543"
                      className="mt-2 h-11 font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card cinematic>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special requirements, payment terms, discounts..."
                    rows={4}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-6">
            <Card cinematic className="amber-glow sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Client Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Preview */}
                <div className="space-y-3">
                  {name && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                      <p className="font-semibold mt-1">{name}</p>
                    </div>
                  )}

                  {companyName && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Company</p>
                      <p className="font-semibold mt-1">{companyName}</p>
                    </div>
                  )}

                  {email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{email}</span>
                    </div>
                  )}

                  {phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{phone}</span>
                    </div>
                  )}

                  {address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-xs">{address}</span>
                    </div>
                  )}

                  {taxNumber && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Tax Number</p>
                      <p className="font-mono text-sm mt-1">{taxNumber}</p>
                    </div>
                  )}

                  {contactPersonName && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact Person</p>
                      <p className="font-semibold mt-1">{contactPersonName}</p>
                      {contactPersonEmail && (
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">{contactPersonEmail}</p>
                      )}
                      {contactPersonPhone && (
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">{contactPersonPhone}</p>
                      )}
                    </div>
                  )}

                  {!name && !email && !phone && (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Fill in the form to see preview</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={!name || !email || !phone}
                  >
                    <Save className="h-5 w-5" />
                    Create Client
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link to="/clients">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
