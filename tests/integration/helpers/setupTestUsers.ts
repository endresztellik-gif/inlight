/**
 * Setup Test Users for RLS Integration Tests
 *
 * This script creates the required test users if they don't exist.
 * Run this before running RLS integration tests.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/types/database.types'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load .env.test
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const SUPER_ADMIN_EMAIL = process.env.TEST_SUPER_ADMIN_EMAIL!
const SUPER_ADMIN_PASSWORD = process.env.TEST_SUPER_ADMIN_PASSWORD!
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin2@inlight.hu'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Test1234!'

async function setupTestUsers() {
  console.log('🔧 Setting up test users for RLS integration tests...\n')

  // Create Supabase admin client
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Authenticate as super_admin
  console.log(`🔐 Authenticating as super admin: ${SUPER_ADMIN_EMAIL}`)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
  })

  if (authError || !authData.session) {
    console.error('❌ Failed to authenticate super admin:', authError?.message)
    process.exit(1)
  }

  console.log('✅ Super admin authenticated\n')

  // Create authenticated client
  const authenticatedClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    },
  })

  // Check if admin2 user already exists in user_profiles
  console.log(`🔍 Checking if admin user exists: ${ADMIN_EMAIL}`)
  const { data: existingProfile } = await authenticatedClient
    .from('user_profiles')
    .select('*')
    .eq('email', ADMIN_EMAIL)
    .single()

  if (existingProfile) {
    console.log('✅ Admin user already exists:')
    console.log(`   Email: ${existingProfile.email}`)
    console.log(`   Role: ${existingProfile.role}`)
    console.log(`   ID: ${existingProfile.id}\n`)

    // Verify role is correct
    if (existingProfile.role !== 'admin') {
      console.log('⚠️  Role is not "admin", updating...')
      const { error: updateError } = await authenticatedClient
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', existingProfile.id)

      if (updateError) {
        console.error('❌ Failed to update role:', updateError.message)
      } else {
        console.log('✅ Role updated to "admin"\n')
      }
    }
  } else {
    console.log('⚠️  Admin user does not exist in user_profiles')
    console.log('❌ Cannot create admin user - auth.users management requires Supabase Service Role key\n')
    console.log('📝 Manual Setup Required:')
    console.log('   1. Go to Supabase Dashboard → Authentication → Users')
    console.log(`   2. Create user with email: ${ADMIN_EMAIL}`)
    console.log(`   3. Set password: ${ADMIN_PASSWORD}`)
    console.log('   4. Check "Auto Confirm Email"')
    console.log('   5. After creation, run this SQL in SQL Editor:\n')
    console.log(`   INSERT INTO user_profiles (id, email, full_name, role, is_active)`)
    console.log(`   SELECT id, email, 'Test Admin User', 'admin', true`)
    console.log(`   FROM auth.users WHERE email = '${ADMIN_EMAIL}';\n`)
    console.log('📖 See tests/integration/RLS_TEST_SETUP.md for detailed instructions\n')
  }

  // Summary
  console.log('📊 Test Users Summary:')
  const { data: allProfiles } = await authenticatedClient
    .from('user_profiles')
    .select('email, role, full_name')
    .in('email', [SUPER_ADMIN_EMAIL, ADMIN_EMAIL])

  if (allProfiles) {
    allProfiles.forEach((profile) => {
      console.log(`   ${profile.role === 'super_admin' ? '👑' : '👤'} ${profile.email} (${profile.role})`)
    })
  }

  console.log('\n✅ Setup complete!')

  await supabase.auth.signOut()
}

// Run setup
setupTestUsers().catch((error) => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})
