---
name: deployment-workflow
description: |
  Deployment workflow az iNLighT Rental Manager projekthez.
  Használd amikor: Netlify deployment, environment változók kezelése,
  CI/CD pipeline konfiguráció, preview deploys, production release,
  vagy rollback szükséges. GitHub és Netlify integráció.
---

# Deployment Workflow Skill

## Architektúra

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────►│   Netlify   │────►│  Production │
│    Repo     │     │    Build    │     │    Site     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │   Preview   │
       │            │   Deploys   │
       │            └─────────────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
│  (Backend)  │
└─────────────┘
```

## Környezetek

| Környezet | Branch | Supabase | URL |
|-----------|--------|----------|-----|
| Production | main | Production projekt | inlight-rental.netlify.app |
| Staging | develop | Staging projekt | staging--inlight-rental.netlify.app |
| Preview | PR-ek | Staging projekt | deploy-preview-X--inlight-rental.netlify.app |

---

## 1. Netlify Konfiguráció

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

# Production context
[context.production]
  command = "npm run build"
  environment = { NODE_ENV = "production" }

# Staging context (develop branch)
[context.develop]
  command = "npm run build"
  environment = { NODE_ENV = "staging" }

# Preview deploys
[context.deploy-preview]
  command = "npm run build"
  environment = { NODE_ENV = "preview" }

# Redirects for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# API proxy to Supabase (optional)
[[redirects]]
  from = "/api/*"
  to = "https://YOUR_PROJECT.supabase.co/rest/v1/:splat"
  status = 200
  force = true
  headers = {Authorization = "Bearer :SUPABASE_ANON_KEY"}
```

---

## 2. Environment Változók

### Netlify Dashboard Beállítások

```
# Production (Site settings > Environment variables)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_ENV=production

# Deploy contexts
# - Production: main branch
# - Deploy Previews: All PR-s
# - Branch deploys: develop
```

### Lokális Fejlesztés

```env
# .env.local (NEM COMMITOLNI!)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_ENV=development
```

### Environment Kezelés Kódban

```typescript
// src/lib/env.ts
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isProd: import.meta.env.VITE_APP_ENV === 'production',
  isStaging: import.meta.env.VITE_APP_ENV === 'staging',
}

// Validáció induláskor
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error('Missing required environment variables')
}
```

---

## 3. GitHub Actions CI/CD

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Security audit
        run: npm audit --audit-level=high

  e2e:
    runs-on: ubuntu-latest
    needs: [lint-and-test]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'production' }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          VITE_APP_ENV: ${{ github.event.inputs.environment || 'production' }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-branch: main
          production-deploy: ${{ github.ref == 'refs/heads/main' }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 4. Deployment Workflow

### Pre-Deploy Checklist

```bash
# 1. Tesztek futtatása
npm run test

# 2. TypeScript ellenőrzés
npm run typecheck

# 3. Lint ellenőrzés
npm run lint

# 4. Build teszt
npm run build

# 5. Security audit
npm audit

# 6. E2E tesztek (opcionális)
npm run test:e2e
```

### Manual Deploy (Netlify CLI)

```bash
# Netlify CLI telepítése
npm install -g netlify-cli

# Bejelentkezés
netlify login

# Site linkelése
netlify link

# Preview deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

### Database Migration

```bash
# 1. Migration fájl létrehozása
npx supabase migration new add_new_feature

# 2. SQL írása
# supabase/migrations/TIMESTAMP_add_new_feature.sql

# 3. Lokális tesztelés
npx supabase db reset

# 4. Production migration
npx supabase db push --db-url $SUPABASE_DB_URL
```

---

## 5. Rollback Stratégia

### Netlify Rollback

```bash
# Korábbi deploy listázása
netlify deploys

# Rollback adott deploy-ra
netlify rollback <deploy-id>

# Vagy Dashboard: Deploys > Previous deploy > Publish deploy
```

### Database Rollback

```sql
-- Migration előtt MINDIG backup!
-- Supabase Dashboard > Database > Backups

-- Manuális rollback (ha szükséges)
-- Írj DOWN migration-t minden UP mellé

-- Példa: supabase/migrations/TIMESTAMP_add_column.sql
-- UP
ALTER TABLE products ADD COLUMN new_field TEXT;

-- DOWN (külön fájlban vagy kommentben)
-- ALTER TABLE products DROP COLUMN new_field;
```

---

## 6. Monitoring

### Netlify Analytics

- Page views
- Bandwidth usage
- Build minutes
- Function invocations

### Supabase Dashboard

- Database size
- API requests
- Auth users
- Realtime connections

### Error Tracking (Javasolt)

```typescript
// Sentry integráció (opcionális)
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 0.1,
})
```

---

## 7. Post-Deploy Verification

### Health Check Script

```typescript
// scripts/health-check.ts
const checks = [
  { name: 'Homepage', url: '/' },
  { name: 'API Health', url: '/api/health' },
  { name: 'Auth Page', url: '/login' },
]

async function healthCheck(baseUrl: string) {
  for (const check of checks) {
    const response = await fetch(`${baseUrl}${check.url}`)
    console.log(`${check.name}: ${response.ok ? '✅' : '❌'} (${response.status})`)
  }
}

healthCheck('https://inlight-rental.netlify.app')
```

### Smoke Tests

```bash
# Alapvető funkciók tesztelése production-ön
npm run test:e2e -- --project=chromium tests/e2e/smoke.spec.ts
```

---

## 8. Branch Strategy

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/rental-module
        ├── feature/reports-export
        └── fix/login-issue
```

### PR Workflow

1. Feature branch létrehozása `develop`-ról
2. Fejlesztés és commitok
3. PR nyitása `develop`-ra
4. CI tesztek futnak
5. Preview deploy generálódik
6. Code review
7. Merge `develop`-ba
8. Staging tesztelés
9. PR `develop` → `main`
10. Production deploy

---

## Parancsok Összefoglaló

```bash
# Lokális fejlesztés
npm run dev

# Build
npm run build

# Preview lokálisan
npm run preview

# Netlify preview deploy
netlify deploy

# Netlify production deploy
netlify deploy --prod

# Supabase migration
npx supabase migration new <name>
npx supabase db push

# Full deploy workflow
npm run deploy:staging   # develop → staging
npm run deploy:prod      # main → production
```

## Checklist

### Pre-Deploy
- [ ] Tesztek sikeresek
- [ ] TypeScript hibamentes
- [ ] Lint hibamentes
- [ ] Build sikeres
- [ ] npm audit clean
- [ ] Environment változók beállítva

### Post-Deploy
- [ ] Health check sikeres
- [ ] Smoke tesztek sikeresek
- [ ] Nincs console error
- [ ] Analytics működik
- [ ] Rollback terv kész
