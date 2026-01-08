# M2 Subrental Module - Testing Guide

## 🎯 Testing Objectives

This guide will help verify that the Subrental module works correctly and that inventory is NOT affected by subrental operations.

---

## ✅ Pre-Test Checklist

Before testing, ensure:

1. **Database Migrations Applied:**
   ```bash
   # Check if migrations are applied
   ls -1 supabase/migrations/ | grep -E "(add_rental_type|modify_inventory_triggers)"
   ```

   Expected output:
   - `20250101000013_add_rental_type.sql`
   - `20250101000014_modify_inventory_triggers.sql`

2. **Dev Server Running:**
   ```bash
   # Server should be on http://localhost:5173
   npm run dev
   ```

3. **Test Data Available:**
   - At least 1 client in the database
   - At least 3-5 products with available quantity
   - Note the current available quantity of at least 2 products (we'll verify these don't change)

---

## 🧪 Test Cases

### Test 1: Create New Subrental

**Goal:** Verify subrental creation with supplier information and purchase prices.

**Steps:**

1. Navigate to **Subrentals** page (sidebar menu - Truck icon)
2. Click **New Subrental** button
3. Fill in the form:

   **Client & Project:**
   - Select a client from dropdown
   - Enter project name: "Test Film Production"

   **Dates:**
   - Start date: Today
   - End date: +7 days from today

   **Supplier Information:** (NEW - Subrental specific)
   - Supplier Name: "Camera Rental Hungary Kft." ✅
   - Supplier Contact: "rental@camera.hu" ✅
   - Supplier Notes: "Special discount applied, invoice #12345" ✅

   **Items:**
   - Add 2-3 products
   - Set quantities (e.g., 2x Camera, 1x Tripod)
   - **Purchase Price (NEW):** Enter purchase price for each item
     - Example: Camera purchase = €50/day, Tripod = €10/day

4. **Verify Calculations:**
   - Check that Rental Total is calculated correctly
   - **NEW: Check Profit Margin calculation:**
     - Total Purchase Cost = Sum of (quantity × purchase_price × days)
     - Profit = Rental Total - Total Purchase Cost
     - Profit Margin % = (Profit / Total Purchase Cost) × 100

5. Click **Create Subrental**

**Expected Results:**
- ✅ Subrental created successfully
- ✅ Redirected to `/subrentals` page
- ✅ New subrental appears in the list with status "Active"
- ✅ Subrental number format: `S-YYYYMMDD-XXXX` (e.g., S-20260103-0001)

**Critical Verification:**
```
🔍 MOST IMPORTANT: Check that product inventory did NOT decrease!
```

Go to **Catalog** page and verify:
- Products used in the subrental still show the SAME available quantity
- Example: If "Sony A7III" had 5 available before → still has 5 available after

---

### Test 2: Verify Subrental Number Format

**Goal:** Confirm subrental numbering follows `S-YYYYMMDD-XXXX` pattern.

**Steps:**

1. Create 2-3 subrentals on the same day
2. Check subrental numbers in the list

**Expected Results:**
- ✅ Format: `S-YYYYMMDD-XXXX`
- ✅ Sequential numbering (0001, 0002, 0003...)
- ✅ Date in format YYYYMMDD (e.g., 20260103)
- ✅ Different from rental numbers (which use `R-` prefix)

**Example Valid Numbers:**
```
S-20260103-0001
S-20260103-0002
S-20260104-0001 (next day resets sequence)
```

---

### Test 3: Subrental List View

**Goal:** Verify list displays subrental-specific information.

**Steps:**

1. Navigate to **Subrentals** page
2. Observe the list columns

**Expected Results:**
- ✅ Subrental Number (S-...) displayed
- ✅ Client name shown
- ✅ Project name shown
- ✅ **Supplier column** visible (NEW - should show supplier name)
- ✅ Period (start date - end date)
- ✅ Status badge (Active, Completed, etc.)
- ✅ Total amount with currency

**Search Functionality:**
- ✅ Search by subrental number works
- ✅ Search by client name works
- ✅ Search by project name works
- ✅ **Search by supplier name works** (NEW)

**Filtering:**
- ✅ Filter by status (All, Active, Pending Return, Completed)
- ✅ Filters update the list correctly

---

### Test 4: Subrental Detail View

**Goal:** Verify detail page shows all subrental-specific information including profit.

**Steps:**

1. Click on a subrental from the list (Eye icon)
2. Review the detail page

**Expected Results:**

**Supplier Information Card** (NEW):
- ✅ Card titled "Supplier Information" visible
- ✅ Supplier Name displayed
- ✅ Supplier Contact displayed
- ✅ Supplier Notes displayed (if provided)

**Items Table:**
- ✅ Product names shown
- ✅ Quantities shown
- ✅ **Purchase Price column** visible (NEW)
- ✅ Daily rate shown
- ✅ Days calculated correctly
- ✅ Subtotals correct

**Financial Summary** (NEW):
- ✅ Subtotal displayed
- ✅ Discount (if applied)
- ✅ Tax (27% VAT)
- ✅ **Total Purchase Cost** displayed
- ✅ **Profit** calculated: Total - Purchase Cost
- ✅ **Profit Margin %** shown
- ✅ Profit displayed in green (if positive) or red (if negative)

**Example Calculation:**
```
Rental Total: €1000
Total Purchase Cost: €600
Profit: €400
Profit Margin: 66.7%
```

---

### Test 5: Inventory NOT Affected

**Goal:** CRITICAL - Verify that subrental operations do NOT decrease product inventory.

**Pre-Test Setup:**
1. Note the current available quantity of 2-3 products
2. Example:
   ```
   Sony A7III: 5 available
   Canon C70: 3 available
   Tripod Manfrotto: 10 available
   ```

**Test Steps:**

1. **Create a Subrental:**
   - Use the products noted above
   - Add 2x Sony A7III, 1x Canon C70, 3x Tripod

2. **Check Inventory After Creation:**
   - Navigate to **Catalog** page
   - Verify quantities:
     ```
     Sony A7III: 5 available ✅ (NOT 3!)
     Canon C70: 3 available ✅ (NOT 2!)
     Tripod Manfrotto: 10 available ✅ (NOT 7!)
     ```

3. **Process Return (Completion):**
   - Go to subrental detail
   - Click **Process Return**
   - Mark all items as returned
   - Complete the return

4. **Check Inventory After Return:**
   - Navigate to **Catalog** page
   - Verify quantities STILL unchanged:
     ```
     Sony A7III: 5 available ✅
     Canon C70: 3 available ✅
     Tripod Manfrotto: 10 available ✅
     ```

**Expected Results:**
- ✅ Creating subrental does NOT decrease available quantity
- ✅ Returning subrental does NOT increase available quantity
- ✅ Inventory remains completely unaffected

**Why?**
Because subrentals are equipment rented FROM suppliers, not from our own inventory. The trigger in `modify_inventory_triggers.sql` checks `type = 'rental'` before updating inventory.

---

### Test 6: Profit Margin Calculations

**Goal:** Verify profit calculations are accurate.

**Test Data:**

Create a subrental with known values:

**Items:**
1. Camera A:
   - Quantity: 2
   - Daily Rate: €100/day
   - Purchase Price: €60/day
   - Days: 5
   - Rental Revenue: 2 × €100 × 5 = €1000
   - Purchase Cost: 2 × €60 × 5 = €600

2. Lens B:
   - Quantity: 1
   - Daily Rate: €50/day
   - Purchase Price: €30/day
   - Days: 5
   - Rental Revenue: 1 × €50 × 5 = €250
   - Purchase Cost: 1 × €30 × 5 = €150

**Expected Totals (before tax/discount):**
```
Total Rental Revenue: €1250
Total Purchase Cost: €750
Gross Profit: €500
Profit Margin: 66.7%
```

**With 27% VAT (no discount):**
```
Subtotal: €1250
Tax: €337.50
Final Total: €1587.50
Total Purchase Cost: €750
Net Profit: €837.50
Net Profit Margin: 111.7% (compared to purchase cost)
```

**Verification:**
- ✅ Profit shown on detail page matches calculation
- ✅ Profit margin percentage correct
- ✅ Color coding: Green if profit > 0, Red if profit < 0

---

### Test 7: Subrental Return Processing

**Goal:** Verify return workflow works correctly.

**Steps:**

1. Open an active subrental detail page
2. Click **Process Return** button
3. Modal appears:
   - ✅ All items listed with quantities
   - ✅ Condition on pickup shown
   - ✅ Condition on return dropdown for each item
   - ✅ Return date field (defaults to today)

4. Fill in return details:
   - Select condition for each item (Good, Fair, Damaged)
   - Add return notes if needed
   - Click **Confirm Return**

**Expected Results:**
- ✅ Modal closes
- ✅ Status changes from "Active" to "Completed"
- ✅ Return date displayed
- ✅ Items show "Returned" status with condition
- ✅ **Process Return** button disappears
- ✅ **Inventory still NOT affected** (verify in Catalog)

---

### Test 8: Mixed Rental & Subrental View

**Goal:** Verify rentals and subrentals are properly distinguished.

**Steps:**

1. Create at least 1 regular rental (Rentals menu)
2. Create at least 1 subrental (Subrentals menu)
3. Compare both

**Expected Results:**

**Rentals:**
- ✅ Number format: `R-YYYYMMDD-XXXX`
- ✅ No supplier information fields
- ✅ No purchase price column in items
- ✅ No profit calculation
- ✅ **Inventory DOES decrease** when created

**Subrentals:**
- ✅ Number format: `S-YYYYMMDD-XXXX`
- ✅ Supplier information present
- ✅ Purchase price column in items
- ✅ Profit calculation visible
- ✅ **Inventory does NOT decrease** when created

---

### Test 9: Edge Cases

**Goal:** Test boundary conditions and error handling.

**Test Cases:**

1. **Missing Supplier Name:**
   - Try to create subrental without supplier name
   - ✅ Should show validation error (required field)

2. **Zero Purchase Price:**
   - Create subrental with purchase_price = 0
   - ✅ Profit margin calculation should work (infinite margin)
   - ✅ Should display appropriately

3. **Negative Profit:**
   - Create subrental where purchase price > rental price
   - ✅ Profit should show negative value in RED
   - ✅ Profit margin should be negative percentage

4. **Same-Day Multiple Subrentals:**
   - Create 5 subrentals on same day
   - ✅ Numbers should increment: S-20260103-0001 through 0005
   - ✅ No duplicates

5. **Date Validation:**
   - Try end date before start date
   - ✅ Should show validation error
   - ✅ Days calculation should be 0 or show warning

---

## 🐛 Known Issues to Test For

Check for these potential bugs:

1. **TypeScript Errors:**
   ```bash
   npm run typecheck
   ```
   ✅ Should compile with 0 errors

2. **Console Errors:**
   - Open browser DevTools → Console
   - Perform operations
   - ✅ No red errors should appear

3. **Missing Translations:**
   - Switch language to HU (Magyar)
   - ✅ All labels should be translated (no "undefined" or missing keys)

4. **API Errors:**
   - Network tab in DevTools
   - ✅ All API calls should return 2xx status codes
   - ✅ No 4xx or 5xx errors

---

## 📊 Test Results Checklist

After completing all tests, verify:

- [ ] ✅ Subrental creation works
- [ ] ✅ Subrental number format correct (S-YYYYMMDD-XXXX)
- [ ] ✅ Supplier information saved and displayed
- [ ] ✅ Purchase prices saved and displayed
- [ ] ✅ Profit calculation accurate
- [ ] ✅ **Inventory NOT affected** by subrental operations
- [ ] ✅ Subrental list displays correctly
- [ ] ✅ Search and filtering work
- [ ] ✅ Detail view shows all information
- [ ] ✅ Return processing works
- [ ] ✅ Status transitions work
- [ ] ✅ No TypeScript errors
- [ ] ✅ No console errors
- [ ] ✅ Translations complete (EN/HU)

---

## 🚨 Critical Verification

**MOST IMPORTANT CHECK:**

```
Before Subrental:  Sony A7III has 5 available
Create Subrental:  Use 2x Sony A7III
After Subrental:   Sony A7III STILL has 5 available ✅

Return Subrental:  Mark 2x Sony A7III as returned
After Return:      Sony A7III STILL has 5 available ✅
```

If inventory changes during subrental operations, the trigger modification failed!

---

## 📝 Bug Report Template

If you find issues, document using this format:

```markdown
## Bug: [Short Description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Fill in...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Console Errors:**
```
[Paste any errors here]
```

**Environment:**
- Browser: [e.g., Chrome 120]
- Date: [e.g., 2026-01-03]
```

---

## ✅ Testing Complete?

Once all tests pass:

1. Update the plan file: Mark testing as ✅
2. Document any bugs found and fixed
3. Prepare for commit:
   ```bash
   git status
   git add -A
   git commit -m "feat(subrental): Complete M2 Subrental module implementation"
   ```

---

**Last Updated:** January 3, 2026
**Version:** 1.0.0
**Module:** M2 - Subrental
