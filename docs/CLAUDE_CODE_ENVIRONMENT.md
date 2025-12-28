# iNLighT Rental Manager - Claude Code CLI Environment

## Áttekintés

Ez a dokumentum a **Claude Code CLI** (terminál) fejlesztési környezetet írja le:
- **MCP szervereket** (külső szolgáltatások integrációja)
- **Skill-eket** (speciális tudás és workflow-ok)
- **Agent workflow-okat** (automatizált fejlesztési folyamatok)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CLAUDE CODE CLI ENVIRONMENT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    CLAUDE.md (Projekt Kontextus)                     │    │
│  │  Automatikusan beolvasva minden beszélgetéskor                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         MCP SERVERS                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │    │
│  │  │ Supabase │ │  GitHub  │ │ Postgres │ │  Fetch   │               │    │
│  │  │   MCP    │ │   MCP    │ │   MCP    │ │   MCP    │               │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │    │
│  │                                                                      │    │
│  │  Konfiguráció: claude mcp add/list/remove                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      claude-skills/ MAPPA                            │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           │    │
│  │  │ inlight-rental │ │   supabase-    │ │   testing-     │           │    │
│  │  │     -pwa       │ │   workflow     │ │   workflow     │           │    │
│  │  └────────────────┘ └────────────────┘ └────────────────┘           │    │
│  │  ┌────────────────┐ ┌────────────────┐                              │    │
│  │  │   security-    │ │  deployment-   │                              │    │
│  │  │     audit      │ │    workflow    │                              │    │
│  │  └────────────────┘ └────────────────┘                              │    │
│  │                                                                      │    │
│  │  Használat: "Olvasd be a claude-skills/xyz/SKILL.md fájlt"          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. MCP Szerverek Konfigurációja (CLI)

### 1.1 MCP Hozzáadás Parancsok

```bash
# Supabase MCP (projekt scope - csak ebben a projektben)
claude mcp add supabase \
  -s project \
  -e SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  -- npx -y @supabase/mcp-server-supabase@latest

# GitHub MCP (user scope - minden projektben)
claude mcp add github \
  -s user \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_... \
  -- npx -y @modelcontextprotocol/server-github

# PostgreSQL MCP (opcionális, közvetlen DB hozzáférés)
claude mcp add postgres \
  -s project \
  -e DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" \
  -- npx -y @modelcontextprotocol/server-postgres

# MCP-k listázása
claude mcp list

# MCP eltávolítása
claude mcp remove <n>
```

### 1.2 MCP Scope-ok

| Scope | Leírás | Mikor használd |
|-------|--------|----------------|
| `project` | Csak ebben a projektben | Projekt-specifikus credentials |
| `user` | Minden projektben | Globális API kulcsok (GitHub) |

### 1.3 Supabase MCP Képességek

```
Supabase MCP Tools:
├── supabase_list_tables        - Táblák listázása
├── supabase_get_table_schema   - Séma lekérdezés
├── supabase_execute_sql        - SQL futtatás
├── supabase_list_extensions    - Extensionök
├── supabase_apply_migration    - Migráció alkalmazás
├── supabase_get_logs           - Log lekérdezés
├── supabase_list_functions     - Edge Functions
├── supabase_deploy_function    - Function deploy
├── supabase_storage_list       - Storage bucket lista
└── supabase_storage_upload     - Fájl feltöltés
```

### 1.4 GitHub MCP Képességek

```
GitHub MCP Tools:
├── github_create_repository    - Repo létrehozás
├── github_push_files           - Fájlok pusholása
├── github_create_branch        - Branch létrehozás
├── github_create_pull_request  - PR nyitás
├── github_list_issues          - Issue lista
├── github_create_issue         - Issue létrehozás
├── github_get_file_contents    - Fájl tartalom
├── github_search_code          - Kód keresés
└── github_list_commits         - Commit történet
```

---

## 2. Skill-ek Struktúrája

### 2.1 Projekt Skill Hierarchia

```
/mnt/skills/user/
├── inlight-rental-pwa/           # Fő projekt skill
│   ├── SKILL.md
│   ├── references/
│   │   ├── database_schema.sql
│   │   ├── api_endpoints.md
│   │   ├── component_library.md
│   │   └── i18n_guide.md
│   ├── scripts/
│   │   ├── setup_project.sh
│   │   ├── migrate_woocommerce.py
│   │   └── generate_types.sh
│   └── assets/
│       ├── logo.png
│       └── email_templates/
│
├── supabase-workflow/            # Supabase specifikus
│   ├── SKILL.md
│   ├── references/
│   │   ├── rls_policies.md
│   │   ├── edge_functions.md
│   │   └── realtime_setup.md
│   └── scripts/
│       ├── seed_data.sql
│       └── backup_db.sh
│
├── testing-workflow/             # Tesztelési workflow
│   ├── SKILL.md
│   ├── references/
│   │   ├── test_patterns.md
│   │   ├── e2e_scenarios.md
│   │   └── coverage_requirements.md
│   └── scripts/
│       └── run_tests.sh
│
├── security-audit/               # Biztonsági audit
│   ├── SKILL.md
│   ├── references/
│   │   ├── owasp_checklist.md
│   │   ├── auth_security.md
│   │   └── rls_audit.md
│   └── scripts/
│       └── security_scan.sh
│
└── deployment-workflow/          # Deployment
    ├── SKILL.md
    ├── references/
    │   ├── netlify_config.md
    │   ├── env_variables.md
    │   └── ci_cd_pipeline.md
    └── scripts/
        └── deploy.sh
```

---

## 3. Részletes Skill Definíciók

### 3.1 inlight-rental-pwa (Fő Projekt Skill)

**Már létrehozott** - lásd: `/home/claude/film-rental-pwa/skills/film-rental-pwa/`

Tartalmazza:
- Projekt áttekintés
- Tech stack
- Projekt struktúra
- Adatbázis séma referencia
- Fejlesztési minták

### 3.2 supabase-workflow Skill

```yaml
---
name: supabase-workflow
description: |
  Supabase backend fejlesztési workflow az iNLighT Rental Manager projekthez.
  Használd amikor: adatbázis műveletek, RLS policy-k, Edge Functions, 
  Storage kezelés, Auth konfiguráció szükséges.
---
```

**Tartalom:**
- RLS policy minták
- Edge Function sablonok
- Storage bucket konfiguráció
- Auth flow implementáció
- Realtime subscription patterns

### 3.3 testing-workflow Skill

```yaml
---
name: testing-workflow
description: |
  Tesztelési workflow az iNLighT Rental Manager projekthez.
  Használd amikor: unit tesztek, integration tesztek, E2E tesztek,
  vagy tesztelési stratégia szükséges.
---
```

**Tartalom:**
- Vitest konfiguráció
- React Testing Library patterns
- Playwright E2E tesztek
- Supabase mock patterns
- Coverage követelmények

### 3.4 security-audit Skill

```yaml
---
name: security-audit
description: |
  Biztonsági audit workflow az iNLighT Rental Manager projekthez.
  Használd amikor: biztonsági ellenőrzés, RLS audit, auth security review,
  vagy OWASP compliance check szükséges.
---
```

**Tartalom:**
- OWASP Top 10 checklist
- RLS policy audit
- Auth security patterns
- Input validation
- XSS/CSRF védelem

### 3.5 deployment-workflow Skill

```yaml
---
name: deployment-workflow
description: |
  Deployment workflow az iNLighT Rental Manager projekthez.
  Használd amikor: Netlify deploy, environment változók, 
  CI/CD pipeline, vagy production release szükséges.
---
```

**Tartalom:**
- Netlify konfiguráció
- Environment változók kezelése
- Build optimalizáció
- Preview deploys
- Rollback stratégia

---

## 4. Agent Workflow-ok

### 4.1 Frontend Agent Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND AGENT WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER: "Készíts [komponens/oldal/feature] a frontend-en"     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. SKILL BETÖLTÉS                                        │    │
│  │    ├── frontend-design SKILL.md                          │    │
│  │    └── inlight-rental-pwa/references/component_library   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 2. KONTEXTUS ELEMZÉS                                     │    │
│  │    ├── Meglévő komponensek áttekintése                   │    │
│  │    ├── Design rendszer konzisztencia                     │    │
│  │    └── i18n követelmények                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 3. IMPLEMENTÁCIÓ                                         │    │
│  │    ├── shadcn/ui komponensek használata                  │    │
│  │    ├── TypeScript típusok                                │    │
│  │    ├── TailwindCSS styling                               │    │
│  │    ├── react-hook-form + zod validáció                   │    │
│  │    └── i18n integráció                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 4. MINŐSÉG ELLENŐRZÉS                                    │    │
│  │    ├── TypeScript hibák                                  │    │
│  │    ├── ESLint warnings                                   │    │
│  │    ├── Accessibility (a11y)                              │    │
│  │    └── Responsive design                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Backend Agent Workflow (Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND AGENT WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER: "Készíts [tábla/funkció/API] a backend-en"            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. SKILL BETÖLTÉS                                        │    │
│  │    ├── supabase-workflow SKILL.md                        │    │
│  │    └── inlight-rental-pwa/references/database_schema     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 2. MCP MŰVELETEK                                         │    │
│  │    ├── supabase_get_table_schema (meglévő struktúra)    │    │
│  │    ├── supabase_execute_sql (új tábla/módosítás)        │    │
│  │    └── supabase_apply_migration (verziókezelés)         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 3. RLS POLICY IMPLEMENTÁCIÓ                              │    │
│  │    ├── Policy tervezés (role-based)                      │    │
│  │    ├── Policy implementálás                              │    │
│  │    └── Policy tesztelés                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 4. TÍPUS GENERÁLÁS                                       │    │
│  │    └── npx supabase gen types typescript                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Testing Agent Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TESTING AGENT WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER: "Teszteld [komponens/funkció/feature]"                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. TESZT TÍPUS MEGHATÁROZÁS                              │    │
│  │    ├── Unit test (izolált funkció)                       │    │
│  │    ├── Integration test (több komponens)                 │    │
│  │    └── E2E test (teljes flow)                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 2. TESZT IMPLEMENTÁCIÓ                                   │    │
│  │    ├── Vitest (unit/integration)                         │    │
│  │    ├── React Testing Library (komponensek)               │    │
│  │    ├── MSW (API mocking)                                 │    │
│  │    └── Playwright (E2E)                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 3. TESZT FUTTATÁS                                        │    │
│  │    ├── npm run test                                      │    │
│  │    ├── Coverage report                                   │    │
│  │    └── Hibák javítása                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Security Agent Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                   SECURITY AGENT WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER: "Végezz biztonsági ellenőrzést" / Release előtt       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. RLS POLICY AUDIT                                      │    │
│  │    ├── Minden tábla RLS engedélyezve?                    │    │
│  │    ├── Policy-k megfelelőek?                             │    │
│  │    └── Nincs bypass lehetőség?                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 2. AUTH SECURITY CHECK                                   │    │
│  │    ├── JWT konfiguráció                                  │    │
│  │    ├── Session kezelés                                   │    │
│  │    ├── Password policy                                   │    │
│  │    └── Role-based access                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 3. INPUT VALIDATION AUDIT                                │    │
│  │    ├── Zod schema-k minden form-on                       │    │
│  │    ├── SQL injection védelem                             │    │
│  │    └── XSS védelem                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 4. DEPENDENCY AUDIT                                      │    │
│  │    ├── npm audit                                         │    │
│  │    └── Known vulnerabilities check                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 5. SECURITY REPORT                                       │    │
│  │    ├── Talált problémák listája                          │    │
│  │    ├── Súlyosság besorolás                               │    │
│  │    └── Javítási javaslatok                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Deployment Agent Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT AGENT WORKFLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER: "Deploy [staging/production]"                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. PRE-DEPLOY CHECKS                                     │    │
│  │    ├── npm run build (sikeres?)                          │    │
│  │    ├── npm run test (mind zöld?)                         │    │
│  │    ├── TypeScript hibák (0?)                             │    │
│  │    └── Security audit (kritikus 0?)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 2. ENVIRONMENT SETUP                                     │    │
│  │    ├── Environment változók ellenőrzése                  │    │
│  │    ├── Supabase URL/Key konfigurálva                     │    │
│  │    └── Production secrets beállítva                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 3. DATABASE MIGRATION                                    │    │
│  │    ├── Pending migrations?                               │    │
│  │    ├── Backup készítés                                   │    │
│  │    └── Migration futtatás                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 4. NETLIFY DEPLOY                                        │    │
│  │    ├── Git push (GitHub MCP)                             │    │
│  │    ├── Netlify build trigger                             │    │
│  │    └── Deploy status monitoring                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 5. POST-DEPLOY VERIFICATION                              │    │
│  │    ├── Health check (API endpoints)                      │    │
│  │    ├── Smoke tests                                       │    │
│  │    └── Rollback plan (ha szükséges)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Master Orchestrator Workflow

A fejlesztés során egy "master orchestrator" koordinálja az agent-eket:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MASTER ORCHESTRATOR                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER REQUEST: "Készítsd el a Rental modul CRUD funkcióit"      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. TASK DECOMPOSITION                                    │    │
│  │    ├── Backend: táblák, RLS, API                         │    │
│  │    ├── Frontend: komponensek, formok, listák             │    │
│  │    └── Testing: unit + integration tesztek               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│           ┌───────────────┼───────────────┐                      │
│           ▼               ▼               ▼                      │
│    ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│    │  Backend   │  │  Frontend  │  │  Testing   │               │
│    │   Agent    │  │   Agent    │  │   Agent    │               │
│    └────────────┘  └────────────┘  └────────────┘               │
│           │               │               │                      │
│           └───────────────┼───────────────┘                      │
│                           ▼                                      │
│                  ┌────────────────┐                              │
│                  │Security Agent  │                              │
│                  └────────────────┘                              │
│                           │                                      │
│                           ▼                                      │
│                  ┌────────────────┐                              │
│                  │    Review &    │                              │
│                  │    Commit      │                              │
│                  └────────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Fájlstruktúra a Skills-nek

```
inlight-rental-manager/
├── .claude/
│   └── settings.json              # Claude Code projekt beállítások
├── skills/
│   ├── inlight-rental-pwa/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── database_schema.sql
│   │   │   ├── component_library.md
│   │   │   ├── api_patterns.md
│   │   │   └── i18n_keys.md
│   │   └── scripts/
│   │       └── woocommerce_migration.py
│   │
│   ├── supabase-workflow/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── rls_patterns.md
│   │       ├── edge_functions.md
│   │       └── triggers.sql
│   │
│   ├── testing-workflow/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── vitest_setup.md
│   │       ├── rtl_patterns.md
│   │       └── e2e_scenarios.md
│   │
│   ├── security-audit/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── owasp_checklist.md
│   │       ├── rls_audit_guide.md
│   │       └── auth_security.md
│   │
│   └── deployment-workflow/
│       ├── SKILL.md
│       └── references/
│           ├── netlify_setup.md
│           ├── env_management.md
│           └── ci_cd.md
│
├── src/                           # React alkalmazás
├── supabase/                      # Supabase config & migrations
└── tests/                         # Tesztek
```

---

## 7. Claude Code Parancsok (Prompt Templates)

### 7.1 Fejlesztési parancsok

```bash
# Frontend komponens fejlesztés
"Készítsd el a RentalForm komponenst a frontend-design és 
inlight-rental-pwa skill-ek alapján. Használj shadcn/ui-t, 
react-hook-form-ot és zod validációt."

# Backend fejlesztés
"Hozd létre a rentals tábla RLS policy-jait a supabase-workflow 
skill alapján. A super_admin minden műveletet végezhet, 
az admin csak olvashat és létrehozhat."

# Tesztelés
"Írj unit teszteket a RentalForm komponenshez a testing-workflow 
skill alapján. Mockolj minden Supabase hívást."

# Security audit
"Végezz biztonsági auditot a rentals modulon a security-audit 
skill alapján. Ellenőrizd az RLS policy-kat és az input validációt."

# Deployment
"Készíts deployment-et staging környezetre a deployment-workflow 
skill alapján. Futtass minden pre-deploy check-et."
```

### 7.2 Komplex feladat példa

```bash
"Készítsd el a teljes Rental modul CRUD funkcionalitását:

1. Backend (supabase-workflow):
   - RLS policy-k a rentals és rental_items táblákhoz
   - Edge Function a bérlés aktiválásához
   
2. Frontend (frontend-design + inlight-rental-pwa):
   - RentalList komponens szűréssel és lapozással
   - RentalForm komponens termék kiválasztással
   - RentalDetail komponens állapot kezeléssel
   
3. Tesztek (testing-workflow):
   - Unit tesztek minden komponenshez
   - Integration teszt a teljes flow-ra

4. Security (security-audit):
   - RLS policy ellenőrzés
   - Input validáció audit

Használd az MCP-ket a Supabase és GitHub műveletekhez."
```

---

## 8. Környezeti Változók

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://...

# GitHub
GITHUB_TOKEN=ghp_...
GITHUB_REPO=username/inlight-rental-manager

# Netlify
NETLIFY_AUTH_TOKEN=...
NETLIFY_SITE_ID=...

# App
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

---

## 9. Következő Lépések

1. **MCP szerverek telepítése és konfigurálása**
2. **Skill-ek létrehozása** (részletes tartalom)
3. **GitHub repo létrehozása**
4. **Supabase projekt létrehozása**
5. **React projekt inicializálása**
6. **Első fejlesztési ciklus** (Auth modul)
