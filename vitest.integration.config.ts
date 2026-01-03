import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Vitest Configuration for Integration Tests
 *
 * Integration tests make real HTTP calls to Supabase:
 * - No MSW (Mock Service Worker)
 * - No mocks
 * - Node environment (no jsdom)
 * - Real authentication
 */
export default defineConfig({
  test: {
    environment: 'node', // No jsdom needed for integration tests
    globals: true,
    // NO setupFiles - we don't want MSW or any mocks
    include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 30000, // Integration tests may take longer
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
