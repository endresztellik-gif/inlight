-- ============================================================
-- SEED DATA for iNLighT Rental Manager
-- ============================================================
--
-- IMPORTANT: Before running this seed file, you must:
-- 1. Create at least one super_admin user in Supabase Auth Dashboard
-- 2. Note the user UUID from auth.users table
-- 3. Replace 'YOUR_USER_UUID_HERE' below with the actual UUID
--
-- To get user UUID:
-- SELECT id, email FROM auth.users;
-- ============================================================

-- Temporary variable for created_by (replace with your super_admin UUID)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to get first super_admin user
  SELECT id INTO admin_user_id
  FROM user_profiles
  WHERE role = 'super_admin'
  LIMIT 1;

  -- If no super_admin found, use first admin
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM user_profiles
    WHERE role = 'admin'
    LIMIT 1;
  END IF;

  -- If still no user found, raise error
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No admin users found. Please create a user first in Supabase Auth Dashboard.';
  END IF;

  -- ============================================================
  -- INSERT CATEGORIES
  -- ============================================================

  INSERT INTO categories (id, name, name_en, name_hu, description, icon, display_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cameras', 'Cameras', 'Kamerák', 'Professional cinema cameras and camcorders', 'camera', 1, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Lenses', 'Lenses', 'Objektívek', 'Cinema lenses and lens kits', 'focus', 2, TRUE),
  ('33333333-3333-3333-3333-333333333333', 'Lighting', 'Lighting', 'Világítás', 'LED panels, fresnel lights, and lighting accessories', 'lightbulb', 3, TRUE),
  ('44444444-4444-4444-4444-444444444444', 'Audio', 'Audio', 'Hangtechnika', 'Microphones, recorders, and audio accessories', 'mic', 4, TRUE),
  ('55555555-5555-5555-5555-555555555555', 'Grip & Support', 'Grip & Support', 'Grip & Támasztás', 'Tripods, sliders, gimbals, and rigging equipment', 'move', 5, TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- INSERT PRODUCTS - CAMERAS
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

  -- ============================================================
  -- INSERT PRODUCTS - LENSES
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

  -- ============================================================
  -- INSERT PRODUCTS - LIGHTING
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

  -- ============================================================
  -- INSERT PRODUCTS - AUDIO
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

  -- ============================================================
  -- INSERT PRODUCTS - GRIP & SUPPORT
  -- ============================================================

  INSERT INTO products (
    id, category_id, name, name_en, name_hu, description, serial_number,
    daily_rate, weekly_rate, currency, stock_quantity, available_quantity,
    condition, is_active, is_featured, created_by, specifications
  ) VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    'Sachtler Video 18 S2 Tripod',
    'Sachtler Video 18 S2 Tripod',
    'Sachtler Video 18 S2 Tripod',
    'Professional fluid head tripod system',
    'SAC-V18-2022-145',
    55.00, 300.00, 'EUR', 3, 3,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"type": "Tripod System", "capacity": "18 kg", "height": "160 cm", "weight": "6.8 kg"}'::jsonb
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    'DJI Ronin 2 Gimbal',
    'DJI Ronin 2 Gimbal',
    'DJI Ronin 2 Gimbal',
    '3-axis motorized gimbal stabilizer',
    'DJI-RON-2023-089',
    150.00, 800.00, 'EUR', 2, 2,
    'excellent', TRUE, TRUE, admin_user_id,
    '{"type": "Gimbal", "capacity": "13.6 kg", "battery": "up to 2.5h", "weight": "4.7 kg"}'::jsonb
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'Dana Dolly Camera Slider',
    'Dana Dolly Camera Slider',
    'Dana Dolly Camera Slider',
    'Professional camera dolly system',
    'DAN-DOL-2023-234',
    85.00, 450.00, 'EUR', 2, 2,
    'good', TRUE, FALSE, admin_user_id,
    '{"type": "Dolly/Slider", "track_length": "3m", "capacity": "45 kg", "weight": "12 kg"}'::jsonb
  ),
  (
    'e4444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    'Matthews C-Stand Kit',
    'Matthews C-Stand Kit',
    'Matthews C-Stand Kit',
    'Heavy-duty grip stand with arm and grip head',
    'MAT-CST-2023-087',
    15.00, 80.00, 'EUR', 8, 8,
    'good', TRUE, FALSE, admin_user_id,
    '{"type": "C-Stand", "height": "3.3m", "capacity": "10 kg", "weight": "5.4 kg"}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- INSERT CLIENTS
  -- ============================================================

  INSERT INTO clients (
    id, name, email, phone, company, address, tax_number,
    contact_person_name, contact_person_email, contact_person_phone, created_by
  ) VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'Budapest Film Studios',
    'info@bpfilmstudios.hu',
    '+36 1 234 5678',
    'Budapest Film Studios Kft.',
    '1024 Budapest, Rómer Flóris utca 12.',
    '12345678-1-41',
    'Nagy Péter',
    'peter.nagy@bpfilmstudios.hu',
    '+36 30 123 4567',
    admin_user_id
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'CinePro Productions',
    'office@cinepro.hu',
    '+36 1 345 6789',
    'CinePro Productions Ltd.',
    '1062 Budapest, Andrássy út 45.',
    '23456789-2-41',
    'Kovács Anna',
    'anna.kovacs@cinepro.hu',
    '+36 30 234 5678',
    admin_user_id
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Independent Filmmaker',
    'szabados.mark@gmail.com',
    '+36 30 987 6543',
    NULL,
    '1051 Budapest, Nádor utca 8.',
    NULL,
    NULL,
    NULL,
    NULL,
    admin_user_id
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'Vision Media Group',
    'contact@visionmedia.hu',
    '+36 1 456 7890',
    'Vision Media Group Zrt.',
    '1132 Budapest, Váci út 76.',
    '34567890-2-41',
    'Tóth István',
    'istvan.toth@visionmedia.hu',
    '+36 30 345 6789',
    admin_user_id
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'Creative Film Agency',
    'info@creativefilm.hu',
    '+36 1 567 8901',
    'Creative Film Agency Kft.',
    '1094 Budapest, Ráday utca 23.',
    '45678901-1-41',
    'Szabó Éva',
    'eva.szabo@creativefilm.hu',
    '+36 30 456 7890',
    admin_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- INSERT RENTALS (M1 - Own inventory)
  -- ============================================================

  -- Active Rental 1
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, notes, final_currency, final_total, created_by
  ) VALUES
  (
    'e0001111-0001-0001-0001-000000000001',
    'R-20250105-0001',
    'c1111111-1111-1111-1111-111111111111',
    'Budapest Nights - Feature Film',
    '2025-01-05',
    '2025-01-25',
    'active',
    'rental',
    'Main unit package for 3-week shoot',
    'EUR',
    32500.00,
    admin_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- Rental items for active rental 1
  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, subtotal, condition_on_pickup, is_returned
  ) VALUES
  ('e0001111-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111111', 1, 450.00, 20, 9000.00, 'excellent', false),
  ('e0001111-0001-0001-0001-000000000001', 'b4444444-4444-4444-4444-444444444444', 1, 120.00, 20, 2400.00, 'excellent', false),
  ('e0001111-0001-0001-0001-000000000001', 'c1111111-1111-1111-1111-111111111111', 2, 85.00, 20, 3400.00, 'good', false),
  ('e0001111-0001-0001-0001-000000000001', 'd1111111-1111-1111-1111-111111111111', 2, 45.00, 20, 1800.00, 'good', false)
  ON CONFLICT DO NOTHING;

  -- Active Rental 2
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, notes, final_currency, final_total, created_by
  ) VALUES
  (
    'e0001111-0001-0001-0001-000000000002',
    'R-20250110-0001',
    'c2222222-2222-2222-2222-222222222222',
    'Commercial - Car Brand Launch',
    '2025-01-12',
    '2025-01-15',
    'active',
    'rental',
    '3-day commercial shoot',
    'EUR',
    2800.00,
    admin_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, subtotal, condition_on_pickup, is_returned
  ) VALUES
  ('e0001111-0001-0001-0001-000000000002', 'a2222222-2222-2222-2222-222222222222', 1, 280.00, 3, 840.00, 'excellent', false),
  ('e0001111-0001-0001-0001-000000000002', 'c2222222-2222-2222-2222-222222222222', 2, 95.00, 3, 570.00, 'excellent', false)
  ON CONFLICT DO NOTHING;

  -- Completed Rental
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, notes, final_currency, final_total, created_by
  ) VALUES
  (
    'e0001111-0001-0001-0001-000000000003',
    'R-20241201-0001',
    'c5555555-5555-5555-5555-555555555555',
    'Corporate Video Package',
    '2024-12-05',
    '2024-12-08',
    'completed',
    'rental',
    'Interview and B-roll setup',
    'EUR',
    1950.00,
    admin_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, subtotal,
    condition_on_pickup, is_returned, condition_on_return, returned_at
  ) VALUES
  (
    'e0001111-0001-0001-0001-000000000003',
    'a4444444-4444-4444-4444-444444444444',
    1, 220.00, 3, 660.00,
    'good', true, 'good', '2024-12-08T18:30:00Z'
  ),
  (
    'e0001111-0001-0001-0001-000000000003',
    'd2222222-2222-2222-2222-222222222222',
    1, 85.00, 3, 255.00,
    'excellent', true, 'excellent', '2024-12-08T18:30:00Z'
  ),
  (
    'e0001111-0001-0001-0001-000000000003',
    'd1111111-1111-1111-1111-111111111111',
    2, 45.00, 3, 270.00,
    'excellent', true, 'excellent', '2024-12-08T18:30:00Z'
  )
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- INSERT SUBRENTALS (M2 - Rented from suppliers)
  -- ============================================================

  -- Active Subrental 1
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, supplier_name, supplier_contact, supplier_notes, notes,
    final_currency, final_total, created_by
  ) VALUES
  (
    'f0001111-0001-0001-0001-000000000001',
    'S-20250108-0001',
    'c4444444-4444-4444-4444-444444444444',
    'High-End Fashion Campaign',
    '2025-01-10',
    '2025-01-14',
    'active',
    'subrental',
    'Pro Camera Rental Budapest',
    'rentals@procamera.hu / +36 1 999 8888',
    'Special RED package deal',
    'Client requested specific RED Raptor package not in our inventory',
    'EUR',
    6500.00,
    admin_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- Subrental items with purchase_price
  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, purchase_price, subtotal,
    condition_on_pickup, is_returned
  ) VALUES
  (
    'f0001111-0001-0001-0001-000000000001',
    'a3333333-3333-3333-3333-333333333333',
    1, 380.00, 4, 250.00, 1520.00,
    'excellent', false
  ),
  (
    'f0001111-0001-0001-0001-000000000001',
    'b2222222-2222-2222-2222-222222222222',
    1, 95.00, 4, 60.00, 380.00,
    'excellent', false
  )
  ON CONFLICT DO NOTHING;

  -- Completed Subrental 1
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, supplier_name, supplier_contact, supplier_notes, notes,
    final_currency, final_total, created_by
  ) VALUES
  (
    'f0001111-0001-0001-0001-000000000002',
    'S-20241205-0001',
    'c2222222-2222-2222-2222-222222222222',
    'TV Series Episode 3',
    '2024-12-08',
    '2024-12-15',
    'completed',
    'subrental',
    'Lighting Solutions Hungary',
    'orders@lightingsolutions.hu / +36 1 777 6666',
    'Bulk lighting package discount applied',
    'Large lighting setup for night scenes',
    'EUR',
    5600.00,
    admin_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, purchase_price, subtotal,
    condition_on_pickup, is_returned, condition_on_return, returned_at
  ) VALUES
  (
    'f0001111-0001-0001-0001-000000000002',
    'c1111111-1111-1111-1111-111111111111',
    3, 85.00, 7, 55.00, 1785.00,
    'excellent', true, 'excellent', '2024-12-15T19:00:00Z'
  ),
  (
    'f0001111-0001-0001-0001-000000000002',
    'c4444444-4444-4444-4444-444444444444',
    2, 65.00, 7, 40.00, 910.00,
    'good', true, 'good', '2024-12-15T19:00:00Z'
  )
  ON CONFLICT DO NOTHING;

  -- Completed Subrental 2
  INSERT INTO rentals (
    id, rental_number, client_id, project_name, start_date, end_date,
    status, type, supplier_name, supplier_contact, supplier_notes, notes,
    final_currency, final_total, created_by
  ) VALUES
  (
    'f0001111-0001-0001-0001-000000000003',
    'S-20241120-0001',
    'c3333333-3333-3333-3333-333333333333',
    'Documentary - Audio Package',
    '2024-11-22',
    '2024-11-28',
    'completed',
    'subrental',
    'Audio Masters Budapest',
    'info@audiomasters.hu / +36 1 555 4444',
    'Premium wireless system rental',
    'High-end wireless audio not in stock',
    'EUR',
    1600.00,
    admin_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO rental_items (
    rental_id, product_id, quantity, daily_rate, days, purchase_price, subtotal,
    condition_on_pickup, is_returned, condition_on_return, returned_at
  ) VALUES
  (
    'f0001111-0001-0001-0001-000000000003',
    'd4444444-4444-4444-4444-444444444444',
    2, 95.00, 6, 65.00, 1140.00,
    'excellent', true, 'excellent', '2024-11-28T17:30:00Z'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Categories: 5 (Cameras, Lenses, Lighting, Audio, Grip & Support)';
  RAISE NOTICE 'Products: 20 (Cameras: 4, Lenses: 4, Lighting: 4, Audio: 4, Grip: 4)';
  RAISE NOTICE 'Clients: 5';
  RAISE NOTICE 'Rentals (M1): 3 (2 active, 1 completed)';
  RAISE NOTICE 'Subrentals (M2): 3 (1 active, 2 completed)';
  RAISE NOTICE 'Total Rentals: 6';
  RAISE NOTICE 'Admin user ID used: %', admin_user_id;
  RAISE NOTICE '========================================';
END $$;
