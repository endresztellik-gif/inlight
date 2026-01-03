# E2E Test Setup Instructions

## ⚠️ FONTOS: Teszt Felhasználók Létrehozása

A Playwright E2E tesztek futtatásához szükséges **teszt felhasználók létrehozása** a Supabase-ben.

---

## 1. Lépés: Supabase Dashboard - Auth Felhasználók Létrehozása

Menj a **Supabase Dashboard** → **Authentication** → **Users** oldalra:

https://supabase.com/dashboard/project/njqkdsoccdosydidmkqj/auth/users

### Teszt Super Admin Felhasználó

1. Kattints a **"Add user" → "Create new user"** gombra
2. Töltsd ki a mezőket:
   - **Email**: `admin@inlight.hu` (vagy bármilyen teszt email)
   - **Password**: `Test1234!` (vagy egyedi biztonságos jelszó)
   - **Auto Confirm Email**: ✅ (Bejelölni!)
3. Kattints a **"Create user"** gombra
4. **Jegyezd fel a létrehozott user UUID-t** (pl.: `12345678-1234-1234-1234-123456789012`)

### Teszt Admin Felhasználó (opcionális)

Ismételd meg a fenti lépéseket:
- **Email**: `admin2@inlight.hu`
- **Password**: `Test1234!`
- **Auto Confirm Email**: ✅

---

## 2. Lépés: User Profiles Hozzáadása az Adatbázishoz

A létrehozott Auth felhasználókhoz szükséges **user_profiles** rekordok hozzáadása.

### SQL Script Futtatása

Menj a **Supabase Dashboard** → **SQL Editor** oldalra:

https://supabase.com/dashboard/project/njqkdsoccdosydidmkqj/sql/new

Másold be és futtasd le az alábbi SQL-t (cseréld ki az UUID-ket az előbb létrehozott user-ek ID-jére):

```sql
-- Super Admin User Profile
INSERT INTO user_profiles (id, email, full_name, role, is_active)
VALUES (
  'SUPER_ADMIN_USER_UUID',  -- ⚠️ CSERÉLD KI a Dashboard-ról kapott UUID-re
  'admin@inlight.hu',
  'Test Super Admin',
  'super_admin',
  TRUE
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = EXCLUDED.role;

-- Admin User Profile (opcionális)
INSERT INTO user_profiles (id, email, full_name, role, is_active)
VALUES (
  'ADMIN_USER_UUID',  -- ⚠️ CSERÉLD KI a Dashboard-ról kapott UUID-re
  'admin2@inlight.hu',
  'Test Admin',
  'admin',
  TRUE
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = EXCLUDED.role;
```

**Példa UUID cserére:**
```sql
-- Ha a Dashboard-on kapott UUID: 12345678-1234-1234-1234-123456789012
INSERT INTO user_profiles (id, email, full_name, role, is_active)
VALUES (
  '12345678-1234-1234-1234-123456789012',  -- ✅ LECSERÉLVE
  'admin@inlight.hu',
  'Test Super Admin',
  'super_admin',
  TRUE
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = EXCLUDED.role;
```

---

## 3. Lépés: .env.test Frissítése

Ha **más email/password kombinációt** használtál, frissítsd a `.env.test` fájlt:

```bash
# Test Super Admin User
TEST_SUPER_ADMIN_EMAIL=admin@inlight.hu  # ⚠️ CSERÉLD KI, ha más email-t használtál
TEST_SUPER_ADMIN_PASSWORD=Test1234!       # ⚠️ CSERÉLD KI, ha más jelszót használtál

# Test Admin User (opcionális)
TEST_ADMIN_EMAIL=admin2@inlight.hu
TEST_ADMIN_PASSWORD=Test1234!
```

---

## 4. Lépés: Tesztek Futtatása

Most már futtathatod az E2E teszteket:

```bash
npm run test:e2e
```

### Mit csinál a global setup?

A `tests/global-setup.ts` automatikusan:
1. Betölti a `.env.test` fájlt
2. Bejelentkezik a teszt super admin felhasználóval
3. Elmenti az auth session-t `.auth/user.json` fájlba
4. Minden teszt automatikusan ezt a session-t használja (nem kell újra bejelentkezni)

---

## Troubleshooting

### ❌ "Invalid login credentials" hiba

**Probléma:** A `.env.test` fájlban megadott email/password nem egyezik a Supabase-ben létrehozott felhasználóval.

**Megoldás:**
1. Ellenőrizd a Supabase Dashboard → Authentication → Users oldalon, hogy létezik-e a felhasználó
2. Próbálj meg manuálisan bejelentkezni az applikációba az adott email/password kombinációval
3. Ha nem működik, reset-eld a jelszót a Dashboard-on, vagy hozz létre új felhasználót

### ❌ "RLS policy violation" hiba

**Probléma:** A user_profiles tábla nem tartalmazza a létrehozott felhasználót, vagy a role nem megfelelő.

**Megoldás:**
1. Ellenőrizd az SQL Editor-ban:
   ```sql
   SELECT id, email, role FROM user_profiles WHERE email = 'admin@inlight.hu';
   ```
2. Ha nincs eredmény, futtasd le a 2. lépésben megadott SQL script-et
3. Ellenőrizd, hogy az `id` megegyezik-e az Auth user UUID-jével

### ❌ Test timeout

**Probléma:** A dev server nem fut, vagy más port-on fut.

**Megoldás:**
1. Győződj meg róla, hogy a dev server fut: `npm run dev`
2. Ellenőrizd, hogy a `http://localhost:5175` címen elérhető
3. Ha más port-on fut, frissítsd a `playwright.config.ts` fájlt

---

## GYIK

**Q: Használhatom a meglévő admin felhasználómat a tesztekhez?**
A: Igen! Csak frissítsd a `.env.test` fájlt a meglévő email/password kombinációddal. Azonban javasolt külön teszt felhasználók létrehozása, mert a tesztek módosíthatják az adatokat (létrehoznak/törölnek bérléseket, stb.).

**Q: Minden tesztnél újra be kell jelentkezni?**
A: Nem! A global setup egyszer bejelentkezik, és elmenti az auth session-t. Minden teszt ezt a session-t újrahasználja.

**Q: Mi történik az .auth/user.json fájllal?**
A: Ez a fájl tartalmazza az auth cookies-okat és localStorage adatokat. Git ignore-olva van, hogy ne kerüljön be a repo-ba. Minden teszt futtatásnál újra generálódik.

**Q: Törölhetem a teszt adatokat?**
A: Igen! A tesztek által létrehozott adatok (rentals, clients, stb.) kézileg törölhetők az adatbázisból, vagy létrehozhatsz egy cleanup script-et.

---

**Kész!** Most már futtathatod az E2E teszteket.
