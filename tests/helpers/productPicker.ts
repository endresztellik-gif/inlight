import { type Page } from '@playwright/test'

/**
 * Helper function to add a product using the product picker
 * Handles all the waiting and timing issues
 */
export async function addProductViaProductPicker(page: Page): Promise<void> {
  // Step 1: Click "Add Item" button to open picker
  const addItemButton = page.locator('button:has-text("Add Item")')
  await addItemButton.waitFor({ state: 'visible', timeout: 5000 })
  await addItemButton.click()

  // Step 2: Wait for product picker panel to appear
  // Look for the search input which is always present in the picker
  const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="Search"]')
  await searchInput.waitFor({ state: 'visible', timeout: 5000 })

  // Step 3: Wait for products to finish loading
  // Check if loading spinner is present
  const loadingSpinner = page.locator('svg.animate-spin')
  const isLoading = await loadingSpinner.isVisible().catch(() => false)

  if (isLoading) {
    // Wait for spinner to disappear (max 10 seconds)
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.warn('⚠️ Loading spinner did not disappear in time')
    })
  }

  // Step 4: Wait for at least one product button to appear
  // Products are buttons with type="button" that contain product name and price
  const productButton = page.locator('button[type="button"]').filter({
    has: page.locator('p.font-medium'), // Product name
  }).first()

  await productButton.waitFor({ state: 'visible', timeout: 10000 })

  // Step 5: Click the first product
  await productButton.click()

  // Step 6: Wait a bit for the product to be added to the form
  await page.waitForTimeout(500)
}

/**
 * More specific helper that looks for products with certain keywords
 */
export async function addProductWithKeyword(page: Page, keyword: string): Promise<void> {
  // Step 1: Click "Add Item" button
  const addItemButton = page.locator('button:has-text("Add Item")')
  await addItemButton.waitFor({ state: 'visible', timeout: 5000 })
  await addItemButton.click()

  // Step 2: Wait for search input
  const searchInput = page.locator('input[placeholder*="search" i]')
  await searchInput.waitFor({ state: 'visible', timeout: 5000 })

  // Step 3: Wait for loading to finish
  const loadingSpinner = page.locator('svg.animate-spin')
  const isLoading = await loadingSpinner.isVisible().catch(() => false)

  if (isLoading) {
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  }

  // Step 4: Type keyword in search
  await searchInput.fill(keyword)
  await page.waitForTimeout(300) // Debounce

  // Step 5: Wait for filtered product
  const productButton = page.locator('button[type="button"]').filter({
    hasText: new RegExp(keyword, 'i'),
  }).first()

  await productButton.waitFor({ state: 'visible', timeout: 10000 })

  // Step 6: Click the product
  await productButton.click()

  // Step 7: Wait for product to be added
  await page.waitForTimeout(500)
}
