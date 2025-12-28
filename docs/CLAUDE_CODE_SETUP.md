# iNLighT Rental Manager - Claude Code CLI Setup

## 🚀 Claude Code CLI Környezet

A Claude Code CLI a terminálban fut (`claude` parancs). 

---

## 1. MCP Szerverek Beállítása

### 1.1 MCP Parancsok

```bash
# MCP szerverek listázása
claude mcp list

# MCP szerver hozzáadása
claude mcp add <name> <command> [args...]

# MCP szerver eltávolítása
claude mcp remove <name>
```

### 1.2 Supabase MCP Hozzáadása

```bash
# Supabase MCP (projekt scope)
claude mcp add supabase \
  -s project \
  -e SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  -- npx -y @supabase/mcp-server-supabase@latest

# Ellenőrzés
claude mcp list
```

### 1.3 GitHub MCP Hozzáadása

```bash
# GitHub token: https://github.com/settings/tokens
# Scope-ok: repo, workflow

claude mcp add github \
  -s user \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_... \
  -- npx -y @modelcontextprotocol/server-github
```

### 1.4 Filesystem MCP (Beépített)

A Claude Code CLI automatikusan hozzáfér a projekt fájlrendszeréhez, nem kell külön MCP.

### 1.5 PostgreSQL MCP (Opcionális)

```bash
claude mcp add postgres \
  -s project \
  -e DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" \
  -- npx -y @modelcontextprotocol/server-postgres
```

---

## 2. Projekt Inicializálás

### 2.1 Mappa Létrehozása

```bash
mkdir inlight-rental-manager
cd inlight-rental-manager

# Claude Code indítása
claude
```

### 2.2 CLAUDE.md Létrehozása

A `CLAUDE.md` fájl a projekt gyökerében - Claude Code automatikusan beolvassa minden beszélgetéskor.

```bash
# Claude Code-ban:
> Hozd létre a CLAUDE.md fájlt a projekt leírásával
```

### 2.3 Skill-ek Másolása

```bash
# Skill-ek a projekt mappába
mkdir -p claude-skills
# Másold a skill mappákat ide
```

---

## 3. Fejlesztési Workflow

### 3.1 Claude Code Indítása

```bash
cd inlight-rental-manager
claude
```

### 3.2 Skill Hivatkozás

```bash
# Claude Code-ban:
> Olvasd be a claude-skills/supabase-workflow/SKILL.md fájlt és 
  készíts RLS policy-kat a rentals táblához

> A claude-skills/testing-workflow alapján írj teszteket
```

### 3.3 MCP Használat

```bash
# Supabase MCP automatikusan elérhető
> Listázd a Supabase táblákat
> Futtasd le ezt az SQL-t: SELECT * FROM products LIMIT 5

# GitHub MCP
> Hozz létre egy új branch-et "feature/rental-form" néven
> Push-old a változásokat
```

---

## 4. Hasznos Claude Code Parancsok

### 4.1 Terminálban

```bash
# Interaktív mód
claude

# Egyetlen kérdés
claude "Mi a projekt struktúra?"

# Folytatás előző beszélgetésből
claude --continue

# Új beszélgetés
claude --new

# Súgó
claude --help
```

### 4.2 Claude Code-on Belül

```
/help              - Súgó
/clear             - Képernyő törlése
/compact           - Kontextus tömörítése
/cost              - Token költség
/doctor            - Diagnosztika
/init              - Projekt inicializálás
/mcp               - MCP státusz
/memory            - Projekt memória
/model             - Modell váltás
/permissions       - Jogosultságok
/status            - Állapot
/terminal-setup    - Terminál beállítás
```

---

## 5. Ajánlott Munkafolyamat

### 5.1 Napi Fejlesztés

```bash
# 1. Projekt mappa
cd inlight-rental-manager

# 2. Claude Code indítása
claude

# 3. Kontextus betöltése (első alkalommal)
> Olvasd be a CLAUDE.md fájlt és a claude-skills/ mappát

# 4. Fejlesztés
> Készítsd el a RentalForm komponenst shadcn/ui-val
```

### 5.2 Feature Fejlesztés

```
1. Backend:
   > A supabase-workflow skill alapján készíts RLS policy-kat

2. Frontend:
   > Készíts React komponenst a frontend-design elvek szerint

3. Tesztek:
   > A testing-workflow alapján írj unit teszteket

4. Security:
   > Futtass security-audit-ot

5. Deploy:
   > A deployment-workflow szerint deploy-olj staging-re
```

---

## 6. Környezeti Változók

### .env.example

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# App
VITE_APP_ENV=development
```

### .env.local (NE COMMITOLD!)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_ENV=development
```

---

## 7. Hibakeresés

### MCP Nem Működik

```bash
# MCP státusz ellenőrzése
claude mcp list

# Részletes információ
claude /mcp

# Diagnosztika
claude /doctor
```

### Projekt Kontextus

```bash
# Memória megtekintése
claude /memory

# Kontextus tömörítése (ha túl hosszú)
claude /compact
```

---

## 8. Gyors Referencia

| Parancs | Funkció |
|---------|---------|
| `claude` | Interaktív mód indítása |
| `claude "kérdés"` | Egyetlen kérdés |
| `claude mcp list` | MCP szerverek listája |
| `claude mcp add` | MCP hozzáadása |
| `/help` | Súgó (Claude Code-ban) |
| `/mcp` | MCP státusz |
| `/compact` | Kontextus tömörítés |

---

## Kész! 🎉

```bash
cd inlight-rental-manager
claude
> Kezdjük! Inicializáld a React projektet Vite-tal.
```
