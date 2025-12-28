# iNLighT Rental Manager - Claude Code CLI Setup

## 🚀 Claude Code CLI Környezet

A Claude Code CLI a terminálban fut (`claude` parancs). A konfiguráció és skill-ek kezelése eltér a Desktop verziótól.

---

## 1. Projekt Struktúra

```
inlight-rental-manager/
├── .claude/
│   ├── settings.json          # Projekt beállítások
│   ├── settings.local.json    # Lokális beállítások (gitignore!)
│   └── commands/              # Egyedi parancsok (opcionális)
│
├── CLAUDE.md                  # Fő projekt kontextus fájl
│
├── claude-skills/             # Projekt skill-ek
│   ├── inlight-rental-pwa/
│   │   └── SKILL.md
│   ├── supabase-workflow/
│   │   └── SKILL.md
│   ├── testing-workflow/
│   │   └── SKILL.md
│   ├── security-audit/
│   │   └── SKILL.md
│   └── deployment-workflow/
│       └── SKILL.md
│
├── supabase/                  # Supabase config & migrations
│   ├── migrations/
│   └── functions/
│
├── src/                       # React alkalmazás
└── ...
```

---

## 2. CLAUDE.md - Fő Projekt Fájl

A `CLAUDE.md` a projekt gyökerében a legfontosabb fájl - Claude Code automatikusan beolvassa.

```markdown
# iNLighT Rental Manager

Film equipment rental management PWA az iNLighT Kft. számára.

## Projekt Információ

- **Típus:** React PWA (Vite + TypeScript)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Nyelvek:** EN (elsődleges), HU
- **Pénznemek:** EUR, HUF, USD

## Modulok

- M1: Rental - Saját készlet bérbeadása
- M2: Subrental - Beszerzett termékek (nincs készletnyilvántartás)
- M3: Reports - Lekérdezések, exportok
- M4: Catalog - Termék/kategória admin (csak super_admin)
- Public - Nyilvános terméklista

## Szerepkörök

- super_admin (3 fő): Teljes hozzáférés
- admin (2 fő): Bérlés CRUD, visszavétel

## Tech Stack

- Frontend: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- State: @tanstack/react-query
- Forms: react-hook-form + zod
- i18n: react-i18next
- Backend: Supabase
- Export: xlsx, jspdf, docx

## Skill-ek

A `claude-skills/` mappában találhatók a részletes workflow-ok:
- `inlight-rental-pwa/` - Fő projekt patterns
- `supabase-workflow/` - Backend, RLS, Edge Functions
- `testing-workflow/` - Vitest, RTL, Playwright
- `security-audit/` - OWASP, RLS audit
- `deployment-workflow/` - Netlify, CI/CD

## Fontos Szabályok

1. Napi díj csak tájékoztató - végösszeg kézzel
2. Subrental: nincs készlet, mindig elérhető
3. Több beszállító/tétel lehetséges
4. RLS kötelező minden táblán
5. i18n minden szövegre (EN/HU)

## Parancsok

```bash
npm run dev          # Fejlesztői szerver
npm run build        # Production build
npm run test         # Tesztek
npm run lint         # ESLint
npm run typecheck    # TypeScript ellenőrzés
```

## Környezeti Változók

Lásd: `.env.example`
```
