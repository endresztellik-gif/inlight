-- ============================================================
-- Create Super Admin User: admin@inlight.hu
-- ============================================================
--
-- IMPORTANT: This script must be run in Supabase SQL Editor
-- or using Supabase CLI after creating the auth user.
--
-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Step 2: Click "Add User" > "Create new user"
--         Email: admin@inlight.hu
--         Password: geri_2026
--         Auto Confirm User: YES
-- Step 3: Copy the User ID from the created user
-- Step 4: Run this SQL with the User ID
-- ============================================================

DO $$
DECLARE
  v_user_id UUID := 'PASTE_USER_ID_HERE'; -- Replace with actual user ID from Step 3
  v_email VARCHAR := 'admin@inlight.hu';
  v_full_name VARCHAR := 'Sztellik Gergely';
  v_role VARCHAR := 'super_admin';
BEGIN
  -- Check if user already exists in user_profiles
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = v_user_id) THEN
    RAISE NOTICE 'User already exists in user_profiles, updating...';

    UPDATE user_profiles
    SET
      email = v_email,
      full_name = v_full_name,
      role = v_role,
      is_active = true,
      updated_at = now()
    WHERE id = v_user_id;

    RAISE NOTICE 'User profile updated successfully!';
  ELSE
    -- Create new user_profiles entry
    INSERT INTO user_profiles (id, email, full_name, role, is_active)
    VALUES (v_user_id, v_email, v_full_name, v_role, true);

    RAISE NOTICE 'User profile created successfully!';
  END IF;

  -- Verify creation
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Super Admin User Created:';
  RAISE NOTICE '  ID: %', v_user_id;
  RAISE NOTICE '  Email: %', v_email;
  RAISE NOTICE '  Name: %', v_full_name;
  RAISE NOTICE '  Role: %', v_role;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Credentials:';
  RAISE NOTICE '  Email: %', v_email;
  RAISE NOTICE '  Password: geri_2026';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Please change password after first login!';
  RAISE NOTICE '========================================';
END $$;

-- Optional: Verify the user was created
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM user_profiles
WHERE email = 'admin@inlight.hu';
