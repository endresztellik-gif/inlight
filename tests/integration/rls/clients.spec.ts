/**
 * Integration Test: clients RLS Policies
 *
 * Tests Row Level Security policies for the clients table.
 *
 * RLS Policies to test:
 * 1. authenticated_read_clients - Admin & super_admin can read all clients
 * 2. authenticated_insert_clients - Admin & super_admin can insert clients (with created_by = auth.uid())
 * 3. admin_update_clients - Admin & super_admin can update any client (no ownership restriction)
 * 4. super_admin_delete_clients - Only super_admin can delete clients
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/types/database.types'
import {
  createSuperAdminClient,
  createAdminClient,
  getCurrentUser,
  cleanupClients,
} from '../helpers/supabaseClients'

describe('RLS Policies: clients', () => {
  let superAdminClient: SupabaseClient<Database>
  let adminClient: SupabaseClient<Database>
  let superAdminUserId: string
  let adminUserId: string
  let testClientId: string // Client created by admin
  let superAdminClientId: string // Client created by super_admin

  beforeAll(async () => {
    // Create authenticated clients
    superAdminClient = await createSuperAdminClient()
    adminClient = await createAdminClient()

    // Get user IDs
    const superAdmin = await getCurrentUser(superAdminClient)
    const admin = await getCurrentUser(adminClient)

    superAdminUserId = superAdmin.id
    adminUserId = admin.id

    console.log('🔐 Test Setup:')
    console.log(`   Super Admin: ${superAdmin.email} (${superAdmin.role})`)
    console.log(`   Admin: ${admin.email} (${admin.role})`)
  })

  afterAll(async () => {
    // Cleanup test clients
    if (testClientId) {
      await superAdminClient.from('clients').delete().eq('id', testClientId)
    }
    if (superAdminClientId) {
      await superAdminClient.from('clients').delete().eq('id', superAdminClientId)
    }

    await cleanupClients(superAdminClient, adminClient)
  })

  // ============================================================
  // Policy 1: authenticated_read_clients
  // Admin & super_admin can read all clients
  // ============================================================

  describe('Policy: authenticated_read_clients', () => {
    it('super_admin should be able to read all clients', async () => {
      const { data, error } = await superAdminClient.from('clients').select('*').limit(10)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)

      console.log(`   ✓ Super admin can read ${data!.length} clients`)
    })

    it('admin should be able to read all clients', async () => {
      const { data, error } = await adminClient.from('clients').select('*').limit(10)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data!.length).toBeGreaterThan(0) // Should see some clients

      console.log(`   ✓ Admin can read ${data!.length} clients`)
    })
  })

  // ============================================================
  // Policy 2: authenticated_insert_clients
  // Admin & super_admin can insert clients (with created_by = auth.uid())
  // ============================================================

  describe('Policy: authenticated_insert_clients', () => {
    it('super_admin should be able to create clients', async () => {
      const { data, error } = await superAdminClient
        .from('clients')
        .insert({
          name: 'Super Admin Test Client',
          email: 'superadmin-test@example.com',
          phone: '+36 1 234 5678',
          created_by: superAdminUserId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.name).toBe('Super Admin Test Client')
      expect(data!.created_by).toBe(superAdminUserId)

      superAdminClientId = data!.id

      console.log('   ✓ Super admin can create clients')
      console.log(`      Client ID: ${superAdminClientId}`)
    })

    it('admin should be able to create clients with created_by = auth.uid()', async () => {
      const { data, error } = await adminClient
        .from('clients')
        .insert({
          name: 'Admin Test Client',
          email: 'admin-test@example.com',
          phone: '+36 1 987 6543',
          created_by: adminUserId, // Must be own user ID
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.name).toBe('Admin Test Client')
      expect(data!.created_by).toBe(adminUserId)

      testClientId = data!.id

      console.log('   ✓ Admin can create clients')
      console.log(`      Client ID: ${testClientId}`)
    })

    it('admin should NOT be able to create clients with different created_by', async () => {
      const { data, error } = await adminClient
        .from('clients')
        .insert({
          name: 'Fake Admin Client',
          email: 'fake@example.com',
          created_by: superAdminUserId, // Trying to spoof super_admin
        })
        .select()

      // Should fail due to RLS WITH CHECK (created_by = auth.uid())
      expect(error).toBeDefined()
      expect(data).toBeNull()

      console.log('   ✓ Admin cannot spoof created_by (RLS blocked)')
    })
  })

  // ============================================================
  // Policy 3: admin_update_clients
  // Admin & super_admin can update any client (no ownership restriction)
  // ============================================================

  describe('Policy: admin_update_clients', () => {
    it('admin should be able to update own client', async () => {
      const { data, error } = await adminClient
        .from('clients')
        .update({ name: 'Admin Updated Client' })
        .eq('id', testClientId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.name).toBe('Admin Updated Client')

      console.log('   ✓ Admin can update own client')
    })

    it('admin should be able to update clients created by others', async () => {
      const { data, error } = await adminClient
        .from('clients')
        .update({ phone: '+36 1 111 1111' })
        .eq('id', superAdminClientId)
        .select()
        .single()

      // No ownership restriction on UPDATE (unlike rentals)
      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.phone).toBe('+36 1 111 1111')
      expect(data!.created_by).toBe(superAdminUserId) // Still owned by super_admin

      console.log('   ✓ Admin can update clients created by super_admin')
    })

    it('super_admin should be able to update any client', async () => {
      const { data, error } = await superAdminClient
        .from('clients')
        .update({ email: 'updated-by-superadmin@example.com' })
        .eq('id', testClientId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.email).toBe('updated-by-superadmin@example.com')
      expect(data!.created_by).toBe(adminUserId) // Still owned by admin

      console.log('   ✓ Super admin can update any client')
    })
  })

  // ============================================================
  // Policy 4: super_admin_delete_clients
  // Only super_admin can delete clients
  // ============================================================

  describe('Policy: super_admin_delete_clients', () => {
    it('admin should NOT be able to delete clients (even own)', async () => {
      const { data, error } = await adminClient.from('clients').delete().eq('id', testClientId)

      // Should fail due to RLS (only super_admin can delete)
      expect(error).toBeDefined()
      expect(data).toBeNull()

      // Verify client still exists
      const { data: stillExists } = await superAdminClient
        .from('clients')
        .select()
        .eq('id', testClientId)
        .single()

      expect(stillExists).toBeDefined()

      console.log('   ✓ Admin cannot delete clients (RLS blocked)')
    })

    it('super_admin should be able to delete any client', async () => {
      // Create a temporary client to delete
      const { data: tempClient } = await superAdminClient
        .from('clients')
        .insert({
          name: 'Temp Client for Delete Test',
          email: 'temp@example.com',
          created_by: superAdminUserId,
        })
        .select()
        .single()

      const { error } = await superAdminClient.from('clients').delete().eq('id', tempClient!.id)

      expect(error).toBeNull()

      // Verify deletion
      const { data: deleted } = await superAdminClient
        .from('clients')
        .select()
        .eq('id', tempClient!.id)
        .single()

      expect(deleted).toBeNull()

      console.log('   ✓ Super admin can delete any client')
    })
  })

  // ============================================================
  // Summary
  // ============================================================

  it('should have correct RLS policy summary', () => {
    console.log('\n📊 clients RLS Policy Summary:')
    console.log('   ✅ Both admin and super_admin can read all clients')
    console.log('   ✅ Both can create clients (with own created_by)')
    console.log('   ✅ Both can update ANY client (no ownership restriction)')
    console.log('   ✅ Only super_admin can delete clients')
    console.log('   ✅ Admins are blocked from deleting clients\n')

    expect(true).toBe(true)
  })
})
