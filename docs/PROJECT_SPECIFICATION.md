# iNLighT Rental Manager - Projekt Specifikáció

## 1. Projekt Áttekintés

**Projekt neve:** iNLighT Rental Manager
**Cég:** iNLighT Kft.
**Jelenlegi weboldal:** https://www.inlight.hu (WordPress/WooCommerce)
**Típus:** Progressive Web Application (PWA)
**Nyelvek:** Angol (elsődleges), Magyar
**Célközönség:** Belső használat + publikus terméklista
**Szlogen:** "Professional Lighting & Gaffer Service for the film industry"

---

## 2. Modul Struktúra

### 2.1 Modulok Áttekintése

```
┌─────────────────────────────────────────────────────────────────┐
│                     FilmGear Rental Manager                      │
├─────────────────────────────────────────────────────────────────┤
│  🔐 BELSŐ (Autentikált)           │  🌐 PUBLIKUS               │
├───────────────────────────────────┼─────────────────────────────┤
│  M1: Rental Module                │  Terméklista               │
│      (Saját készlet)              │  (Csak Rental termékek)    │
├───────────────────────────────────┤                             │
│  M2: Subrental Module             │                             │
│      (Beszerzett termékek)        │                             │
├───────────────────────────────────┤                             │
│  M3: Reports Module               │                             │
│      (Riportok, lekérdezések)     │                             │
├───────────────────────────────────┤                             │
│  M4: Catalog Admin                │                             │
│      (Termékfelvitel)             │                             │
└───────────────────────────────────┴─────────────────────────────┘
```

### 2.2 Rental vs Subrental - Logikai Különbség

| Szempont | M1: Rental | M2: Subrental |
|----------|------------|---------------|
| **Tulajdonos** | Saját cég | Külső beszállító |
| **Készletnyilvántartás** | Fix darabszám (pl. 5 db) | Nincs - mindig elérhető |
| **Készlet csökken bérléskor** | Igen | Nem (csak adminisztráció) |
| **Publikus megjelenés** | Igen | Nem |
| **Jövőbeli elérhetőség kalkuláció** | Igen | Nem szükséges |
| **Beszállító nyilvántartás** | Nem | Opcionális |
| **Napi bérleti díj** | Igen (kötelező) | Igen (kötelező) |

**Subrental működési elv:** A beszerzés utólag történik, adminisztratív célból rögzítjük a bérlést. Minden termék azonnal elérhetőnek tekinthető.

### 2.3 Bérlő Szempontja

A bérlő NEM látja a különbséget Rental és Subrental között:
- Átadás-átvételi bizonylat egységes formátumú
- Ugyanaz a minőség és szolgáltatás
- Csak belső adminisztráció különbözteti meg

---

## 3. Adatbázis Struktúra (Supabase)

### 3.1 Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────┐
│    categories    │     │     products     │
├──────────────────┤     ├──────────────────┤
│ id (PK)          │◄────┤ category_id (FK) │
│ name_en          │     │ id (PK)          │
│ name_hu          │     │ name_en          │
│ parent_id (FK)   │     │ name_hu          │
│ sort_order       │     │ description_en   │
└──────────────────┘     │ description_hu   │
                         │ sku              │
                         │ rental_type      │
                         │ own_stock        │
                         │ is_public        │
                         │ images[]         │
                         │ daily_rate       │
                         └────────┬─────────┘
                                  │
                                  │ 1:N
                                  ▼
                    ┌─────────────────────────┐
                    │   product_components    │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ parent_product_id (FK)  │
                    │ component_product_id(FK)│
                    │ is_required             │
                    │ default_quantity        │
                    └─────────────────────────┘

┌──────────────────┐     ┌──────────────────────┐
│     clients      │     │       rentals        │
├──────────────────┤     ├──────────────────────┤
│ id (PK)          │◄────┤ client_id (FK)       │
│ name             │     │ id (PK)              │
│ company          │     │ rental_type          │
│ email            │     │ project_name         │
│ phone            │     │ start_date           │
│ address          │     │ end_date             │
│ tax_number       │     │ status               │
│ notes            │     │ reminder_sent        │
└──────────────────┘     │ notes                │
                         │ created_by (FK)      │
                         └──────────┬───────────┘
                                    │
                                    │ 1:N
                                    ▼
                         ┌──────────────────────┐
                         │    rental_items      │
                         ├──────────────────────┤
                         │ id (PK)              │
                         │ rental_id (FK)       │
                         │ product_id (FK)      │
                         │ quantity             │
                         │ components[]         │
                         │ return_status        │
                         │ return_condition     │
                         │ return_notes         │
                         │ returned_at          │
                         └──────────────────────┘

┌──────────────────┐
│      users       │
├──────────────────┤
│ (Supabase Auth)  │
│ id               │
│ email            │
│ role             │
└──────────────────┘
```

### 3.2 Táblák Részletes Leírása

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_hu TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,                           -- Cikkszám (előkészítve, jelenleg opcionális)
  serial_number TEXT,                        -- Sorozatszám (előkészítve, jelenleg opcionális)
  qr_code TEXT,                              -- QR kód (előkészítve, jelenleg opcionális)
  name_en TEXT NOT NULL,
  name_hu TEXT NOT NULL,
  description_en TEXT,
  description_hu TEXT,
  category_id UUID REFERENCES categories(id),
  rental_type TEXT CHECK (rental_type IN ('rental', 'subrental', 'both')) DEFAULT 'rental',
  own_stock INTEGER DEFAULT 0,               -- Csak rental-nál releváns
  is_public BOOLEAN DEFAULT false,           -- Megjelenik-e publikusan
  images TEXT[],                             -- Supabase Storage URL-ek
  daily_rate DECIMAL(10,2),                  -- Napi bérleti díj (TÁJÉKOZTATÓ!)
  daily_rate_currency TEXT DEFAULT 'EUR' CHECK (daily_rate_currency IN ('EUR', 'HUF', 'USD')),
  specifications JSONB,                      -- Technikai adatok
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**FONTOS:** A `daily_rate` csak tájékoztató jellegű! Filmipari sajátosságok miatt minden esetben egyedi árképzés történik. Az átadás-átvételi bizonylaton a végösszeg kézzel kerül megadásra.

#### product_components
```sql
CREATE TABLE product_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  component_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,         -- Kötelező alkatrész
  default_quantity INTEGER DEFAULT 1,
  has_own_stock BOOLEAN DEFAULT false,       -- Van-e saját készlete az alkatrésznek
  UNIQUE(parent_product_id, component_product_id)
);
```

**Alkatrész típusok:**
1. **Logikai alkatrész** (`has_own_stock = false`): Csak a fő termékhez tartozik, nincs külön készletszáma
2. **Készletezett alkatrész** (`has_own_stock = true`): Saját készletszámmal rendelkezik (pl. tartalék akkuk)

#### clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### rentals
```sql
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_number TEXT UNIQUE,                 -- Bérlési azonosító (auto-generated)
  client_id UUID REFERENCES clients(id),
  rental_type TEXT CHECK (rental_type IN ('rental', 'subrental')) NOT NULL,
  project_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,
  status TEXT CHECK (status IN ('draft', 'active', 'overdue', 'returned', 'cancelled')) DEFAULT 'draft',
  -- Árképzés (egyedi, kézzel megadott)
  final_total DECIMAL(12,2),                 -- Végösszeg (kézzel megadva)
  final_currency TEXT DEFAULT 'EUR' CHECK (final_currency IN ('EUR', 'HUF', 'USD')),
  -- Értesítések
  reminder_sent BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 2,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### rental_items
```sql
CREATE TABLE rental_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_components UUID[] DEFAULT '{}',   -- Kiválasztott alkatrészek
  return_status TEXT CHECK (return_status IN ('pending', 'returned', 'partial')) DEFAULT 'pending',
  return_condition TEXT CHECK (return_condition IN ('ok', 'damaged', 'missing_parts')),
  return_notes TEXT,
  returned_quantity INTEGER DEFAULT 0,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### rental_item_suppliers (Subrental beszállító tracking)
```sql
-- Egy bérlési tételhez több beszállító is tartozhat
-- (pl. 10 db lámpa: 6 db A beszállítótól, 4 db B beszállítótól)
CREATE TABLE rental_item_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_item_id UUID REFERENCES rental_items(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,       -- Hány db ettől a beszállítótól
  supplier_cost DECIMAL(10,2),               -- Beszerzési költség (opcionális)
  supplier_currency TEXT DEFAULT 'EUR' CHECK (supplier_currency IN ('EUR', 'HUF', 'USD')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Példa használat:**
```
Bérlés: "XY Film projekt" (Subrental)
├── Rental item: Arri M40 HMI × 10 db
│   ├── Supplier A: 6 db (€200/db)
│   └── Supplier B: 4 db (€180/db)
```

#### inventory_logs
```sql
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  rental_id UUID REFERENCES rentals(id),
  action TEXT CHECK (action IN ('rent_out', 'return', 'adjust', 'add', 'remove')),
  quantity_change INTEGER,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 Jelenlegi Kategória Struktúra (inlight.hu-ról)

```
📁 Lights (Lámpák)
├── Aputure
├── Arri
├── Astera
├── Lightstar
├── Profile spot
│   ├── ETC
│   └── Strand
├── Tungsten
├── Balloons
└── Accessories

📁 DMX Lighting Control
├── Lighting Control Desks
├── Wireless DMX System
├── DMX Accessories
└── DMX Cables

📁 Batteries

📁 Communication (Radios)

📁 Dimmers

📁 Distros & Cabelling

📁 Frames & Flags
├── Gel Frame
├── Butterfly Frames
├── Butterflies (materials)
├── Flags
└── Frames Support

📁 Lighting Support
├── Arms & Heads
├── Clamps & Plates
├── Ladder
├── Tent
├── Boom arms
└── Stand Adapters

📁 Stands

📁 Generator

📁 Rigging

📁 Carts

📁 Vehicles
```

**Megjegyzés:** Ez a struktúra importálható lesz a meglévő WooCommerce adatbázisból.

### 3.4 Views - Készletkérdések

#### current_stock_view
```sql
CREATE VIEW current_stock_view AS
SELECT 
  p.id,
  p.name_en,
  p.name_hu,
  p.own_stock,
  p.own_stock - COALESCE(
    (SELECT SUM(ri.quantity - ri.returned_quantity)
     FROM rental_items ri
     JOIN rentals r ON ri.rental_id = r.id
     WHERE ri.product_id = p.id 
       AND r.rental_type = 'rental'
       AND r.status IN ('active', 'overdue')
       AND ri.return_status != 'returned'
    ), 0
  ) AS available_stock,
  p.rental_type
FROM products p
WHERE p.rental_type IN ('rental', 'both');
```

#### future_availability_function
```sql
CREATE FUNCTION get_future_availability(
  p_product_id UUID,
  p_target_date DATE
) RETURNS INTEGER AS $$
DECLARE
  base_stock INTEGER;
  rented_out INTEGER;
  returning_before INTEGER;
BEGIN
  -- Alap készlet
  SELECT own_stock INTO base_stock
  FROM products WHERE id = p_product_id;
  
  -- Jelenleg kint lévő
  SELECT COALESCE(SUM(ri.quantity - ri.returned_quantity), 0) INTO rented_out
  FROM rental_items ri
  JOIN rentals r ON ri.rental_id = r.id
  WHERE ri.product_id = p_product_id
    AND r.rental_type = 'rental'
    AND r.status IN ('active', 'overdue')
    AND ri.return_status != 'returned';
  
  -- Addig visszaérkezők
  SELECT COALESCE(SUM(ri.quantity - ri.returned_quantity), 0) INTO returning_before
  FROM rental_items ri
  JOIN rentals r ON ri.rental_id = r.id
  WHERE ri.product_id = p_product_id
    AND r.rental_type = 'rental'
    AND r.status IN ('active', 'overdue')
    AND ri.return_status != 'returned'
    AND r.end_date <= p_target_date;
  
  RETURN base_stock - rented_out + returning_before;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Funkcionális Követelmények

### 4.1 M1: Rental Module

#### Bérlés létrehozása
1. Bérlő kiválasztása (vagy új felvitele)
2. Projekt megnevezése
3. Kezdő és záró dátum beállítása (naptár)
4. Termékek kiválasztása
   - Kategória szűrés
   - Keresés
   - Elérhetőség ellenőrzés (készlet figyelembe vételével)
5. Alkatrészek/kiegészítők kijelölése (checkbox)
6. Mennyiség megadása
7. Mentés mint vázlat vagy véglegesítés

#### Bérlés módosítása
- Dátumok módosítása
- Termékek hozzáadása/eltávolítása
- Státusz változtatás

#### Visszavétel
- Tételenkénti visszavétel
- Állapot rögzítése:
  - ✅ Rendben
  - ⚠️ Sérült (+ megjegyzés)
  - ❌ Hiányos alkatrészek (checkbox lista)
- Részleges visszavétel kezelése

### 4.2 M2: Subrental Module

Ugyanazok a funkciók mint M1, kivéve:
- Nincs készletellenőrzés
- Beszállító megadása (opcionális mező)
- Beszerzési költség (opcionális)

### 4.3 M3: Reports Module

#### Lekérdezések
- Dátum intervallum
- Termék/kategória
- Bérlő
- Projekt
- Modul (rental/subrental/mindkettő)
- Státusz

#### Exportok
- Excel (.xlsx)
- PDF
- Word (.docx)
- Google Sheets (API)
- Google Drive / iCloud (OAuth)

#### Heti riport
- Automatikus push notification péntekenként
- Letölthető formátum
- Készletmozgás összesítő

#### Leltár
- Aktuális készlet
- Hibás/sérült tételek külön
- Kint lévő tételek listája

### 4.4 M4: Catalog Admin

#### Termék felvitel
- Alapadatok (név, leírás - kétnyelvű)
- Kategória választás
- Típus (rental/subrental/both)
- Készlet (rental esetén)
- Képfeltöltés
- Alkatrészek/kiegészítők hozzárendelése
- Publikus megjelenés beállítása

#### Kategória kezelés
- Hierarchikus kategóriák
- Sorrend módosítása
- Új kategória felvitele

### 4.5 Publikus oldal

- Termékek listázása (csak `is_public = true`)
- Kategória szűrés
- Képgaléria
- Specifikációk
- **Napi bérleti díj megjelenítése** (€/nap formátumban)
- Kapcsolatfelvétel (form)

#### Átveendő tartalmak az inlight.hu-ról:

**Contact oldal:**
- About Renting: rental@inlight.hu
- About Billing: office@inlight.hu
- About any additional Information: info@inlight.hu
- Tel: +36203348823

**About Us oldal:**
- Dániel Tóth - Gaffer (CV, IMDB link, tapasztalat)
- Gergely Sztellik - Rigging gaffer
- Cég leírás, referenciák

**Branding:**
- Logo: inlight.hu logó
- Szlogen: "Professional Lighting & Gaffer Service for the film industry"
- Copyright: iNLighT Kft.

---

## 5. Értesítések

### 5.1 Bérleti emlékeztető

**Trigger:** `end_date - reminder_days_before = today`

**Tartalom:**
- Bérlő neve
- Projekt
- Lejárat dátuma
- Termékek listája (egyszerűsített)

**Csatornák:**
- Push notification (PWA)
- Email (opcionális)

### 5.2 Heti riport

**Trigger:** Péntek 18:00

**Tartalom:**
- Kiadott tételek (előző péntek óta)
- Visszaérkezett tételek
- Készlet összesítő

---

## 6. Átadás-Átvételi Bizonylat

### Tartalmazott adatok:
- Bizonylat sorszám (auto-generated)
- Dátum
- Bérlő adatai (név, cég, cím, adószám)
- Projekt neve
- Bérlési időszak (kezdet - vége)
- Termékek listája:
  - Termék neve
  - Darabszám
  - Kiválasztott alkatrészek/kiegészítők
- **Végösszeg** (kézzel megadott, nem kalkulált!)
- **Pénznem** (EUR / HUF / USD)
- Aláírás mezők (átadó / átvevő)
- QR kód (opcionális - bérlés azonosításhoz)

### NEM tartalmazza:
- Rental/Subrental megkülönböztetés
- Belső megjegyzések
- Tételes napi díjak (mert az egyedi árképzés miatt irreleváns)
- Beszállítói információk

### Generálási jogosultság:
Csak **super_admin** szerepkörrel rendelkező felhasználók generálhatnak átadás-átvételi bizonylatot.

---

## 7. Technológiai Stack

```
Frontend:
├── React 18+
├── TypeScript
├── Vite (build tool)
├── TailwindCSS
├── shadcn/ui
├── react-i18next (i18n)
├── react-hook-form + zod (validáció)
├── @tanstack/react-query (adatkezelés)
├── date-fns (dátumkezelés)
├── react-big-calendar (naptár)
└── Workbox (PWA/Service Worker)

Backend:
├── Supabase
│   ├── PostgreSQL (adatbázis)
│   ├── Auth (autentikáció)
│   ├── Storage (képek)
│   ├── Edge Functions (emlékeztetők, riportok)
│   └── Realtime (opcionális)
└── Resend (email küldés)

Export:
├── xlsx (Excel)
├── jspdf + jspdf-autotable (PDF)
├── docx (Word)
└── Google APIs (Sheets, Drive)
```

---

## 8. Felhasználói jogosultságok

| Szerep | Leírás | Fő száma |
|--------|--------|----------|
| super_admin | Teljes hozzáférés | 3 fő |
| admin | Bérlés adminisztráció | 2 fő |

### Részletes jogosultságok:

**super_admin:**
- Minden funkció elérhető
- Termék/kategória kezelés
- Átadás-átvételi bizonylat generálás
- Export funkciók
- Felhasználó kezelés
- Beszállító kezelés

**admin:**
- Dashboard megtekintés
- Új bérlés létrehozása
- Bérlés módosítása
- Visszavétel kezelése
- Készlet megtekintés
- Lekérdezések (M3) - csak megtekintés

---

## 9. Következő lépések

1. ✅ Specifikáció véglegesítése
2. ⏳ Supabase projekt létrehozása
3. ⏳ Adatbázis séma implementálása
4. ⏳ React projekt inicializálása
5. ⏳ Autentikáció implementálása
6. ⏳ Termékkatalógus modul
7. ⏳ Rental modul
8. ⏳ Subrental modul
9. ⏳ Reports modul
10. ⏳ Publikus oldal
11. ⏳ PWA konfiguráció
12. ⏳ Edge Functions (értesítések)
13. ⏳ Tesztelés
14. ⏳ Netlify deploy

---

## 10. Véglegesített döntések

### ✅ Minden kérdés megválaszolva:

| Kérdés | Döntés |
|--------|--------|
| Subrental készlet | Nincs - minden azonnal elérhető |
| Alkatrészek készlete | Mindkét típus támogatott |
| SKU/QR | Előkészítve, jelenleg nem használt |
| Napi bérleti díj | Csak tájékoztató jellegű (egyedi árképzés) |
| Árkalkuláció/Számla | NEM kell - végösszeg kézzel megadva |
| Beszállítók | Igen, több beszállító/termék/bérlés |
| Felhasználók | 3 super_admin + 2 admin |
| Adatmigráció | WooCommerce import (129 termék) |
| Domain | Supabase + Netlify (később esetleg inlight.hu) |
| Átadás-átvételi | Új sablon készítése |
| Pénznemek | EUR, HUF, USD |

---

## 11. Jogosultsági Mátrix

| Funkció | super_admin | admin |
|---------|-------------|-------|
| Dashboard | ✅ | ✅ |
| Új bérlés létrehozása | ✅ | ✅ |
| Bérlés módosítása | ✅ | ✅ |
| Visszavétel kezelése | ✅ | ✅ |
| Készlet megtekintése | ✅ | ✅ |
| Lekérdezések (M3) | ✅ | ✅ |
| Export (Excel, PDF, stb.) | ✅ | ❌ |
| Új termék felvitele | ✅ | ❌ |
| Termék szerkesztése | ✅ | ❌ |
| Kategória kezelés | ✅ | ❌ |
| Átadás-átvételi generálás | ✅ | ❌ |
| Felhasználó kezelés | ✅ | ❌ |
| Beszállító kezelés | ✅ | ❌ |

---

## 12. Következő Lépések

### Fázis 1: Alapok (most)
1. ⏳ Supabase projekt létrehozása
2. ⏳ Adatbázis séma implementálása
3. ⏳ React projekt inicializálása (Vite + TypeScript)
4. ⏳ Autentikáció és jogosultságkezelés
5. ⏳ Alapvető UI komponensek (shadcn/ui)

### Fázis 2: Termékkatalógus
6. ⏳ Kategória CRUD
7. ⏳ Termék CRUD + képfeltöltés
8. ⏳ Alkatrész kezelés
9. ⏳ WooCommerce migráció script

### Fázis 3: Bérlés modulok
10. ⏳ Rental modul (M1)
11. ⏳ Subrental modul (M2)
12. ⏳ Beszállító kezelés
13. ⏳ Naptár integráció
14. ⏳ Készlet kalkuláció

### Fázis 4: Riportok és export
15. ⏳ Reports modul (M3)
16. ⏳ Átadás-átvételi bizonylat generálás
17. ⏳ Export funkciók
18. ⏳ Heti riport automatizmus

### Fázis 5: Publikus oldal és PWA
19. ⏳ Publikus terméklista
20. ⏳ About Us, Contact oldalak
21. ⏳ PWA konfiguráció
22. ⏳ Netlify deploy

### Fázis 6: Finomhangolás
23. ⏳ i18n (EN/HU)
24. ⏳ Push értesítések
25. ⏳ Tesztelés
26. ⏳ Dokumentáció
