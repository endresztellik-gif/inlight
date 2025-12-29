-- ============================================================
-- SIMPLIFIED SEED DATA for iNLighT Rental Manager
-- ============================================================
-- This script automatically creates admin user profile and seed data
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================

DO $$
DECLARE
  admin_user_id UUID;
  first_auth_user_email TEXT;
BEGIN
  -- ============================================================
  -- STEP 1: Get or create admin user profile
  -- ============================================================

  -- Try to find existing super_admin
  SELECT id INTO admin_user_id
  FROM user_profiles
  WHERE role = 'super_admin'
  LIMIT 1;

  -- If no super_admin, try regular admin
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM user_profiles
    WHERE role = 'admin'
    LIMIT 1;
  END IF;

  -- If still no admin, create one from first auth.users
  IF admin_user_id IS NULL THEN
    -- Get first user from auth.users
    SELECT id, email INTO admin_user_id, first_auth_user_email
    FROM auth.users
    LIMIT 1;

    -- If no auth user exists, raise error
    IF admin_user_id IS NULL THEN
      RAISE EXCEPTION 'No users found in auth.users table. Please create a user first in Supabase Auth Dashboard (https://supabase.com/dashboard/project/njqkdsoccdosydidmkqj/auth/users)';
    END IF;

    -- Create user_profile for the first auth user
    INSERT INTO user_profiles (id, email, role, full_name)
    VALUES (
      admin_user_id,
      first_auth_user_email,
      'super_admin',
      'System Admin'
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Created super_admin profile for user: % (%)', first_auth_user_email, admin_user_id;
  ELSE
    RAISE NOTICE 'Using existing admin user: %', admin_user_id;
  END IF;

  -- ============================================================
  -- STEP 2: INSERT CATEGORIES
  -- ============================================================

  INSERT INTO categories (id, name, name_en, name_hu, description, icon, display_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cameras', 'Cameras', 'Kamerák', 'Professional cinema cameras and camcorders', 'camera', 1, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Lenses', 'Lenses', 'Objektívek', 'Cinema lenses and lens kits', 'focus', 2, TRUE),
  ('33333333-3333-3333-3333-333333333333', 'Lighting', 'Lighting', 'Világítás', 'LED panels, fresnel lights, and lighting accessories', 'lightbulb', 3, TRUE),
  ('44444444-4444-4444-4444-444444444444', 'Audio', 'Audio', 'Hangtechnika', 'Microphones, recorders, and audio accessories', 'mic', 4, TRUE),
  ('55555555-5555-5555-5555-555555555555', 'Grip & Support', 'Grip & Support', 'Grip & Támasztás', 'Tripods, sliders, gimbals, and rigging equipment', 'move', 5, TRUE)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Categories inserted: 5';

  -- ============================================================
  -- STEP 3: INSERT PRODUCTS - CAMERAS
  -- ============================================================

  INSERT INTO products (
    id, category_id, name, name_en, name_hu, description, serial_number,
    daily_rate, weekly_rate, currency, stock_quantity, available_quantity,
    condition, is_active, is_featured, created_by, specifications
  ) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'ARRI Alexa Mini LF',
    'ARRI Alexa Mini LF',
    'ARRI Alexa Mini LF',
    'Compact large-format 4.5K camera with exceptional image quality',
    'ARRI-ALX-2023-089',
    450.00, 2400.00, 'EUR', 2, 2,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"sensor": "LF 36.70 x 25.54 mm", "resolution": "4.5K", "fps": "up to 90 fps", "weight": "2.3 kg"}'::jsonb
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Sony FX9',
    'Sony FX9',
    'Sony FX9',
    'Full-frame 6K cinema camera with autofocus',
    'SONY-FX9-2023-145',
    280.00, 1500.00, 'EUR', 3, 3,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"sensor": "Full-Frame 35.7 x 18.8 mm", "resolution": "6K", "fps": "up to 120 fps", "weight": "2.1 kg"}'::jsonb
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'RED Komodo 6K',
    'RED Komodo 6K',
    'RED Komodo 6K',
    'Compact 6K global shutter camera',
    'RED-KOM-2023-234',
    380.00, 2000.00, 'EUR', 1, 1,
    'excellent', TRUE, FALSE, admin_user_id,
    '{"sensor": "Super35 27.03 x 14.26 mm", "resolution": "6K", "fps": "up to 40 fps", "weight": "2.0 kg"}'::jsonb
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Canon C70',
    'Canon C70',
    'Canon C70',
    'Compact RF mount cinema camera with Dual Gain Output',
    'CAN-C70-2023-087',
    220.00, 1200.00, 'EUR', 2, 2,
    'good', TRUE, FALSE, admin_user_id,
    '{"sensor": "Super35 DGO", "resolution": "4K", "fps": "up to 120 fps", "weight": "1.7 kg"}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Products inserted - Cameras: 4';

  -- ============================================================
  -- STEP 4: INSERT PRODUCTS - LENSES
  -- ============================================================

  INSERT INTO products (
    id, category_id, name, name_en, name_hu, description, serial_number,
    daily_rate, weekly_rate, currency, stock_quantity, available_quantity,
    condition, is_active, is_featured, created_by, specifications
  ) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Canon CN-E 35mm T1.5 L F',
    'Canon CN-E 35mm T1.5 L F',
    'Canon CN-E 35mm T1.5 L F',
    'Full-frame cinema prime lens',
    'CN-35-2022-145',
    80.00, 450.00, 'EUR', 3, 3,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"focal_length": "35mm", "aperture": "T1.5", "mount": "EF", "weight": "1.5 kg"}'::jsonb
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Zeiss CP.3 50mm T2.1',
    'Zeiss CP.3 50mm T2.1',
    'Zeiss CP.3 50mm T2.1',
    'Compact cinema prime with interchangeable mount',
    'ZEI-CP3-2023-089',
    95.00, 500.00, 'EUR', 2, 2,
    'excellent', TRUE, FALSE, admin_user_id,
    '{"focal_length": "50mm", "aperture": "T2.1", "mount": "PL/EF", "weight": "1.2 kg"}'::jsonb
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Sigma 18-35mm T2.0',
    'Sigma 18-35mm T2.0',
    'Sigma 18-35mm T2.0',
    'High-speed zoom lens for Super35',
    'SIG-1835-2023-234',
    70.00, 400.00, 'EUR', 2, 2,
    'good', TRUE, FALSE, admin_user_id,
    '{"focal_length": "18-35mm", "aperture": "T2.0", "mount": "EF", "weight": "0.8 kg"}'::jsonb
  ),
  (
    'b4444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'Cooke S4/i 25mm T2.0',
    'Cooke S4/i 25mm T2.0',
    'Cooke S4/i 25mm T2.0',
    'Classic cinema prime with Cooke Look',
    'COO-S4I-2022-156',
    120.00, 650.00, 'EUR', 1, 1,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"focal_length": "25mm", "aperture": "T2.0", "mount": "PL", "weight": "1.4 kg"}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Products inserted - Lenses: 4';

  -- ============================================================
  -- STEP 5: INSERT PRODUCTS - LIGHTING
  -- ============================================================

  INSERT INTO products (
    id, category_id, name, name_en, name_hu, description, serial_number,
    daily_rate, weekly_rate, currency, stock_quantity, available_quantity,
    condition, is_active, is_featured, created_by, specifications
  ) VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'ARRI SkyPanel S60-C',
    'ARRI SkyPanel S60-C',
    'ARRI SkyPanel S60-C',
    'Color-tunable LED soft light',
    'ARRI-SKY-2023-089',
    85.00, 450.00, 'EUR', 4, 4,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"type": "LED Panel", "output": "4300 lux at 3m", "cri": "96+", "weight": "9.5 kg"}'::jsonb
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'Aputure 600d Pro',
    'Aputure 600d Pro',
    'Aputure 600d Pro',
    'High-output LED point source',
    'APU-600-2023-145',
    95.00, 500.00, 'EUR', 2, 2,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"type": "LED Fresnel", "output": "600W", "cri": "96+", "weight": "10.5 kg"}'::jsonb
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Litepanels Gemini 2x1',
    'Litepanels Gemini 2x1',
    'Litepanels Gemini 2x1',
    'Soft RGB LED panel',
    'LIT-GEM-2023-234',
    75.00, 400.00, 'EUR', 3, 3,
    'good', TRUE, FALSE, admin_user_id,
    '{"type": "LED Panel", "size": "2x1 ft", "cri": "97+", "weight": "7.3 kg"}'::jsonb
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'Nanlite Forza 500',
    'Nanlite Forza 500',
    'Nanlite Forza 500',
    'Powerful LED monolight',
    'NAN-FOR-2023-087',
    65.00, 350.00, 'EUR', 4, 4,
    'excellent', TRUE, FALSE, admin_user_id,
    '{"type": "LED Monolight", "output": "500W", "cri": "98+", "weight": "5.2 kg"}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Products inserted - Lighting: 4';

  -- ============================================================
  -- STEP 6: INSERT PRODUCTS - AUDIO
  -- ============================================================

  INSERT INTO products (
    id, category_id, name, name_en, name_hu, description, serial_number,
    daily_rate, weekly_rate, currency, stock_quantity, available_quantity,
    condition, is_active, is_featured, created_by, specifications
  ) VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'Sennheiser MKH 416',
    'Sennheiser MKH 416',
    'Sennheiser MKH 416',
    'Industry-standard short shotgun microphone',
    'SEN-MKH-2022-145',
    45.00, 250.00, 'EUR', 4, 4,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"type": "Shotgun Mic", "pattern": "Super-cardioid", "connector": "XLR", "weight": "0.1 kg"}'::jsonb
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'Sound Devices MixPre-6 II',
    'Sound Devices MixPre-6 II',
    'Sound Devices MixPre-6 II',
    'Professional 6-channel audio recorder/mixer',
    'SD-MIX6-2023-089',
    85.00, 450.00, 'EUR', 2, 2,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"type": "Recorder/Mixer", "channels": "6", "resolution": "32-bit float", "weight": "0.9 kg"}'::jsonb
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'Rode NTG5',
    'Rode NTG5',
    'Rode NTG5',
    'Lightweight location recording shotgun mic',
    'ROD-NTG-2023-234',
    40.00, 220.00, 'EUR', 3, 3,
    'good', TRUE, FALSE, admin_user_id,
    '{"type": "Shotgun Mic", "pattern": "Super-cardioid", "connector": "XLR", "weight": "0.076 kg"}'::jsonb
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Lectrosonics Wireless Kit',
    'Lectrosonics Wireless Kit',
    'Lectrosonics Wireless Kit',
    'Professional wireless lavalier system',
    'LEC-WIR-2023-087',
    95.00, 500.00, 'EUR', 3, 3,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"type": "Wireless System", "range": "100m", "frequency": "UHF", "weight": "0.3 kg"}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Products inserted - Audio: 4';

  -- ============================================================
  -- SUMMARY
  -- ============================================================

  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '📦 Categories: 5 (Cameras, Lenses, Lighting, Audio, Grip & Support)';
  RAISE NOTICE '🎬 Products: 20 (Cameras: 4, Lenses: 4, Lighting: 4, Audio: 4, Grip: 0)';
  RAISE NOTICE '👤 Admin user ID: %', admin_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your iNLighT Rental Manager database is ready!';

END $$;
