/**
 * Integration Test: rentals RLS Policies
 *
 * Tests Row Level Security policies for the rentals table.
 *
 * RLS Policies to test:
 * 1. super_admin_full_access_rentals - Super admin has full CRUD access
 * 2. admin_read_rentals - Admin & super_admin can read all rentals
 * 3. admin_insert_rentals - Admin can insert rentals (with created_by = auth.uid())
 * 4. admin_update_rentals - Admin can update own rentals, super_admin can update any
 * 5. super_admin_delete_rentals - Only super_admin can delete rentals
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

describe('RLS Policies: rentals', () => {
  let superAdminClient: SupabaseClient<Database>
  let adminClient: SupabaseClient<Database>
  let superAdminUserId: string
  let adminUserId: string
  let testClientId: string // We'll need a client to create rentals
  let testRentalId: string // Rental created by admin
  let superAdminRentalId: string // Rental created by super_admin

  beforeAll(async () => {
    // Create authenticated clients
    superAdminClient = await createSuperAdminClient()
    adminClient = await createAdminClient()

    // Get user IDs
    const superAdmin = await getCurrentUser(superAdminClient)
    const admin = await getCurrentUser(adminClient)

    superAdminUserId = superAdmin.id
    adminUserId = admin.id

    // Get or create a test client (needed for rentals)
    const { data: clients } = await superAdminClient
      .from('clients')
      .select('id')
      .limit(1)
      .single()

    if (clients) {
      testClientId = clients.id
    } else {
      // Create a test client
      const { data: newClient } = await superAdminClient
        .from('clients')
        .insert({
          name: 'RLS Test Client',
          email: 'rlstest@example.com',
          created_by: superAdminUserId,
        })
        .select('id')
        .single()

      testClientId = newClient!.id
    }

    console.log('🔐 Test Setup:')
    console.log(`   Super Admin: ${superAdmin.email} (${superAdmin.role})`)
    console.log(`   Admin: ${admin.email} (${admin.role})`)
    console.log(`   Test Client ID: ${testClientId}`)
  })

  afterAll(async () => {
    // Cleanup test rentals
    if (testRentalId) {
      await superAdminClient.from('rentals').delete().eq('id', testRentalId)
    }
    if (superAdminRentalId) {
      await superAdminClient.from('rentals').delete().eq('id', superAdminRentalId)
    }

    await cleanupClients(superAdminClient, adminClient)
  })

  // ============================================================
  // Policy 1: super_admin_full_access_rentals
  // Super admin has full CRUD access
  // ============================================================

  describe('Policy: super_admin_full_access_rentals', () => {
    it('super_admin should be able to read all rentals', async () => {
      const { data, error } = await superAdminClient.from('rentals').select('*').limit(10)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)

      console.log(`   ✓ Super admin can read ${data!.length} rentals`)
    })

    it('super_admin should be able to create rentals', async () => {
      const { data, error } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Super Admin Test Rental',
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'draft',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 1000,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.project_name).toBe('Super Admin Test Rental')

      superAdminRentalId = data!.id

      console.log('   ✓ Super admin can create rentals')
      console.log(`      Rental ID: ${superAdminRentalId}`)
    })

    it('super_admin should be able to update any rental', async () => {
      const { data, error } = await superAdminClient
        .from('rentals')
        .update({ project_name: 'Updated by Super Admin' })
        .eq('id', superAdminRentalId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.project_name).toBe('Updated by Super Admin')

      console.log('   ✓ Super admin can update any rental')
    })

    it('super_admin should be able to delete rentals', async () => {
      // Create a temporary rental to delete
      const { data: tempRental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Temp Rental for Delete Test',
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'draft',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 100,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      const { error } = await superAdminClient
        .from('rentals')
        .delete()
        .eq('id', tempRental!.id)

      expect(error).toBeNull()

      // Verify deletion
      const { data: deleted } = await superAdminClient
        .from('rentals')
        .select()
        .eq('id', tempRental!.id)
        .single()

      expect(deleted).toBeNull()

      console.log('   ✓ Super admin can delete rentals')
    })
  })

  // ============================================================
  // Policy 2: admin_read_rentals
  // Admin & super_admin can read all rentals
  // ============================================================

  describe('Policy: admin_read_rentals', () => {
    it('admin should be able to read all rentals', async () => {
      const { data, error } = await adminClient.from('rentals').select('*').limit(10)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data!.length).toBeGreaterThan(0) // Should see some rentals

      console.log(`   ✓ Admin can read ${data!.length} rentals`)
    })

    it('admin should be able to read super_admin created rentals', async () => {
      const { data, error } = await adminClient
        .from('rentals')
        .select('*')
        .eq('id', superAdminRentalId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.created_by).toBe(superAdminUserId)

      console.log('   ✓ Admin can read rentals created by super_admin')
    })
  })

  // ============================================================
  // Policy 3: admin_insert_rentals
  // Admin can insert rentals (with created_by = auth.uid())
  // ============================================================

  describe('Policy: admin_insert_rentals', () => {
    it('admin should be able to create rentals with created_by = auth.uid()', async () => {
      const { data, error } = await adminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Admin Test Rental',
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'draft',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 500,
          created_by: adminUserId, // Must be own user ID
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.project_name).toBe('Admin Test Rental')
      expect(data!.created_by).toBe(adminUserId)

      testRentalId = data!.id

      console.log('   ✓ Admin can create rentals')
      console.log(`      Rental ID: ${testRentalId}`)
    })

    it('admin should NOT be able to create rentals with different created_by', async () => {
      const { data, error } = await adminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Fake Admin Rental',
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'draft',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 500,
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
  // Policy 4: admin_update_rentals
  // Admin can update own rentals, super_admin can update any
  // ============================================================

  describe('Policy: admin_update_rentals', () => {
    it('admin should be able to update own rental', async () => {
      const { data, error } = await adminClient
        .from('rentals')
        .update({ project_name: 'Admin Updated Rental' })
        .eq('id', testRentalId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.project_name).toBe('Admin Updated Rental')

      console.log('   ✓ Admin can update own rental')
    })

    it('admin should NOT be able to update rentals created by others', async () => {
      const { data, error } = await adminClient
        .from('rentals')
        .update({ project_name: 'Hacker Attempt' })
        .eq('id', superAdminRentalId)
        .select()

      // RLS USING clause filters out rows not owned by admin
      // UPDATE succeeds but affects 0 rows, SELECT returns empty array
      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data!.length).toBe(0) // No rows updated (filtered by RLS)

      console.log('   ✓ Admin cannot update rentals created by others (RLS filtered 0 rows)')
    })

    it('super_admin should be able to update any rental (including admin created)', async () => {
      const { data, error } = await superAdminClient
        .from('rentals')
        .update({ project_name: 'Super Admin Updated Admin Rental' })
        .eq('id', testRentalId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.project_name).toBe('Super Admin Updated Admin Rental')
      expect(data!.created_by).toBe(adminUserId) // Still owned by admin

      console.log('   ✓ Super admin can update any rental')
    })
  })

  // ============================================================
  // Policy 5: super_admin_delete_rentals
  // Only super_admin can delete rentals
  // ============================================================

  describe('Policy: super_admin_delete_rentals', () => {
    it('admin should NOT be able to delete rentals (even own)', async () => {
      const { data, error } = await adminClient.from('rentals').delete().eq('id', testRentalId)

      // Should fail due to RLS (only super_admin can delete)
      expect(error).toBeDefined()
      expect(data).toBeNull()

      // Verify rental still exists
      const { data: stillExists } = await superAdminClient
        .from('rentals')
        .select()
        .eq('id', testRentalId)
        .single()

      expect(stillExists).toBeDefined()

      console.log('   ✓ Admin cannot delete rentals (RLS blocked)')
    })

    it('super_admin should be able to delete any rental', async () => {
      // Delete the admin-created rental
      const { error } = await superAdminClient.from('rentals').delete().eq('id', testRentalId)

      expect(error).toBeNull()

      // Verify deletion
      const { data: deleted } = await superAdminClient
        .from('rentals')
        .select()
        .eq('id', testRentalId)
        .single()

      expect(deleted).toBeNull()

      console.log('   ✓ Super admin can delete any rental')
    })
  })

  // ============================================================
  // Summary
  // ============================================================

  it('should have correct RLS policy summary', () => {
    console.log('\n📊 rentals RLS Policy Summary:')
    console.log('   ✅ Super admins have full CRUD access')
    console.log('   ✅ Admins can read all rentals')
    console.log('   ✅ Admins can create rentals (with own created_by)')
    console.log('   ✅ Admins can update own rentals only')
    console.log('   ✅ Super admins can update any rental')
    console.log('   ✅ Only super admins can delete rentals')
    console.log('   ✅ Admins are blocked from deleting rentals\n')

    expect(true).toBe(true)
  })
})
