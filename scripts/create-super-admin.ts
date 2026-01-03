import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface CreateSuperAdminParams {
  email: string
  password: string
  fullName: string
}

async function createSuperAdmin({ email, password, fullName }: CreateSuperAdminParams) {
  console.log('\n🚀 Creating super admin user...\n')

  try {
    // Step 1: Create auth user
    console.log('📧 Creating auth user:', email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError) {
      console.error('❌ Auth creation error:', authError.message)
      throw authError
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Step 2: Create user_profiles entry
    console.log('👤 Creating user profile...')
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: 'super_admin',
        is_active: true
      })

    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message)

      // Rollback: Delete auth user if profile creation fails
      console.log('🔄 Rolling back auth user creation...')
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      throw profileError
    }

    console.log('✅ User profile created')

    // Step 3: Verify creation
    const { data: profile, error: verifyError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (verifyError) {
      console.error('⚠️  Verification warning:', verifyError.message)
    } else {
      console.log('\n✨ Super admin created successfully!\n')
      console.log('📋 User Details:')
      console.log('   ID:', profile.id)
      console.log('   Email:', profile.email)
      console.log('   Name:', profile.full_name)
      console.log('   Role:', profile.role)
      console.log('   Active:', profile.is_active)
      console.log('\n🔐 Credentials:')
      console.log('   Email:', email)
      console.log('   Password:', password)
      console.log('\n⚠️  Please save these credentials and change the password after first login!\n')
    }

    return authData.user

  } catch (error) {
    console.error('\n❌ Failed to create super admin:', error)
    process.exit(1)
  }
}

// Main execution
const newSuperAdmin = {
  email: 'admin@inlight.hu',
  password: 'geri_2026',
  fullName: 'Sztellik Gergely'
}

createSuperAdmin(newSuperAdmin)
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
