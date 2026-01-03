-- ============================================================
-- SUBRENTAL INVENTORY TRIGGER TEST (Simple Version)
-- Returns table results instead of RAISE NOTICE
-- ============================================================

DO $$
DECLARE
  admin_user_id UUID;
  test_client_id UUID := 'c1111111-1111-1111-1111-111111111111';
  camera_id UUID := 'a2222222-2222-2222-2222-222222222222'; -- Sony FX9
  lens_id UUID := 'b1111111-1111-1111-1111-111111111111';   -- Canon CN-E 35mm
  test_rental_id UUID;
  test_subrental_id UUID;
BEGIN
  -- Get admin user
  SELECT id INTO admin_user_id FROM user_profiles WHERE role = 'super_admin' LIMIT 1;
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM user_profiles WHERE role = 'admin' LIMIT 1;
  END IF;

  -- Generate test IDs
  test_rental_id := gen_random_uuid();
  test_subrental_id := gen_random_uuid();

  -- Create temporary results table
  CREATE TEMP TABLE IF NOT EXISTS test_results (
    step INTEGER,
    operation TEXT,
    camera_qty INTEGER,
    lens_qty INTEGER,
    expected TEXT
  );

  -- Step 1: Initial inventory
  INSERT INTO test_results
  SELECT
    1,
    '1. Initial Inventory',
    (SELECT available_quantity FROM products WHERE id = camera_id),
    (SELECT available_quantity FROM products WHERE id = lens_id),
    'Baseline'::TEXT;

  -- Step 2: Create RENTAL (should decrease inventory)
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, final_currency, final_total, created_by
  ) VALUES (
    test_rental_id, 'R-TEST-001', test_client_id, 'Test Rental',
    CURRENT_DATE, CURRENT_DATE + 5, 'active', 'rental', 'EUR', 1000.00, admin_user_id
  );

  INSERT INTO rental_items (rental_id, product_id, quantity, daily_rate, days, subtotal, condition_on_pickup, is_returned)
  VALUES
    (test_rental_id, camera_id, 1, 280.00, 5, 1400.00, 'excellent', false),
    (test_rental_id, lens_id, 2, 80.00, 5, 800.00, 'excellent', false);

  INSERT INTO test_results
  SELECT
    2,
    '2. After RENTAL created',
    (SELECT available_quantity FROM products WHERE id = camera_id),
    (SELECT available_quantity FROM products WHERE id = lens_id),
    'Camera -1, Lens -2'::TEXT;

  -- Step 3: Create SUBRENTAL (should NOT change inventory)
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, supplier_name, final_currency, final_total, created_by
  ) VALUES (
    test_subrental_id, 'S-TEST-001', test_client_id, 'Test Subrental',
    CURRENT_DATE, CURRENT_DATE + 3, 'active', 'subrental', 'Test Supplier', 'EUR', 800.00, admin_user_id
  );

  INSERT INTO rental_items (rental_id, product_id, quantity, daily_rate, days, purchase_price, subtotal, condition_on_pickup, is_returned)
  VALUES
    (test_subrental_id, camera_id, 1, 280.00, 3, 180.00, 840.00, 'excellent', false),
    (test_subrental_id, lens_id, 1, 80.00, 3, 50.00, 240.00, 'excellent', false);

  INSERT INTO test_results
  SELECT
    3,
    '3. After SUBRENTAL created',
    (SELECT available_quantity FROM products WHERE id = camera_id),
    (SELECT available_quantity FROM products WHERE id = lens_id),
    'NO CHANGE'::TEXT;

  -- Step 4: Return RENTAL (should increase inventory)
  UPDATE rental_items SET is_returned = true, returned_at = NOW(), condition_on_return = 'excellent'
  WHERE rental_id = test_rental_id;
  UPDATE rentals SET status = 'completed' WHERE id = test_rental_id;

  INSERT INTO test_results
  SELECT
    4,
    '4. After RENTAL returned',
    (SELECT available_quantity FROM products WHERE id = camera_id),
    (SELECT available_quantity FROM products WHERE id = lens_id),
    'Camera +1, Lens +2'::TEXT;

  -- Step 5: Return SUBRENTAL (should NOT change inventory)
  UPDATE rental_items SET is_returned = true, returned_at = NOW(), condition_on_return = 'excellent'
  WHERE rental_id = test_subrental_id;
  UPDATE rentals SET status = 'completed' WHERE id = test_subrental_id;

  INSERT INTO test_results
  SELECT
    5,
    '5. After SUBRENTAL returned',
    (SELECT available_quantity FROM products WHERE id = camera_id),
    (SELECT available_quantity FROM products WHERE id = lens_id),
    'NO CHANGE'::TEXT;

  -- Cleanup
  DELETE FROM rental_items WHERE rental_id IN (test_rental_id, test_subrental_id);
  DELETE FROM rentals WHERE id IN (test_rental_id, test_subrental_id);

END $$;

-- Show results
SELECT
  step,
  operation,
  camera_qty AS "Sony FX9 Available",
  lens_qty AS "Canon CN-E 35mm Available",
  expected AS "Expected Change"
FROM test_results
ORDER BY step;

-- Cleanup temp table
DROP TABLE IF EXISTS test_results;
