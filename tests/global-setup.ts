import { chromium, type FullConfig } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

/**
 * Playwright Global Setup
 *
 * This runs once before all tests to:
 * 1. Load test environment variables from .env.test
 * 2. Log in as test super_admin user
 * 3. Save authentication state to .auth/user.json
 * 4. All tests will use this stored auth state (no need to login in each test)
 */

async function globalSetup(config: FullConfig) {
  // Get __dirname equivalent in ES modules
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  // Load .env.test
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

  const { baseURL } = config.projects[0].use
  const storageState = path.resolve(__dirname, '../.auth/user.json')

  // Get test credentials from env
  const email = process.env.TEST_SUPER_ADMIN_EMAIL
  const password = process.env.TEST_SUPER_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Missing test credentials. Please check .env.test file:\n' +
      '  TEST_SUPER_ADMIN_EMAIL\n' +
      '  TEST_SUPER_ADMIN_PASSWORD'
    )
  }

  console.log('🔐 Authenticating as test user:', email)

  // Launch browser
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to app
    await page.goto(baseURL || 'http://localhost:5175')
    await page.waitForLoadState('networkidle')

    // Fill login form
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)

    // Click sign in button
    await page.locator('button[type="submit"]').click()

    // Wait for navigation to dashboard (successful login)
    await page.waitForURL(/\/(dashboard|rentals|subrentals)/, { timeout: 15000 })

    // Wait for auth state to be saved in browser
    await page.waitForTimeout(2000)

    // Save storage state
    await page.context().storageState({ path: storageState })

    console.log('✅ Authentication successful! State saved to:', storageState)
  } catch (error) {
    console.error('❌ Authentication failed:', error)

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/auth-failure.png', fullPage: true })

    // Log page content for debugging
    const bodyText = await page.locator('body').textContent()
    console.log('Page content:', bodyText?.substring(0, 500))

    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
