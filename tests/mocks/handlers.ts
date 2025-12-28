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
