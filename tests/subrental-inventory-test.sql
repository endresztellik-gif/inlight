-- =============================================================================
-- Subrental Inventory Isolation Test
-- =============================================================================
-- This script verifies that creating a Subrental does NOT affect product inventory
-- Expected: available_quantity remains unchanged after subrental creation
-- =============================================================================

-- Start transaction for rollback
BEGIN;

-- 1. Get a test product and its current inventory
DO $$
DECLARE
  test_product_id UUID;
  test_client_id UUID;
  test_user_id UUID;
  initial_quantity INTEGER;
  quantity_after_subrental INTEGER;
  test_rental_id UUID;
BEGIN
  -- Get first available product
  SELECT id INTO test_product_id
  FROM products
  WHERE available_quantity > 0
  LIMIT 1;

  IF test_product_id IS NULL THEN
    RAISE EXCEPTION 'No products available for testing';
  END IF;

  -- Get first available client
  SELECT id INTO test_client_id
  FROM clients
  LIMIT 1;

  IF test_client_id IS NULL THEN
    RAISE EXCEPTION 'No clients available for testing';
  END IF;

  -- Get first super_admin user
  SELECT id INTO test_user_id
  FROM user_profiles
  WHERE role = 'super_admin'
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No super_admin user available for testing';
  END IF;

  -- Record initial inventory
  SELECT available_quantity INTO initial_quantity
  FROM products
  WHERE id = test_product_id;

  RAISE NOTICE '==================================================';
  RAISE NOTICE 'TEST START: Subrental Inventory Isolation';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Product ID: %', test_product_id;
  RAISE NOTICE 'Initial available_quantity: %', initial_quantity;
  RAISE NOTICE '';

  -- 2. Create a test SUBRENTAL (type = 'subrental')
  INSERT INTO rentals (
    rental_number,
    type,
    client_id,
    project_name,
    start_date,
    end_date,
    status,
    final_total,
    final_currency,
    supplier_name,
    supplier_contact,
    supplier_notes,
    created_by
  ) VALUES (
    'S-TEST-0001',
    'subrental',  -- CRITICAL: This is a subrental
    test_client_id,
    'Test Subrental Project',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    'active',
    1400.00,
    'EUR',
    'Test Supplier Ltd.',
    'test@supplier.com',
    'Automated test subrental',
    test_user_id
  ) RETURNING id INTO test_rental_id;

  RAISE NOTICE 'Created SUBRENTAL with ID: %', test_rental_id;
  RAISE NOTICE 'Subrental Type: subrental';
  RAISE NOTICE 'Supplier: Test Supplier Ltd.';
  RAISE NOTICE '';

  -- 3. Add rental item (this SHOULD NOT trigger inventory decrease)
  INSERT INTO rental_items (
    rental_id,
    product_id,
    quantity,
    daily_rate,
    days,
    subtotal,
    purchase_price,
    condition_on_pickup
  ) VALUES (
    test_rental_id,
    test_product_id,
    2,  -- Renting 2 units
    100.00,
    7,
    1400.00,
    80.00,  -- Purchase price for profit calculation
    'good'
  );

  RAISE NOTICE 'Added rental item: 2 units of product %', test_product_id;
  RAISE NOTICE '';

  -- 4. Check inventory AFTER subrental creation
  SELECT available_quantity INTO quantity_after_subrental
  FROM products
  WHERE id = test_product_id;

  RAISE NOTICE 'Available quantity AFTER subrental creation: %', quantity_after_subrental;
  RAISE NOTICE '';

  -- 5. VERIFY: Inventory should NOT have changed
  IF quantity_after_subrental = initial_quantity THEN
    RAISE NOTICE '✅ SUCCESS: Inventory UNCHANGED (as expected for subrental)';
    RAISE NOTICE '   Initial: %', initial_quantity;
    RAISE NOTICE '   After:   %', quantity_after_subrental;
    RAISE NOTICE '   Diff:    0 (CORRECT - subrental should not affect inventory)';
  ELSE
    RAISE EXCEPTION '❌ FAILURE: Inventory CHANGED (should not happen for subrental)! Initial: %, After: %, Diff: %',
      initial_quantity,
      quantity_after_subrental,
      (quantity_after_subrental - initial_quantity);
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'TEST COMPARISON: Rental vs Subrental Trigger Behavior';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'For RENTAL (type = ''rental''):';
  RAISE NOTICE '  ✓ Trigger SHOULD decrease inventory on insert';
  RAISE NOTICE '  ✓ Trigger SHOULD increase inventory on return';
  RAISE NOTICE '';
  RAISE NOTICE 'For SUBRENTAL (type = ''subrental''):';
  RAISE NOTICE '  ✓ Trigger SHOULD NOT affect inventory (VERIFIED ✅)';
  RAISE NOTICE '  ✓ Equipment comes from supplier, not own stock';
  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'TEST PASSED ✅';
  RAISE NOTICE '==================================================';

END $$;

-- Rollback to clean up test data
ROLLBACK;

RAISE NOTICE '';
RAISE NOTICE 'Test data rolled back (cleanup complete)';
