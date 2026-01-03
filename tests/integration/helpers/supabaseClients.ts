/**
 * Supabase Client Helpers for RLS Testing
 *
 * Creates separate Supabase clients for different user roles to test
 * Row Level Security (RLS) policies.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/types/database.types'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load .env.test
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!

// Test credentials from .env.test
const SUPER_ADMIN_EMAIL = process.env.TEST_SUPER_ADMIN_EMAIL!
const SUPER_ADMIN_PASSWORD = process.env.TEST_SUPER_ADMIN_PASSWORD!

// We'll need a second test user (admin role) for full RLS testing
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'testadmin@inlight.hu'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Test1234!'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
  throw new Error('Missing super admin test credentials in .env.test')
}

/**
 * Create authenticated Supabase client for super_admin user
 */
export async function createSuperAdminClient(): Promise<SupabaseClient<Database>> {
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
  })

  if (error || !data.session) {
    throw new Error(`Failed to authenticate super_admin: ${error?.message}`)
  }

  // Create new client with super_admin session
  const authenticatedClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    },
  })

  return authenticatedClient
}

/**
 * Create authenticated Supabase client for admin user
 */
export async function createAdminClient(): Promise<SupabaseClient<Database>> {
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })

  if (error || !data.session) {
    throw new Error(
      `Failed to authenticate admin: ${error?.message}\n` +
        `Make sure TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD are set in .env.test`
    )
  }

  // Create new client with admin session
  const authenticatedClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    },
  })

  return authenticatedClient
}

/**
 * Create unauthenticated (anon) Supabase client
 */
export function createAnonClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/**
 * Get current user info from authenticated client
 */
export async function getCurrentUser(client: SupabaseClient<Database>) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error || !user) {
    throw new Error(`Failed to get current user: ${error?.message}`)
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error(`Failed to get user profile: ${profileError?.message}`)
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    full_name: profile.full_name,
  }
}

/**
 * Cleanup function to sign out all clients
 */
export async function cleanupClients(
  ...clients: Array<SupabaseClient<Database> | undefined>
) {
  for (const client of clients) {
    if (client) {
      try {
        await client.auth.signOut()
      } catch (err) {
        // Ignore signout errors during cleanup
        console.warn('Cleanup error:', err)
      }
    }
  }
}
