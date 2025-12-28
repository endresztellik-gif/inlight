---
name: inlight-rental-pwa
description: |
  iNLighT Rental Manager PWA fejlesztési skill. Film equipment rental management 
  alkalmazás (iNLighT Kft.). Használd amikor: projekt struktúra, komponensek, 
  adatbázis műveletek, i18n, vagy bármilyen projekt-specifikus fejlesztés szükséges.
  Kétnyelvű (EN/HU), Supabase backend, React+TypeScript+shadcn/ui frontend.
---

# iNLighT Rental Manager - Fő Projekt Skill

## Projekt Információ

- **Cég:** iNLighT Kft.
- **Domain:** inlight.hu
- **Típus:** Film equipment rental management PWA
- **Nyelvek:** Angol (elsődleges), Magyar
- **Pénznemek:** EUR, HUF, USD

## Modulok

| Modul | Leírás | Hozzáférés |
|-------|--------|------------|
| M1: Rental | Saját készlet bérbeadása | super_admin, admin |
| M2: Subrental | Beszerzett termékek | super_admin, admin |
| M3: Reports | Lekérdezések, export | super_admin (export), admin (olvasás) |
| M4: Catalog | Termék/kategória kezelés | super_admin |
| Public | Terméklista | Mindenki |

## Tech Stack

```
Frontend:
├── React 18 + TypeScript + Vite
├── TailwindCSS + shadcn/ui
├── react-i18next (i18n)
├── @tanstack/react-query
├── react-hook-form + zod
├── react-big-calendar
└── Workbox (PWA)

Backend:
├── Supabase
│   ├── PostgreSQL
│   ├── Auth (email/password)
│   ├── Storage (images)
│   └── Edge Functions
└── Resend (email)

Export:
├── xlsx, jspdf, docx
└── Google APIs (optional)
```

## Projekt Struktúra

```
src/
├── components/
│   ├── ui/               # shadcn/ui
│   ├── layout/           # Header, Sidebar, Footer
│   ├── rental/           # M1 komponensek
│   ├── subrental/        # M2 komponensek
│   ├── reports/          # M3 komponensek
│   ├── catalog/          # M4 komponensek
│   └── public/           # Publikus oldal
├── hooks/                # useProducts, useRentals, etc.
├── lib/
│   ├── supabase.ts
│   ├── i18n.ts
│   ├── utils.ts
│   └── exports/          # Excel, PDF, Word
├── pages/
├── types/
│   └── database.ts       # Supabase generated
└── locales/
    ├── en/
    └── hu/
```

## Szerepkörök

| Szerep | Jogok |
|--------|-------|
| super_admin (3 fő) | Minden: termékek, export, bizonylatok, userek |
| admin (2 fő) | Bérlés CRUD, visszavétel, készlet megtekintés |

## Kulcs Minták

### Supabase Query
```typescript
const { data, error } = await supabase
  .from('rentals')
  .select(`
    *,
    client:clients(*),
    items:rental_items(
      *,
      product:products(*)
    )
  `)
  .eq('status', 'active')
```

### i18n Használat
```typescript
const { t } = useTranslation()
// t('rental.status.active') → "Active" / "Aktív"
```

### Form + Zod
```typescript
const schema = z.object({
  project_name: z.string().min(1),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  final_total: z.number().positive().optional(),
  final_currency: z.enum(['EUR', 'HUF', 'USD']),
})
```

### Készlet Lekérdezés
```typescript
// Jövőbeli elérhetőség
const { data } = await supabase.rpc('get_future_availability', {
  p_product_id: productId,
  p_target_date: '2025-02-15'
})
```

## Kapcsolódó Skill-ek

- `supabase-workflow` - Backend fejlesztés, RLS, Edge Functions
- `testing-workflow` - Tesztelés (Vitest, RTL, Playwright)
- `security-audit` - Biztonsági ellenőrzések
- `deployment-workflow` - Netlify deploy, CI/CD
- `frontend-design` (public) - UI/UX fejlesztés

## Fontos Szabályok

1. **Napi díj csak tájékoztató** - Végösszeg kézzel megadva
2. **Subrental nincs készlet** - Minden azonnal elérhető
3. **Több beszállító/tétel** - rental_item_suppliers tábla
4. **RLS kötelező** - Minden táblán role-based policy
5. **i18n minden szövegre** - Nincs hardcoded string

## Referenciák

- `references/database_schema.sql` - Teljes DB séma
- `references/api_patterns.md` - API hívás minták
- `references/component_library.md` - Komponens dokumentáció
- `references/i18n_keys.md` - Fordítási kulcsok
