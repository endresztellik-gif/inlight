import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Camera,
  Lightbulb,
  Film,
  Mic,
  Grid3x3,
  DollarSign,
  Package,
  Info
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Mock data - category keys for translation
const categories = [
  { id: 'all', key: 'all', icon: Grid3x3, count: 24 },
  { id: 'cameras', key: 'cameras', icon: Camera, count: 8 },
  { id: 'lenses', key: 'lenses', icon: Film, count: 12 },
  { id: 'lighting', key: 'lighting', icon: Lightbulb, count: 6 },
  { id: 'audio', key: 'audio', icon: Mic, count: 4 }
]

const products = [
  {
    id: '1',
    name: 'ARRI Alexa Mini LF',
    category: 'cameras',
    description: 'Large format digital cinema camera with 4.5K recording',
    dailyRate: 450,
    weeklyRate: 2500,
    ownStock: 2,
    image: '📹',
    specs: ['4.5K LF Sensor', 'ARRIRAW', 'ProRes']
  },
  {
    id: '2',
    name: 'Sony FX9',
    category: 'cameras',
    description: 'Full-frame 6K cinema camera with dual base ISO',
    dailyRate: 280,
    weeklyRate: 1500,
    ownStock: 3,
    image: '📹',
    specs: ['6K Full-Frame', 'Dual ISO', 'S-Cinetone']
  },
  {
    id: '3',
    name: 'Canon CN-E 35mm T1.5',
    category: 'lenses',
    description: 'Cinema prime lens with superior optical performance',
    dailyRate: 80,
    weeklyRate: 400,
    ownStock: 4,
    image: '🎥',
    specs: ['T1.5', 'EF Mount', 'Cinema Coating']
  },
  {
    id: '4',
    name: 'ARRI SkyPanel S60-C',
    category: 'lighting',
    description: 'LED soft light with full RGB+W color control',
    dailyRate: 65,
    weeklyRate: 350,
    ownStock: 6,
    image: '💡',
    specs: ['RGB+W', 'DMX Control', 'IP20']
  },
  {
    id: '5',
    name: 'DJI Ronin 4D',
    category: 'cameras',
    description: 'Cinema camera with integrated 4-axis gimbal',
    dailyRate: 320,
    weeklyRate: 1800,
    ownStock: 1,
    image: '📹',
    specs: ['4-Axis Gimbal', 'LiDAR Focus', '8K RAW']
  },
  {
    id: '6',
    name: 'Sennheiser MKH 416',
    category: 'audio',
    description: 'Professional shotgun microphone',
    dailyRate: 35,
    weeklyRate: 180,
    ownStock: 8,
    image: '🎤',
    specs: ['Shotgun', 'XLR', 'Phantom Power']
  },
  {
    id: '7',
    name: 'Aputure 600d Pro',
    category: 'lighting',
    description: 'High-power daylight LED with Bowens mount',
    dailyRate: 95,
    weeklyRate: 500,
    ownStock: 4,
    image: '💡',
    specs: ['600W', 'Bowens', 'Wireless DMX']
  },
  {
    id: '8',
    name: 'Zeiss CP.3 50mm T2.1',
    category: 'lenses',
    description: 'Compact prime lens for cinema production',
    dailyRate: 90,
    weeklyRate: 450,
    ownStock: 3,
    image: '🎥',
    specs: ['T2.1', 'PL/EF Mount', 'Compact']
  }
]

export function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { t } = useTranslation()

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4 animate-in fade-in slide-in-from-bottom duration-700">
            <h1 className="text-5xl font-bold tracking-tight">
              {t('catalog.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('catalog.subtitle')}
            </p>
            <div className="pt-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t('catalog.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-8 border-b border-border">
          {categories.map((category, index) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2 whitespace-nowrap animate-in slide-in-from-bottom duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <category.icon className="h-4 w-4" />
              {t(`catalog.categories.${category.key}`)}
              <span className="font-mono text-xs opacity-70">({category.count})</span>
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              cinematic
              className="group hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer animate-in slide-in-from-bottom duration-300"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Product Image */}
              <div className="aspect-video bg-secondary/50 flex items-center justify-center border-b border-border group-hover:bg-secondary/70 transition-colors">
                <span className="text-6xl grayscale group-hover:grayscale-0 transition-all">
                  {product.image}
                </span>
              </div>

              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Specs */}
                <div className="flex flex-wrap gap-1.5">
                  {product.specs.map((spec) => (
                    <span
                      key={spec}
                      className="inline-block px-2 py-0.5 text-xs rounded bg-primary/10 text-primary/80 border border-primary/20"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {t('catalog.pricing.daily')}
                    </p>
                    <p className="font-mono font-bold text-lg text-primary">
                      €{product.dailyRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {t('catalog.pricing.weekly')}
                    </p>
                    <p className="font-mono font-bold text-lg text-primary">
                      €{product.weeklyRate}
                    </p>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between pt-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{product.ownStock} {t('catalog.inStock')}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-1.5">
                    <Info className="h-3 w-3" />
                    {t('catalog.details')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card cinematic>
            <CardContent className="py-16">
              <div className="text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">{t('catalog.noResults.title')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('catalog.noResults.subtitle')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card cinematic className="mt-12 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">{t('catalog.cta.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('catalog.cta.subtitle')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Film className="h-5 w-5" />
                {t('catalog.cta.requestQuote')}
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Info className="h-5 w-5" />
                {t('catalog.cta.contactUs')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
