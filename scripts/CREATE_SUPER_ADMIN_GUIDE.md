# 🔐 Super Admin Felhasználó Létrehozása

## Új Super Admin Adatok:
- **Email:** admin@inlight.hu
- **Teljes név:** Sztellik Gergely
- **Jelszó:** geri_2026
- **Szerepkör:** super_admin

---

## ✅ Opció 1: Supabase Dashboard (GYORS - 2 perc)

### Lépés 1: Felhasználó létrehozása Supabase-ben

1. Menj a Supabase Dashboard-ra:
   **https://supabase.com/dashboard/project/njqkdsoccdosydidmkqj**

2. Navigálj: **Authentication** → **Users**

3. Kattints a **"Add user"** gombra (jobb felső sarok)

4. Válaszd: **"Create new user"**

5. Töltsd ki a mezőket:
   ```
   Email: admin@inlight.hu
   Password: geri_2026
   ```

6. ✅ **FONTOS:** Pipáld be az **"Auto Confirm User"** opciót!

7. Kattints **"Create user"**

8. **Másold ki a User ID-t** (UUID formátum, pl: `a1b2c3d4-e5f6-...`)

---

### Lépés 2: User Profile létrehozása SQL-lel

1. Supabase Dashboard-on menj: **SQL Editor**

2. Kattints **"New query"**

3. Illeszd be a következő SQL-t (cseréld ki a USER_ID-t a Lépés 1.8-ban kimásolt értékre):

```sql
-- Cseréld ki a 'PASTE_USER_ID_HERE'-t a valódi User ID-ra!
DO $$
DECLARE
  v_user_id UUID := 'PASTE_USER_ID_HERE'; -- <-- IDE MÁSOLD BE A USER ID-T!
  v_email VARCHAR := 'admin@inlight.hu';
  v_full_name VARCHAR := 'Sztellik Gergely';
  v_role VARCHAR := 'super_admin';
BEGIN
  -- Ellenőrzi, hogy létezik-e már
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = v_user_id) THEN
    -- Ha igen, frissít
    UPDATE user_profiles
    SET
      email = v_email,
      full_name = v_full_name,
      role = v_role,
      is_active = true,
      updated_at = now()
    WHERE id = v_user_id;
    RAISE NOTICE 'User profile frissítve!';
  ELSE
    -- Ha nem, létrehoz újat
    INSERT INTO user_profiles (id, email, full_name, role, is_active)
    VALUES (v_user_id, v_email, v_full_name, v_role, true);
    RAISE NOTICE 'User profile létrehozva!';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Super Admin Created:';
  RAISE NOTICE '  Email: %', v_email;
  RAISE NOTICE '  Name: %', v_full_name;
  RAISE NOTICE '  Role: %', v_role;
  RAISE NOTICE '========================================';
END $$;

-- Ellenőrzés
SELECT id, email, full_name, role, is_active, created_at
FROM user_profiles
WHERE email = 'admin@inlight.hu';
```

4. Kattints **"Run"**

5. Ellenőrizd a Results tab-ot - látnod kell az új felhasználót!

---

### Lépés 3: Bejelentkezés tesztelése

1. Nyisd meg az alkalmazást: **http://localhost:5177/login**

2. Jelentkezz be:
   ```
   Email: admin@inlight.hu
   Password: geri_2026
   ```

3. ✅ Ellenőrizd, hogy:
   - Be tudsz lépni
   - Látod az **Admin** menüpontot (Categories, Products)
   - Settings-ben látod a "super_admin" szerepkört

4. **🔒 FONTOS:** Változtasd meg a jelszót!
   Menj: **Settings** → **Security** → Új jelszó megadása

---

## 🛠️ Opció 2: Automatizált Script (Haladóknak)

### Előfeltétel: Service Role Key megszerzése

1. Supabase Dashboard: **Settings** → **API**
2. Másold ki a **`service_role` key**-t (⚠️ Titkos kulcs - ne oszd meg!)
3. Add hozzá a `.env` fájlhoz:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Script futtatása

```bash
# 1. Futtasd a TypeScript scriptet
npx tsx scripts/create-super-admin.ts

# 2. A script automatikusan:
#    - Létrehozza az auth usert
#    - Létrehozza a user_profiles bejegyzést
#    - Ellenőrzi a létrehozást
```

---

## 🎉 Kész!

Az új super admin felhasználó készen áll a használatra!

### Következő lépések:
1. ✅ Bejelentkezés az új fiókkal
2. 🔒 Jelszó megváltoztatása (Settings → Security)
3. 👤 Profil kitöltése (Settings → Profile)

---

## 🐛 Hibaelhárítás

### "Email already registered" hiba
- A felhasználó már létezik az auth.users táblában
- Ellenőrizd: Authentication → Users → Keresd az email címet
- Ha létezik: csak a Lépés 2-t (SQL) futtasd le a meglévő User ID-val

### "User not found" hiba a bejelentkezésnél
- Ellenőrizd, hogy az "Auto Confirm User" be volt-e pipálva
- Vagy menj: Authentication → Users → Kattints a felhasználóra → "Confirm email"

### Nem látszik az Admin menü
- Ellenőrizd a user_profiles táblában: `SELECT * FROM user_profiles WHERE email = 'admin@inlight.hu'`
- A `role` oszlop értéke **'super_admin'** kell legyen
- Ha nem: `UPDATE user_profiles SET role = 'super_admin' WHERE email = 'admin@inlight.hu'`
