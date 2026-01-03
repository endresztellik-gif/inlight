import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://njqkdsoccdosydidmkqj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ejdq8CvEk1rAWq0o3FkH_g_DlEgiIoR'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('\n🌱 ===== DATABASE SEEDING SCRIPT =====\n')

async function seedDatabase() {
  try {
    // Try to get admin user from user_profiles, otherwise use a placeholder
    let adminUserId = null

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .in('role', ['super_admin', 'admin'])
      .limit(1)
      .single()

    if (profiles) {
      adminUserId = profiles.id
      console.log('✅ Using existing admin user:', profiles.email, '(' + profiles.role + ')')
      console.log('   User ID:', adminUserId)
    } else {
      // Use a placeholder UUID - this will be replaced when first admin logs in
      adminUserId = '00000000-0000-0000-0000-000000000000'
      console.log('⚠️  No admin users found, using placeholder UUID')
      console.log('   Note: created_by will need to be updated when first admin logs in')
    }

    // ============================================================
    // 1. CATEGORIES
    // ============================================================
    console.log('\n📁 Inserting categories...')

    const categories = [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Cameras', name_en: 'Cameras', name_hu: 'Kamerák', description: 'Professional cinema cameras', icon: 'camera', display_order: 1 },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Lenses', name_en: 'Lenses', name_hu: 'Objektívek', description: 'Cinema lenses and lens kits', icon: 'focus', display_order: 2 },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Lighting', name_en: 'Lighting', name_hu: 'Világítás', description: 'LED panels and lighting', icon: 'lightbulb', display_order: 3 },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Audio', name_en: 'Audio', name_hu: 'Hangtechnika', description: 'Microphones and audio gear', icon: 'mic', display_order: 4 },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Grip & Support', name_en: 'Grip & Support', name_hu: 'Grip', description: 'Tripods, sliders, gimbals', icon: 'move', display_order: 5 }
    ]

    for (const cat of categories) {
      const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'id' })
      if (error) console.log('  ⚠️  Category error:', error.message)
    }
    console.log('   ✅ Categories inserted: 5')

    // ============================================================
    // 2. PRODUCTS
    // ============================================================
    console.log('\n📦 Inserting products...')

    const products = [
      // Cameras
      { id: 'a1111111-1111-1111-1111-111111111111', category_id: '11111111-1111-1111-1111-111111111111', name: 'ARRI Alexa Mini LF', name_en: 'ARRI Alexa Mini LF', name_hu: 'ARRI Alexa Mini LF', description: 'Compact large-format 4.5K camera', serial_number: 'ARRI-ALX-001', daily_rate: 450.00, weekly_rate: 2400.00, currency: 'EUR', stock_quantity: 2, available_quantity: 2, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },
      { id: 'a2222222-2222-2222-2222-222222222222', category_id: '11111111-1111-1111-1111-111111111111', name: 'Sony FX9', name_en: 'Sony FX9', name_hu: 'Sony FX9', description: 'Full-frame 6K cinema camera', serial_number: 'SONY-FX9-001', daily_rate: 280.00, weekly_rate: 1500.00, currency: 'EUR', stock_quantity: 3, available_quantity: 3, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },
      { id: 'a3333333-3333-3333-3333-333333333333', category_id: '11111111-1111-1111-1111-111111111111', name: 'RED Komodo 6K', name_en: 'RED Komodo 6K', name_hu: 'RED Komodo 6K', description: 'Compact 6K global shutter', serial_number: 'RED-KOM-001', daily_rate: 380.00, weekly_rate: 2000.00, currency: 'EUR', stock_quantity: 1, available_quantity: 1, condition: 'excellent', is_active: true, is_featured: false, created_by: adminUserId },
      { id: 'a4444444-4444-4444-4444-444444444444', category_id: '11111111-1111-1111-1111-111111111111', name: 'Canon C70', name_en: 'Canon C70', name_hu: 'Canon C70', description: 'Compact RF mount cinema camera', serial_number: 'CAN-C70-001', daily_rate: 220.00, weekly_rate: 1200.00, currency: 'EUR', stock_quantity: 2, available_quantity: 2, condition: 'good', is_active: true, is_featured: false, created_by: adminUserId },

      // Lenses
      { id: 'b1111111-1111-1111-1111-111111111111', category_id: '22222222-2222-2222-2222-222222222222', name: 'Canon CN-E 35mm T1.5', name_en: 'Canon CN-E 35mm T1.5', name_hu: 'Canon CN-E 35mm T1.5', description: 'Full-frame cinema prime', serial_number: 'CN-35-001', daily_rate: 80.00, weekly_rate: 450.00, currency: 'EUR', stock_quantity: 3, available_quantity: 3, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },
      { id: 'b2222222-2222-2222-2222-222222222222', category_id: '22222222-2222-2222-2222-222222222222', name: 'Zeiss CP.3 50mm T2.1', name_en: 'Zeiss CP.3 50mm T2.1', name_hu: 'Zeiss CP.3 50mm T2.1', description: 'Compact cinema prime', serial_number: 'ZEI-CP3-001', daily_rate: 95.00, weekly_rate: 500.00, currency: 'EUR', stock_quantity: 2, available_quantity: 2, condition: 'excellent', is_active: true, is_featured: false, created_by: adminUserId },
      { id: 'b4444444-4444-4444-4444-444444444444', category_id: '22222222-2222-2222-2222-222222222222', name: 'Cooke S4/i 25mm T2.0', name_en: 'Cooke S4/i 25mm T2.0', name_hu: 'Cooke S4/i 25mm T2.0', description: 'Classic cinema prime', serial_number: 'COO-S4I-001', daily_rate: 120.00, weekly_rate: 650.00, currency: 'EUR', stock_quantity: 1, available_quantity: 1, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },

      // Lighting
      { id: 'c1111111-1111-1111-1111-111111111111', category_id: '33333333-3333-3333-3333-333333333333', name: 'ARRI SkyPanel S60-C', name_en: 'ARRI SkyPanel S60-C', name_hu: 'ARRI SkyPanel S60-C', description: 'Color-tunable LED soft light', serial_number: 'ARRI-SKY-001', daily_rate: 85.00, weekly_rate: 450.00, currency: 'EUR', stock_quantity: 4, available_quantity: 4, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },
      { id: 'c2222222-2222-2222-2222-222222222222', category_id: '33333333-3333-3333-3333-333333333333', name: 'Aputure 600d Pro', name_en: 'Aputure 600d Pro', name_hu: 'Aputure 600d Pro', description: 'High-output LED point source', serial_number: 'APU-600-001', daily_rate: 95.00, weekly_rate: 500.00, currency: 'EUR', stock_quantity: 2, available_quantity: 2, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },
      { id: 'c4444444-4444-4444-4444-444444444444', category_id: '33333333-3333-3333-3333-333333333333', name: 'Nanlite Forza 500', name_en: 'Nanlite Forza 500', name_hu: 'Nanlite Forza 500', description: 'Powerful LED monolight', serial_number: 'NAN-FOR-001', daily_rate: 65.00, weekly_rate: 350.00, currency: 'EUR', stock_quantity: 4, available_quantity: 4, condition: 'excellent', is_active: true, is_featured: false, created_by: adminUserId },

      // Audio
      { id: 'd1111111-1111-1111-1111-111111111111', category_id: '44444444-4444-4444-4444-444444444444', name: 'Sennheiser MKH 416', name_en: 'Sennheiser MKH 416', name_hu: 'Sennheiser MKH 416', description: 'Industry-standard shotgun mic', serial_number: 'SEN-MKH-001', daily_rate: 45.00, weekly_rate: 250.00, currency: 'EUR', stock_quantity: 4, available_quantity: 4, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },
      { id: 'd2222222-2222-2222-2222-222222222222', category_id: '44444444-4444-4444-4444-444444444444', name: 'Sound Devices MixPre-6 II', name_en: 'Sound Devices MixPre-6 II', name_hu: 'Sound Devices MixPre-6 II', description: '6-channel audio recorder/mixer', serial_number: 'SD-MIX6-001', daily_rate: 85.00, weekly_rate: 450.00, currency: 'EUR', stock_quantity: 2, available_quantity: 2, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId },
      { id: 'd4444444-4444-4444-4444-444444444444', category_id: '44444444-4444-4444-4444-444444444444', name: 'Lectrosonics Wireless Kit', name_en: 'Lectrosonics Wireless Kit', name_hu: 'Lectrosonics Wireless Kit', description: 'Professional wireless lavalier', serial_number: 'LEC-WIR-001', daily_rate: 95.00, weekly_rate: 500.00, currency: 'EUR', stock_quantity: 3, available_quantity: 3, condition: 'excellent', is_active: true, is_featured: true, created_by: adminUserId }
    ]

    for (const prod of products) {
      const { error } = await supabase.from('products').upsert(prod, { onConflict: 'id' })
      if (error) console.log('  ⚠️  Product error:', error.message)
    }
    console.log('   ✅ Products inserted: 14')

    // ============================================================
    // 3. CLIENTS
    // ============================================================
    console.log('\n👥 Inserting clients...')

    const clients = [
      { id: 'cl111111-1111-1111-1111-111111111111', name: 'Budapest Film Studios', email: 'info@bpfilmstudios.hu', phone: '+36 1 234 5678', company: 'Budapest Film Studios Kft.', address: '1024 Budapest, Rómer Flóris utca 12.', tax_number: '12345678-1-41', contact_person_name: 'Nagy Péter', contact_person_email: 'peter.nagy@bpfilmstudios.hu', contact_person_phone: '+36 30 123 4567' },
      { id: 'cl222222-2222-2222-2222-222222222222', name: 'CinePro Productions', email: 'office@cinepro.hu', phone: '+36 1 345 6789', company: 'CinePro Productions Ltd.', address: '1062 Budapest, Andrássy út 45.', tax_number: '23456789-2-41', contact_person_name: 'Kovács Anna', contact_person_email: 'anna.kovacs@cinepro.hu', contact_person_phone: '+36 30 234 5678' },
      { id: 'cl333333-3333-3333-3333-333333333333', name: 'Independent Filmmaker', email: 'szabados.mark@gmail.com', phone: '+36 30 987 6543', address: '1051 Budapest, Nádor utca 8.' },
      { id: 'cl444444-4444-4444-4444-444444444444', name: 'Vision Media Group', email: 'contact@visionmedia.hu', phone: '+36 1 456 7890', company: 'Vision Media Group Zrt.', address: '1132 Budapest, Váci út 76.', tax_number: '34567890-2-41', contact_person_name: 'Tóth István', contact_person_email: 'istvan.toth@visionmedia.hu', contact_person_phone: '+36 30 345 6789' },
      { id: 'cl555555-5555-5555-5555-555555555555', name: 'Creative Film Agency', email: 'info@creativefilm.hu', phone: '+36 1 567 8901', company: 'Creative Film Agency Kft.', address: '1094 Budapest, Ráday utca 23.', tax_number: '45678901-1-41', contact_person_name: 'Szabó Éva', contact_person_email: 'eva.szabo@creativefilm.hu', contact_person_phone: '+36 30 456 7890' }
    ]

    for (const client of clients) {
      const { error } = await supabase.from('clients').upsert(client, { onConflict: 'id' })
      if (error) console.log('  ⚠️  Client error:', error.message)
    }
    console.log('   ✅ Clients inserted: 5')

    // ============================================================
    // 4. RENTALS (M1)
    // ============================================================
    console.log('\n📋 Inserting rentals...')

    const rentals = [
      { id: 'r0001111-0001-0001-0001-000000000001', rental_number: 'R-20250105-0001', client_id: 'cl111111-1111-1111-1111-111111111111', project_name: 'Budapest Nights - Feature Film', start_date: '2025-01-05', end_date: '2025-01-25', status: 'active', type: 'rental', notes: 'Main unit package for 3-week shoot', final_currency: 'EUR', final_total: 32500.00, created_by: adminUserId },
      { id: 'r0001111-0001-0001-0001-000000000002', rental_number: 'R-20250110-0001', client_id: 'cl222222-2222-2222-2222-222222222222', project_name: 'Commercial - Car Brand Launch', start_date: '2025-01-12', end_date: '2025-01-15', status: 'active', type: 'rental', notes: '3-day commercial shoot', final_currency: 'EUR', final_total: 2800.00, created_by: adminUserId },
      { id: 'r0001111-0001-0001-0001-000000000003', rental_number: 'R-20241201-0001', client_id: 'cl555555-5555-5555-5555-555555555555', project_name: 'Corporate Video Package', start_date: '2024-12-05', end_date: '2024-12-08', status: 'completed', type: 'rental', notes: 'Interview and B-roll setup', final_currency: 'EUR', final_total: 1950.00, created_by: adminUserId }
    ]

    for (const rental of rentals) {
      const { error } = await supabase.from('rentals').upsert(rental, { onConflict: 'id' })
      if (error) console.log('  ⚠️  Rental error:', error.message)
    }
    console.log('   ✅ Rentals inserted: 3')

    // ============================================================
    // 5. SUBRENTALS (M2)
    // ============================================================
    console.log('\n💼 Inserting subrentals...')

    const subrentals = [
      { id: 's0001111-0001-0001-0001-000000000001', rental_number: 'S-20250108-0001', client_id: 'cl444444-4444-4444-4444-444444444444', project_name: 'High-End Fashion Campaign', start_date: '2025-01-10', end_date: '2025-01-14', status: 'active', type: 'subrental', supplier_name: 'Pro Camera Rental Budapest', supplier_contact: 'rentals@procamera.hu / +36 1 999 8888', supplier_notes: 'Special RED package deal', notes: 'Client requested RED package', final_currency: 'EUR', final_total: 6500.00, created_by: adminUserId },
      { id: 's0001111-0001-0001-0001-000000000002', rental_number: 'S-20241205-0001', client_id: 'cl222222-2222-2222-2222-222222222222', project_name: 'TV Series Episode 3', start_date: '2024-12-08', end_date: '2024-12-15', status: 'completed', type: 'subrental', supplier_name: 'Lighting Solutions Hungary', supplier_contact: 'orders@lightingsolutions.hu', supplier_notes: 'Bulk lighting discount', notes: 'Night scenes lighting setup', final_currency: 'EUR', final_total: 5600.00, created_by: adminUserId },
      { id: 's0001111-0001-0001-0001-000000000003', rental_number: 'S-20241120-0001', client_id: 'cl333333-3333-3333-3333-333333333333', project_name: 'Documentary - Audio Package', start_date: '2024-11-22', end_date: '2024-11-28', status: 'completed', type: 'subrental', supplier_name: 'Audio Masters Budapest', supplier_contact: 'info@audiomasters.hu', supplier_notes: 'Premium wireless system', notes: 'High-end wireless audio', final_currency: 'EUR', final_total: 1600.00, created_by: adminUserId }
    ]

    for (const sub of subrentals) {
      const { error } = await supabase.from('rentals').upsert(sub, { onConflict: 'id' })
      if (error) console.log('  ⚠️  Subrental error:', error.message)
    }
    console.log('   ✅ Subrentals inserted: 3')

    // ============================================================
    // 6. RENTAL ITEMS
    // ============================================================
    console.log('\n📦 Inserting rental items...')

    const rentalItems = [
      // R-20250105-0001 items
      { rental_id: 'r0001111-0001-0001-0001-000000000001', product_id: 'a1111111-1111-1111-1111-111111111111', quantity: 1, daily_rate: 450.00, days: 20, subtotal: 9000.00, condition_on_pickup: 'excellent', is_returned: false },
      { rental_id: 'r0001111-0001-0001-0001-000000000001', product_id: 'b4444444-4444-4444-4444-444444444444', quantity: 1, daily_rate: 120.00, days: 20, subtotal: 2400.00, condition_on_pickup: 'excellent', is_returned: false },
      { rental_id: 'r0001111-0001-0001-0001-000000000001', product_id: 'c1111111-1111-1111-1111-111111111111', quantity: 2, daily_rate: 85.00, days: 20, subtotal: 3400.00, condition_on_pickup: 'good', is_returned: false },
      { rental_id: 'r0001111-0001-0001-0001-000000000001', product_id: 'd1111111-1111-1111-1111-111111111111', quantity: 2, daily_rate: 45.00, days: 20, subtotal: 1800.00, condition_on_pickup: 'good', is_returned: false },

      // R-20250110-0001 items
      { rental_id: 'r0001111-0001-0001-0001-000000000002', product_id: 'a2222222-2222-2222-2222-222222222222', quantity: 1, daily_rate: 280.00, days: 3, subtotal: 840.00, condition_on_pickup: 'excellent', is_returned: false },
      { rental_id: 'r0001111-0001-0001-0001-000000000002', product_id: 'c2222222-2222-2222-2222-222222222222', quantity: 2, daily_rate: 95.00, days: 3, subtotal: 570.00, condition_on_pickup: 'excellent', is_returned: false },

      // R-20241201-0001 items (completed)
      { rental_id: 'r0001111-0001-0001-0001-000000000003', product_id: 'a4444444-4444-4444-4444-444444444444', quantity: 1, daily_rate: 220.00, days: 3, subtotal: 660.00, condition_on_pickup: 'good', is_returned: true, condition_on_return: 'good', returned_at: '2024-12-08T18:30:00Z' },
      { rental_id: 'r0001111-0001-0001-0001-000000000003', product_id: 'd2222222-2222-2222-2222-222222222222', quantity: 1, daily_rate: 85.00, days: 3, subtotal: 255.00, condition_on_pickup: 'excellent', is_returned: true, condition_on_return: 'excellent', returned_at: '2024-12-08T18:30:00Z' },
      { rental_id: 'r0001111-0001-0001-0001-000000000003', product_id: 'd1111111-1111-1111-1111-111111111111', quantity: 2, daily_rate: 45.00, days: 3, subtotal: 270.00, condition_on_pickup: 'excellent', is_returned: true, condition_on_return: 'excellent', returned_at: '2024-12-08T18:30:00Z' },

      // S-20250108-0001 items (subrental with purchase_price)
      { rental_id: 's0001111-0001-0001-0001-000000000001', product_id: 'a3333333-3333-3333-3333-333333333333', quantity: 1, daily_rate: 380.00, days: 4, purchase_price: 250.00, subtotal: 1520.00, condition_on_pickup: 'excellent', is_returned: false },
      { rental_id: 's0001111-0001-0001-0001-000000000001', product_id: 'b2222222-2222-2222-2222-222222222222', quantity: 1, daily_rate: 95.00, days: 4, purchase_price: 60.00, subtotal: 380.00, condition_on_pickup: 'excellent', is_returned: false },

      // S-20241205-0001 items (completed subrental)
      { rental_id: 's0001111-0001-0001-0001-000000000002', product_id: 'c1111111-1111-1111-1111-111111111111', quantity: 3, daily_rate: 85.00, days: 7, purchase_price: 55.00, subtotal: 1785.00, condition_on_pickup: 'excellent', is_returned: true, condition_on_return: 'excellent', returned_at: '2024-12-15T19:00:00Z' },
      { rental_id: 's0001111-0001-0001-0001-000000000002', product_id: 'c4444444-4444-4444-4444-444444444444', quantity: 2, daily_rate: 65.00, days: 7, purchase_price: 40.00, subtotal: 910.00, condition_on_pickup: 'good', is_returned: true, condition_on_return: 'good', returned_at: '2024-12-15T19:00:00Z' },

      // S-20241120-0001 items (completed subrental)
      { rental_id: 's0001111-0001-0001-0001-000000000003', product_id: 'd4444444-4444-4444-4444-444444444444', quantity: 2, daily_rate: 95.00, days: 6, purchase_price: 65.00, subtotal: 1140.00, condition_on_pickup: 'excellent', is_returned: true, condition_on_return: 'excellent', returned_at: '2024-11-28T17:30:00Z' }
    ]

    for (const item of rentalItems) {
      const { error } = await supabase.from('rental_items').insert(item)
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.log('  ⚠️  Rental item error:', error.message)
      }
    }
    console.log('   ✅ Rental items inserted: 15')

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n========================================')
    console.log('✅ DATABASE SEEDING COMPLETED!')
    console.log('========================================')
    console.log('Categories: 5')
    console.log('Products: 14')
    console.log('Clients: 5')
    console.log('Rentals: 3 (2 active, 1 completed)')
    console.log('Subrentals: 3 (1 active, 2 completed)')
    console.log('Rental Items: 15')
    console.log('========================================\n')

  } catch (error) {
    console.error('\n❌ SEEDING ERROR:', error)
    console.error('\n💡 Make sure you are authenticated with Supabase')
    console.error('   Run: supabase login')
    process.exit(1)
  }
}

seedDatabase()
