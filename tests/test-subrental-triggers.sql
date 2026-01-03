-- ============================================================
-- SUBRENTAL INVENTORY TRIGGER TEST
-- ============================================================
--
-- This test validates that:
-- 1. RENTAL (M1) creation DECREASES product inventory
-- 2. RENTAL (M1) return INCREASES product inventory
-- 3. SUBRENTAL (M2) creation DOES NOT change inventory
-- 4. SUBRENTAL (M2) return DOES NOT change inventory
--
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================

-- Test Setup: Record initial inventory
DO $$
DECLARE
  admin_user_id UUID;
  test_client_id UUID := 'c1111111-1111-1111-1111-111111111111';

  -- Product IDs for testing
  camera_id UUID := 'a2222222-2222-2222-2222-222222222222'; -- Sony FX9
  lens_id UUID := 'b1111111-1111-1111-1111-111111111111';   -- Canon CN-E 35mm

  -- Initial inventory
  camera_initial_qty INTEGER;
  lens_initial_qty INTEGER;

  -- Test rental IDs
  test_rental_id UUID;
  test_subrental_id UUID;

  -- Inventory after operations
  camera_after_rental INTEGER;
  lens_after_rental INTEGER;
  camera_after_subrental INTEGER;
  lens_after_subrental INTEGER;
  camera_after_return INTEGER;
  lens_after_return INTEGER;
  camera_after_subrental_return INTEGER;
  lens_after_subrental_return INTEGER;

BEGIN
  -- Get admin user
  SELECT id INTO admin_user_id FROM user_profiles WHERE role = 'super_admin' LIMIT 1;
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM user_profiles WHERE role = 'admin' LIMIT 1;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUBRENTAL INVENTORY TRIGGER TEST';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- ============================================================
  -- STEP 1: Record Initial Inventory
  -- ============================================================

  SELECT available_quantity INTO camera_initial_qty
  FROM products WHERE id = camera_id;

  SELECT available_quantity INTO lens_initial_qty
  FROM products WHERE id = lens_id;

  RAISE NOTICE '📊 INITIAL INVENTORY:';
  RAISE NOTICE '   Sony FX9 (Camera): % units', camera_initial_qty;
  RAISE NOTICE '   Canon CN-E 35mm (Lens): % units', lens_initial_qty;
  RAISE NOTICE '';

  -- ============================================================
  -- TEST 1: RENTAL (M1) - Should DECREASE Inventory
  -- ============================================================

  RAISE NOTICE '🧪 TEST 1: Create RENTAL (type = rental)';
  RAISE NOTICE '   Expected: Inventory should DECREASE';
  RAISE NOTICE '';

  -- Generate test rental ID
  test_rental_id := gen_random_uuid();

  -- Create rental (type = 'rental')
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, final_currency, final_total, created_by
  ) VALUES (
    test_rental_id,
    'R-TEST-001',
    test_client_id,
    'Trigger Test - Rental',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '5 days',
    'active',
    'rental', -- M1 type
    'EUR',
    1000.00,
    admin_user_id
  );

  -- Add rental items (should trigger inventory decrease)
  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, subtotal,
    condition_on_pickup, is_returned
  ) VALUES
  (test_rental_id, camera_id, 1, 280.00, 5, 1400.00, 'excellent', false),
  (test_rental_id, lens_id, 2, 80.00, 5, 800.00, 'excellent', false);

  -- Check inventory after rental creation
  SELECT available_quantity INTO camera_after_rental FROM products WHERE id = camera_id;
  SELECT available_quantity INTO lens_after_rental FROM products WHERE id = lens_id;

  RAISE NOTICE '✅ Rental Created (ID: %)', test_rental_id;
  RAISE NOTICE '   Sony FX9: % → % (expected: % - 1 = %)',
    camera_initial_qty, camera_after_rental, camera_initial_qty, camera_initial_qty - 1;
  RAISE NOTICE '   Canon CN-E 35mm: % → % (expected: % - 2 = %)',
    lens_initial_qty, lens_after_rental, lens_initial_qty, lens_initial_qty - 2;

  IF camera_after_rental = camera_initial_qty - 1 AND lens_after_rental = lens_initial_qty - 2 THEN
    RAISE NOTICE '   ✅ TEST 1 PASSED: Inventory decreased correctly';
  ELSE
    RAISE NOTICE '   ❌ TEST 1 FAILED: Inventory did not decrease as expected';
  END IF;
  RAISE NOTICE '';

  -- ============================================================
  -- TEST 2: SUBRENTAL (M2) - Should NOT Change Inventory
  -- ============================================================

  RAISE NOTICE '🧪 TEST 2: Create SUBRENTAL (type = subrental)';
  RAISE NOTICE '   Expected: Inventory should NOT change';
  RAISE NOTICE '';

  -- Generate test subrental ID
  test_subrental_id := gen_random_uuid();

  -- Create subrental (type = 'subrental')
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, supplier_name, supplier_contact, final_currency, final_total, created_by
  ) VALUES (
    test_subrental_id,
    'S-TEST-001',
    test_client_id,
    'Trigger Test - Subrental',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 days',
    'active',
    'subrental', -- M2 type
    'Test Supplier Inc.',
    'test@supplier.com',
    'EUR',
    800.00,
    admin_user_id
  );

  -- Add subrental items (should NOT trigger inventory decrease)
  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, purchase_price, subtotal,
    condition_on_pickup, is_returned
  ) VALUES
  (test_subrental_id, camera_id, 1, 280.00, 3, 180.00, 840.00, 'excellent', false),
  (test_subrental_id, lens_id, 1, 80.00, 3, 50.00, 240.00, 'excellent', false);

  -- Check inventory after subrental creation
  SELECT available_quantity INTO camera_after_subrental FROM products WHERE id = camera_id;
  SELECT available_quantity INTO lens_after_subrental FROM products WHERE id = lens_id;

  RAISE NOTICE '✅ Subrental Created (ID: %)', test_subrental_id;
  RAISE NOTICE '   Sony FX9: % → % (expected: no change)',
    camera_after_rental, camera_after_subrental;
  RAISE NOTICE '   Canon CN-E 35mm: % → % (expected: no change)',
    lens_after_rental, lens_after_subrental;

  IF camera_after_subrental = camera_after_rental AND lens_after_subrental = lens_after_rental THEN
    RAISE NOTICE '   ✅ TEST 2 PASSED: Inventory unchanged (subrental ignored)';
  ELSE
    RAISE NOTICE '   ❌ TEST 2 FAILED: Inventory changed unexpectedly';
  END IF;
  RAISE NOTICE '';

  -- ============================================================
  -- TEST 3: RENTAL RETURN (M1) - Should INCREASE Inventory
  -- ============================================================

  RAISE NOTICE '🧪 TEST 3: Process RENTAL return';
  RAISE NOTICE '   Expected: Inventory should INCREASE';
  RAISE NOTICE '';

  -- Mark rental items as returned
  UPDATE rental_items
  SET
    is_returned = true,
    returned_at = NOW(),
    condition_on_return = 'excellent'
  WHERE rental_id = test_rental_id;

  -- Update rental status
  UPDATE rentals
  SET status = 'completed'
  WHERE id = test_rental_id;

  -- Check inventory after rental return
  SELECT available_quantity INTO camera_after_return FROM products WHERE id = camera_id;
  SELECT available_quantity INTO lens_after_return FROM products WHERE id = lens_id;

  RAISE NOTICE '✅ Rental Returned (ID: %)', test_rental_id;
  RAISE NOTICE '   Sony FX9: % → % (expected: % + 1 = %)',
    camera_after_subrental, camera_after_return, camera_after_subrental, camera_initial_qty;
  RAISE NOTICE '   Canon CN-E 35mm: % → % (expected: % + 2 = %)',
    lens_after_subrental, lens_after_return, lens_after_subrental, lens_initial_qty;

  IF camera_after_return = camera_initial_qty AND lens_after_return = lens_initial_qty THEN
    RAISE NOTICE '   ✅ TEST 3 PASSED: Inventory restored to initial levels';
  ELSE
    RAISE NOTICE '   ❌ TEST 3 FAILED: Inventory not restored correctly';
  END IF;
  RAISE NOTICE '';

  -- ============================================================
  -- TEST 4: SUBRENTAL RETURN (M2) - Should NOT Change Inventory
  -- ============================================================

  RAISE NOTICE '🧪 TEST 4: Process SUBRENTAL return';
  RAISE NOTICE '   Expected: Inventory should NOT change';
  RAISE NOTICE '';

  -- Mark subrental items as returned
  UPDATE rental_items
  SET
    is_returned = true,
    returned_at = NOW(),
    condition_on_return = 'excellent'
  WHERE rental_id = test_subrental_id;

  -- Update subrental status
  UPDATE rentals
  SET status = 'completed'
  WHERE id = test_subrental_id;

  -- Check inventory after subrental return
  SELECT available_quantity INTO camera_after_subrental_return FROM products WHERE id = camera_id;
  SELECT available_quantity INTO lens_after_subrental_return FROM products WHERE id = lens_id;

  RAISE NOTICE '✅ Subrental Returned (ID: %)', test_subrental_id;
  RAISE NOTICE '   Sony FX9: % → % (expected: no change)',
    camera_after_return, camera_after_subrental_return;
  RAISE NOTICE '   Canon CN-E 35mm: % → % (expected: no change)',
    lens_after_return, lens_after_subrental_return;

  IF camera_after_subrental_return = camera_after_return AND lens_after_subrental_return = lens_after_return THEN
    RAISE NOTICE '   ✅ TEST 4 PASSED: Inventory unchanged (subrental return ignored)';
  ELSE
    RAISE NOTICE '   ❌ TEST 4 FAILED: Inventory changed unexpectedly';
  END IF;
  RAISE NOTICE '';

  -- ============================================================
  -- FINAL SUMMARY
  -- ============================================================

  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Initial Inventory:';
  RAISE NOTICE '  Sony FX9: %', camera_initial_qty;
  RAISE NOTICE '  Canon CN-E 35mm: %', lens_initial_qty;
  RAISE NOTICE '';
  RAISE NOTICE 'Final Inventory (should match initial):';
  RAISE NOTICE '  Sony FX9: %', camera_after_subrental_return;
  RAISE NOTICE '  Canon CN-E 35mm: %', lens_after_subrental_return;
  RAISE NOTICE '';

  IF camera_after_subrental_return = camera_initial_qty AND
     lens_after_subrental_return = lens_initial_qty THEN
    RAISE NOTICE '✅ ALL TESTS PASSED!';
    RAISE NOTICE 'Subrental inventory triggers working correctly.';
  ELSE
    RAISE NOTICE '❌ SOME TESTS FAILED!';
    RAISE NOTICE 'Please review trigger implementation.';
  END IF;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- ============================================================
  -- CLEANUP: Delete test data
  -- ============================================================

  RAISE NOTICE '🧹 Cleaning up test data...';

  DELETE FROM rental_items WHERE rental_id IN (test_rental_id, test_subrental_id);
  DELETE FROM rentals WHERE id IN (test_rental_id, test_subrental_id);

  RAISE NOTICE '✅ Test data cleaned up';
  RAISE NOTICE '';

END $$;
