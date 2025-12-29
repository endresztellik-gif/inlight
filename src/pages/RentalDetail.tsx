import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  RotateCcw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Mock data
const rentalData = {
  id: 'R-20250128-0012',
  rentalNumber: 'R-20250128-0012',
  status: 'active',
  client: {
    name: 'Budapest Film Studio',
    email: 'contact@budapestfilm.hu',
    phone: '+36 1 234 5678',
    address: '1052 Budapest, Váci utca 45.'
  },
  project: {
    name: 'Winter Campaign 2025',
    description: 'High-end commercial production for winter clothing brand'
  },
  dates: {
    start: '2025-01-15',
    end: '2025-02-05',
    created: '2025-01-10',
    daysLeft: 7
  },
  financial: {
    subtotal: 2250,
    discount: 0,
    tax: 200,
    total: 2450,
    currency: 'EUR',
    notes: 'Payment on delivery. 10% discount for extended rental.'
  },
  items: [
    {
      id: '1',
      name: 'ARRI Alexa Mini LF',
      category: 'Camera',
      serialNumber: 'ARRI-ALX-2023-089',
      quantity: 1,
      dailyRate: 450,
      days: 5,
      subtotal: 2250,
      condition: 'excellent',
      returned: false
    },
    {
      id: '2',
      name: 'Canon CN-E 35mm T1.5',
      category: 'Lens',
      serialNumber: 'CN-35-2022-145',
      quantity: 1,
      dailyRate: 80,
      days: 5,
      subtotal: 400,
      condition: 'good',
      returned: false
    },
    {
      id: '3',
      name: 'DJI Ronin 4D',
      category: 'Gimbal',
      serialNumber: 'DJI-RON-2023-234',
      quantity: 1,
      dailyRate: 120,
      days: 5,
      subtotal: 600,
      condition: 'excellent',
      returned: false
    }
  ]
}

const statusConfig = {
  active: { color: 'text-primary bg-primary/20 border-primary/30' },
  pending_return: { color: 'text-amber-400 bg-amber-400/20 border-amber-400/30' },
  completed: { color: 'text-green-500 bg-green-500/20 border-green-500/30' },
  cancelled: { color: 'text-red-500 bg-red-500/20 border-red-500/30' }
}

export function RentalDetail() {
  const { t } = useTranslation()
  const [rental] = useState(rentalData)
  const [returnMode, setReturnMode] = useState(false)

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/rentals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-mono">{rental.rentalNumber}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{rental.project.name}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border ${
            statusConfig[rental.status as keyof typeof statusConfig].color
          }`}>
            <CheckCircle className="h-4 w-4" />
            {t(`rentals.status.${rental.status}`)}
          </span>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            {t('rentalDetail.exportPdf')}
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Edit className="h-5 w-5" />
            {t('rentalDetail.edit')}
          </Button>
          {rental.status === 'active' && (
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setReturnMode(!returnMode)}
            >
              <RotateCcw className="h-5 w-5" />
              {returnMode ? t('rentalDetail.cancelReturn') : t('rentalDetail.processReturn')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('rentalDetail.clientInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{rental.client.name}</p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{rental.client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{rental.client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{rental.client.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Items */}
          <Card cinematic>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('rentalDetail.rentalItems')} ({rental.items.length})
                </CardTitle>
                {returnMode && (
                  <span className="text-sm text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {t('rentalDetail.returnModeActive')}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-medium">Item</th>
                      <th className="p-4 font-medium">Serial #</th>
                      <th className="p-4 font-medium">Qty</th>
                      <th className="p-4 font-medium">Daily Rate</th>
                      <th className="p-4 font-medium">Days</th>
                      <th className="p-4 font-medium">Subtotal</th>
                      {returnMode && <th className="p-4 font-medium">Condition</th>}
                      {returnMode && <th className="p-4 font-medium">Return</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rental.items.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.category}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.serialNumber}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono">{item.quantity}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm">€{item.dailyRate}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono">{item.days}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-semibold text-primary">
                            €{item.subtotal}
                          </span>
                        </td>
                        {returnMode && (
                          <td className="p-4">
                            <select className="bg-input border border-border rounded px-2 py-1 text-sm">
                              <option value="excellent">Excellent</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                              <option value="damaged">Damaged</option>
                            </select>
                          </td>
                        )}
                        {returnMode && (
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {returnMode && (
            <Card cinematic className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ready to complete return?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Make sure all items are checked and conditions are noted
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setReturnMode(false)}>
                      Cancel
                    </Button>
                    <Button className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Complete Return
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rental Period */}
          <Card cinematic>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Rental Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</p>
                <p className="font-mono text-lg font-semibold mt-1">{rental.dates.start}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">End Date</p>
                <p className="font-mono text-lg font-semibold mt-1">{rental.dates.end}</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Time remaining</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {rental.dates.daysLeft} days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card cinematic className="amber-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">€{rental.financial.subtotal}</span>
              </div>
              {rental.financial.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-mono text-primary">-€{rental.financial.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">€{rental.financial.tax}</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold font-mono text-primary">
                  €{rental.financial.total}
                </span>
              </div>
              {rental.financial.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">{rental.financial.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card cinematic>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Download className="h-4 w-4" />
                Download Contract
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
                Cancel Rental
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
