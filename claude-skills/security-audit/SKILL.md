---
name: security-audit
description: |
  Biztonsági audit workflow az iNLighT Rental Manager projekthez.
  Használd amikor: biztonsági ellenőrzés szükséges, RLS policy audit,
  auth security review, input validáció ellenőrzés, dependency audit,
  vagy production release előtti security check.
---

# Security Audit Skill

## Audit Típusok

1. **RLS Policy Audit** - Adatbázis hozzáférés ellenőrzés
2. **Auth Security** - Autentikáció és authorizáció
3. **Input Validation** - Beviteli adatok validálása
4. **Dependency Audit** - Külső csomagok sebezhetőségei
5. **OWASP Top 10** - Általános webes sebezhetőségek

---

## 1. RLS Policy Audit

### Ellenőrzési Lista

```sql
-- 1. Minden táblán engedélyezve van az RLS?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 2. Van-e policy minden táblán?
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 3. Nincs-e "true" policy (mindent engedélyező)?
SELECT * FROM pg_policies 
WHERE qual::text = 'true' OR with_check::text = 'true';
```

### Követelmények

| Tábla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| products | public (is_public) / auth | super_admin | super_admin | super_admin |
| categories | auth | super_admin | super_admin | super_admin |
| clients | auth | auth | super_admin | super_admin |
| rentals | auth | auth | auth | super_admin |
| rental_items | auth | auth | auth | super_admin |
| suppliers | auth | super_admin | super_admin | super_admin |
| user_profiles | self/super_admin | super_admin | super_admin | super_admin |

### RLS Bypass Ellenőrzés

```sql
-- Service role NEM használható frontend-ről!
-- Ellenőrizd, hogy csak ANON_KEY van a frontend-en

-- Teszteld: anon user nem férhet hozzá védett adatokhoz
SET ROLE anon;
SELECT * FROM rentals; -- Üres kell legyen
RESET ROLE;
```

---

## 2. Auth Security

### JWT Konfiguráció

```typescript
// Ellenőrizd a Supabase Dashboard-on:
// - JWT expiry time (ajánlott: 1 óra)
// - Refresh token rotation enabled
// - Secure session handling
```

### Session Kezelés Checklist

- [ ] HttpOnly cookies használata
- [ ] Secure flag beállítva (HTTPS only)
- [ ] SameSite=Strict vagy Lax
- [ ] Session timeout implementálva
- [ ] Logout minden session-t invalidál

### Role Ellenőrzés Pattern

```typescript
// MINDIG server-side ellenőrzés!
// Ne bízz a frontend-ről jövő role-ban

// ❌ ROSSZ
const isAdmin = user.role === 'admin' // Frontend-ről jön

// ✅ JÓ
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', user.id)
  .single()

const isAdmin = profile?.role === 'admin'
```

### Password Policy

```typescript
// Supabase Auth konfiguráció
// Dashboard > Authentication > Policies

// Minimum követelmények:
// - 8+ karakter
// - Legalább 1 nagybetű
// - Legalább 1 szám
// - Legalább 1 speciális karakter
```

---

## 3. Input Validation

### Zod Schema Követelmények

```typescript
// MINDEN user input-nak kell Zod schema!

// ❌ ROSSZ - nincs validáció
const handleSubmit = (data: any) => {
  supabase.from('rentals').insert(data)
}

// ✅ JÓ - Zod validáció
const rentalSchema = z.object({
  client_id: z.string().uuid(),
  project_name: z.string().min(1).max(255),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  final_total: z.number().positive().optional(),
  final_currency: z.enum(['EUR', 'HUF', 'USD']),
})

const handleSubmit = (data: unknown) => {
  const validated = rentalSchema.parse(data)
  supabase.from('rentals').insert(validated)
}
```

### SQL Injection Védelem

```typescript
// Supabase automatikusan escapeli, DE:

// ❌ ROSSZ - raw SQL string interpolation
const query = `SELECT * FROM products WHERE name = '${userInput}'`

// ✅ JÓ - Supabase query builder
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name_en', `%${userInput}%`)

// ✅ JÓ - Parameterized query
const { data } = await supabase.rpc('search_products', {
  search_term: userInput
})
```

### XSS Védelem

```typescript
// React automatikusan escapeli, DE:

// ❌ ROSSZ - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ JÓ - Text content
<div>{userContent}</div>

// Ha HTML kell, használj sanitizer-t:
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

---

## 4. Dependency Audit

### NPM Audit

```bash
# Sebezhetőségek ellenőrzése
npm audit

# Automatikus javítás (ha lehetséges)
npm audit fix

# Részletes jelentés
npm audit --json > audit-report.json
```

### Kritikus Csomagok

| Csomag | Ellenőrzés |
|--------|------------|
| @supabase/supabase-js | Legfrissebb verzió? |
| react | Security advisories? |
| vite | Build tool vulnerabilities? |
| zod | Validation bypass issues? |

### Lockfile Integrity

```bash
# package-lock.json integritás
npm ci --ignore-scripts
```

---

## 5. OWASP Top 10 Checklist

### A01: Broken Access Control
- [x] RLS engedélyezve minden táblán
- [x] Role-based policy-k implementálva
- [x] Server-side authorization ellenőrzés
- [ ] CORS megfelelően konfigurálva

### A02: Cryptographic Failures
- [x] HTTPS kötelező (Netlify/Supabase)
- [x] Jelszavak hash-elve (Supabase Auth)
- [ ] Sensitive data encryption at rest
- [x] JWT megfelelően konfigurálva

### A03: Injection
- [x] Parameterized queries (Supabase)
- [x] Input validation (Zod)
- [ ] Content Security Policy headers

### A04: Insecure Design
- [x] Rate limiting (Supabase)
- [x] Principle of least privilege
- [ ] Threat modeling dokumentálva

### A05: Security Misconfiguration
- [ ] Default credentials eltávolítva
- [ ] Error messages nem fedik fel részleteket
- [ ] Unused features disabled
- [ ] Security headers beállítva

### A06: Vulnerable Components
- [ ] npm audit clean
- [ ] Dependencies up to date
- [ ] No known vulnerabilities

### A07: Auth Failures
- [x] Strong password policy
- [x] Session management
- [x] Multi-factor auth (opcionális)
- [ ] Account lockout policy

### A08: Data Integrity
- [x] Input validation
- [x] Output encoding
- [ ] Integrity checks on critical data

### A09: Logging & Monitoring
- [ ] Security events logged
- [ ] Alerting configured
- [ ] Log retention policy

### A10: SSRF
- [x] URL validation (ha külső URL-ek kezelése)
- [x] Whitelist for external requests

---

## 6. Security Headers

### Netlify Headers Konfiguráció

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co"
```

---

## 7. Audit Report Template

```markdown
# Security Audit Report
**Projekt:** iNLighT Rental Manager
**Dátum:** YYYY-MM-DD
**Auditor:** [Name]

## Összefoglaló
- Kritikus: X
- Magas: X
- Közepes: X
- Alacsony: X

## Talált Problémák

### [KRITIKUS] Probléma címe
**Leírás:** ...
**Érintett:** ...
**Javítás:** ...
**Státusz:** Nyitott/Javítva

### [MAGAS] Probléma címe
...

## Javaslatok
1. ...
2. ...

## Következő Audit
**Tervezett dátum:** YYYY-MM-DD
```

---

## Parancsok

```bash
# Teljes security audit
npm run security:audit

# RLS ellenőrzés (Supabase MCP)
# supabase_execute_sql: SELECT * FROM pg_policies...

# Dependency audit
npm audit

# OWASP ZAP scan (külső tool)
zap-cli quick-scan --self-contained http://localhost:5173
```

## Pre-Release Checklist

- [ ] RLS audit completed
- [ ] Auth security verified
- [ ] Input validation 100%
- [ ] npm audit clean (no critical/high)
- [ ] Security headers configured
- [ ] OWASP Top 10 reviewed
- [ ] Audit report generated
