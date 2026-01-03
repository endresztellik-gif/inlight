import { test } from '@playwright/test'

test('debug: take screenshot of home page', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(2000) // Wait for page to load

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-homepage.png', fullPage: true })

  // Print HTML to see what's on the page
  const html = await page.content()
  console.log('Page HTML length:', html.length)
  console.log('Page title:', await page.title())

  // Check for sidebar
  const sidebar = await page.locator('nav').count()
  console.log('Number of nav elements:', sidebar)

  // Check for subrentals link
  const subrentalsLink = await page.locator('a[href="/subrentals"]').count()
  console.log('Number of subrentals links:', subrentalsLink)

  // Check for any links
  const allLinks = await page.locator('a').count()
  console.log('Total number of links:', allLinks)

  // Print body text to see what's shown
  const bodyText = await page.locator('body').textContent()
  console.log('\n==== PAGE BODY TEXT (first 500 chars) ====')
  console.log(bodyText?.slice(0, 500))
  console.log('==========================================\n')

  // Check for login/auth elements
  const loginButton = await page.locator('button:has-text("Login"), button:has-text("Sign In")').count()
  console.log('Number of login buttons:', loginButton)
})
