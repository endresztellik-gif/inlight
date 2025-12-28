---
name: testing-workflow
description: |
  Tesztelési workflow az iNLighT Rental Manager projekthez.
  Használd amikor: unit tesztek írása, integration tesztek, E2E tesztek,
  komponens tesztelés, API mocking, vagy coverage ellenőrzés szükséges.
  Tartalmazza a Vitest, React Testing Library és Playwright konfigurációkat.
---

# Testing Workflow Skill

## Tech Stack

| Tool | Cél |
|------|-----|
| **Vitest** | Unit & Integration tesztek |
| **React Testing Library** | Komponens tesztek |
| **MSW** | API mocking |
| **Playwright** | E2E tesztek |

## Projekt Struktúra

```
tests/
├── unit/                    # Unit tesztek
│   ├── utils/
│   └── hooks/
├── integration/             # Integration tesztek
│   ├── components/
│   └── features/
├── e2e/                     # E2E tesztek (Playwright)
│   ├── auth.spec.ts
│   ├── rental.spec.ts
│   └── reports.spec.ts
├── mocks/
│   ├── handlers.ts          # MSW handlers
│   ├── supabase.ts          # Supabase mock
│   └── data/                # Test fixtures
└── setup.ts                 # Test setup
```

## Vitest Konfiguráció

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))
```

## MSW Handlers

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

const SUPABASE_URL = 'https://test.supabase.co'

export const handlers = [
  // Products
  http.get(`${SUPABASE_URL}/rest/v1/products`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name_en: 'Arri M40 HMI',
        name_hu: 'Arri M40 HMI',
        daily_rate: 45,
        own_stock: 3,
      },
    ])
  }),

  // Rentals
  http.get(`${SUPABASE_URL}/rest/v1/rentals`, () => {
    return HttpResponse.json([
      {
        id: '1',
        rental_number: 'R-20250101-0001',
        status: 'active',
        start_date: '2025-01-01',
        end_date: '2025-01-10',
      },
    ])
  }),

  // Auth
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: { id: '1', email: 'test@test.com' },
    })
  }),
]
```

## Komponens Teszt Minta

```typescript
// tests/integration/components/RentalForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RentalForm } from '@/components/rental/RentalForm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('RentalForm', () => {
  it('renders form fields correctly', () => {
    render(<RentalForm />, { wrapper })
    
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<RentalForm />, { wrapper })
    
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/client is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<RentalForm onSubmit={onSubmit} />, { wrapper })
    
    await user.type(screen.getByLabelText(/project/i), 'Test Project')
    // ... fill other fields
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })
})
```

## Hook Teszt Minta

```typescript
// tests/unit/hooks/useProducts.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProducts } from '@/hooks/useProducts'
import { wrapper } from '../utils/test-utils'

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].name_en).toBe('Arri M40 HMI')
  })

  it('filters by category', async () => {
    const { result } = renderHook(
      () => useProducts({ categoryId: 'lights' }),
      { wrapper }
    )
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
```

## E2E Teszt (Playwright)

```typescript
// tests/e2e/rental.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Rental Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('creates a new rental', async ({ page }) => {
    await page.goto('/rentals/new')
    
    // Select client
    await page.click('[data-testid="client-select"]')
    await page.click('[data-testid="client-option-1"]')
    
    // Fill project name
    await page.fill('[name="project_name"]', 'Test Film Project')
    
    // Select dates
    await page.fill('[name="start_date"]', '2025-02-01')
    await page.fill('[name="end_date"]', '2025-02-10')
    
    // Add product
    await page.click('[data-testid="add-product"]')
    await page.click('[data-testid="product-arri-m40"]')
    await page.fill('[data-testid="quantity-input"]', '2')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify redirect
    await expect(page).toHaveURL(/\/rentals\/R-/)
    await expect(page.locator('h1')).toContainText('Test Film Project')
  })

  test('processes rental return', async ({ page }) => {
    await page.goto('/rentals/R-20250101-0001')
    
    await page.click('[data-testid="process-return"]')
    
    // Mark item as returned
    await page.click('[data-testid="item-1-returned"]')
    await page.selectOption('[data-testid="item-1-condition"]', 'ok')
    
    await page.click('[data-testid="confirm-return"]')
    
    await expect(page.locator('[data-testid="status"]')).toContainText('Returned')
  })
})
```

## Playwright Konfiguráció

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Coverage Követelmények

| Metrika | Minimum |
|---------|---------|
| Lines | 80% |
| Functions | 80% |
| Branches | 70% |
| Statements | 80% |

## Parancsok

```bash
# Unit & Integration tesztek
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tesztek
npm run test:e2e

# E2E UI mode
npm run test:e2e:ui
```

## Checklist

### Unit Tesztek
- [ ] Utility funkciók tesztelve
- [ ] Custom hooks tesztelve
- [ ] Validációs sémák tesztelve

### Integration Tesztek
- [ ] Form komponensek tesztelve
- [ ] Lista komponensek tesztelve
- [ ] Auth flow tesztelve

### E2E Tesztek
- [ ] Login/Logout flow
- [ ] Rental CRUD flow
- [ ] Return processing flow
- [ ] Report generation flow
- [ ] Export funkciók

### Coverage
- [ ] Minimum 80% line coverage
- [ ] Kritikus útvonalak 100% lefedettség
