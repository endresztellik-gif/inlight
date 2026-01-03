# Test Helpers - iNLighT Rental Manager

Test helper functions for robust and reliable E2E testing.

---

## 📦 Product Picker Helper

**File**: `productPicker.ts`

Helper functions for interacting with the product picker modal in rental/subrental forms.

### Problem Solved

The product picker modal has complex loading states that cause timing issues in parallel test execution:
- Modal opening animation
- Product data loading from Supabase
- Loading spinner visibility
- Product button rendering

Without proper waiting logic, tests become **flaky** - passing when run individually but failing in parallel execution.

### Solution

The `productPicker.ts` helper provides robust waiting logic that handles all timing edge cases:

1. ✅ Waits for "Add Item" button to be visible
2. ✅ Waits for product picker modal to open
3. ✅ Waits for loading spinner to disappear
4. ✅ Waits for product buttons to render (10s timeout)
5. ✅ Graceful error handling with warnings

---

## 🔧 Usage

### `addProductViaProductPicker(page)`

**Use Case**: Add the first available product without searching

```typescript
import { addProductViaProductPicker } from '../helpers/productPicker'

await test.step('Add rental item', async () => {
  // Opens picker, waits for loading, clicks first product
  await addProductViaProductPicker(page)

  // Fill quantity
  await page.fill('input[name="items.0.quantity"]', '2')
})
```

**How it works**:
1. Clicks "Add Item" button
2. Waits for search input to appear (confirms modal opened)
3. Checks for loading spinner and waits for it to disappear
4. Waits for first product button to be visible
5. Clicks the product
6. Waits 500ms for form update

### `addProductWithKeyword(page, keyword)`

**Use Case**: Search for and add a specific product

```typescript
import { addProductWithKeyword } from '../helpers/productPicker'

await test.step('Add specific camera', async () => {
  // Opens picker, searches for "Canon", clicks matching product
  await addProductWithKeyword(page, 'Canon')

  // Fill quantity
  await page.fill('input[name="items.0.quantity"]', '1')
})
```

**How it works**:
1. Clicks "Add Item" button
2. Waits for search input to appear
3. Waits for loading to finish
4. Types keyword in search input
5. Waits 300ms for debounce
6. Waits for filtered product button (matches keyword)
7. Clicks the product
8. Waits 500ms for form update

---

## 📊 Performance Impact

### Before Helper (Flaky)
- **Parallel execution**: 20/22 tests passing (91%)
- **Individual execution**: 22/22 tests passing (100%)
- **Flaky tests**: rental-flow, subrental-flow

### After Helper (Stable)
- **Parallel execution**: 22/22 tests passing (100%) ✅
- **Individual execution**: 22/22 tests passing (100%)
- **Flaky tests**: 0

**Run time**: ~45 seconds for 22 tests (4 workers)

---

## 🚨 When to Use

**Always use the helper** when interacting with product picker in E2E tests:
- ✅ Rental creation tests
- ✅ Subrental creation tests
- ✅ Any form that uses the product picker modal

**Do NOT use** for:
- ❌ Unit tests (product picker is UI component)
- ❌ Integration tests (test business logic, not UI)

---

## 🔍 Implementation Details

### Waiting Strategy

The helper uses a **layered waiting approach**:

```typescript
// 1. Wait for button
await addItemButton.waitFor({ state: 'visible', timeout: 5000 })

// 2. Wait for modal (search input is always present)
await searchInput.waitFor({ state: 'visible', timeout: 5000 })

// 3. Wait for loading to finish (optional - may not always show)
if (await loadingSpinner.isVisible()) {
  await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 })
}

// 4. Wait for product button
await productButton.waitFor({ state: 'visible', timeout: 10000 })
```

### Error Handling

The helper gracefully handles missing elements:

```typescript
const isLoading = await loadingSpinner.isVisible().catch(() => false)

if (isLoading) {
  await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    console.warn('⚠️ Loading spinner did not disappear in time')
  })
}
```

This prevents tests from failing if:
- Loading spinner doesn't appear (fast load)
- Loading spinner doesn't disappear in 10s (slow network)

---

## 📚 References

- **Used in tests**:
  - `tests/e2e/rental-flow.spec.ts`
  - `tests/e2e/subrental-flow.spec.ts`

- **Related documentation**:
  - `tests/E2E_TESTS_SUMMARY.md` - Full test suite documentation
  - `tests/E2E_TEST_SETUP.md` - Test setup guide

---

## ✅ Best Practices

1. **Import at the top**:
   ```typescript
   import { addProductViaProductPicker } from '../helpers/productPicker'
   ```

2. **Use in test steps**:
   ```typescript
   await test.step('Add rental item', async () => {
     await addProductViaProductPicker(page)
     // ... rest of test
   })
   ```

3. **Always fill quantity after**:
   ```typescript
   await addProductViaProductPicker(page)
   await page.fill('input[name="items.0.quantity"]', '2')
   ```

4. **Use keyword search for specific products**:
   ```typescript
   await addProductWithKeyword(page, 'ARRI')
   await page.fill('input[name="items.0.quantity"]', '1')
   ```

---

## 🎯 Troubleshooting

### Product picker times out

**Symptom**: Test fails with "Waiting for product button timeout"

**Causes**:
1. No products in database
2. Network slow (Supabase query > 10s)
3. Product picker not opening

**Fix**:
1. Verify test data exists in database
2. Increase timeout in helper (line 36):
   ```typescript
   await productButton.waitFor({ state: 'visible', timeout: 15000 })
   ```
3. Add screenshot on failure:
   ```typescript
   await page.screenshot({ path: 'test-results/picker-timeout.png' })
   ```

### Wrong product selected

**Symptom**: Test adds wrong product (not the one you expected)

**Cause**: `addProductViaProductPicker()` always selects first product

**Fix**: Use `addProductWithKeyword()` instead:
```typescript
// Instead of:
await addProductViaProductPicker(page)

// Use:
await addProductWithKeyword(page, 'Canon C70')
```

### Duplicate products issue

**Symptom**: Multiple products match keyword

**Cause**: Keyword too generic (e.g., "Camera")

**Fix**: Use more specific keyword:
```typescript
// Too generic:
await addProductWithKeyword(page, 'Camera')

// Better:
await addProductWithKeyword(page, 'Canon C70')
```

---

**Created**: 2026-01-02
**Last Updated**: 2026-01-02
**Test Suite Version**: v1.0.0
