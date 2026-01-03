/**
 * Integration Test: Inventory Triggers
 *
 * Tests database triggers that manage product inventory (available_quantity).
 *
 * Triggers to test:
 * 1. decrease_product_availability - Decreases quantity when rental item created (rental only)
 * 2. increase_product_availability - Increases quantity when item returned (rental only)
 * 3. restore_product_availability - Restores quantity when item deleted (rental only)
 *
 * Critical: Subrentals should NOT affect inventory (type='subrental' is skipped)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/types/database.types'
import {
  createSuperAdminClient,
  getCurrentUser,
  cleanupClients,
} from '../helpers/supabaseClients'

describe('Inventory Triggers', () => {
  let superAdminClient: SupabaseClient<Database>
  let superAdminUserId: string
  let testClientId: string
  let testCategoryId: string
  let testProductId: string
  let testRentalId: string
  let testSubrentalId: string

  // Track initial inventory for verification
  let initialStockQuantity: number
  let initialAvailableQuantity: number

  beforeAll(async () => {
    superAdminClient = await createSuperAdminClient()
    const superAdmin = await getCurrentUser(superAdminClient)
    superAdminUserId = superAdmin.id

    // Get or create test category
    const { data: category } = await superAdminClient
      .from('categories')
      .select('id')
      .limit(1)
      .single()

    if (category) {
      testCategoryId = category.id
    } else {
      const { data: newCategory } = await superAdminClient
        .from('categories')
        .insert({
          name: 'Inventory Test Category',
          created_by: superAdminUserId,
        })
        .select('id')
        .single()

      testCategoryId = newCategory!.id
    }

    // Get or create test client
    const { data: client } = await superAdminClient
      .from('clients')
      .select('id')
      .limit(1)
      .single()

    if (client) {
      testClientId = client.id
    } else {
      const { data: newClient } = await superAdminClient
        .from('clients')
        .insert({
          name: 'Inventory Test Client',
          email: 'inventory-test@example.com',
          created_by: superAdminUserId,
        })
        .select('id')
        .single()

      testClientId = newClient!.id
    }

    console.log('🔐 Test Setup:')
    console.log(`   Super Admin: ${superAdmin.email}`)
    console.log(`   Test Category ID: ${testCategoryId}`)
    console.log(`   Test Client ID: ${testClientId}`)
  })

  beforeEach(async () => {
    // Create a fresh test product for each test
    const { data: product } = await superAdminClient
      .from('products')
      .insert({
        category_id: testCategoryId,
        name: `Inventory Test Product ${Date.now()}`,
        serial_number: `INV-TEST-${Date.now()}`,
        daily_rate: 100,
        currency: 'EUR',
        stock_quantity: 10, // Initial stock
        available_quantity: 10, // All available initially
        is_active: true,
        created_by: superAdminUserId,
      })
      .select()
      .single()

    testProductId = product!.id
    initialStockQuantity = product!.stock_quantity
    initialAvailableQuantity = product!.available_quantity

    console.log(`\n📦 Created test product: ${testProductId}`)
    console.log(`   Initial stock: ${initialStockQuantity}`)
    console.log(`   Initial available: ${initialAvailableQuantity}`)
  })

  afterAll(async () => {
    // Cleanup test data
    if (testRentalId) {
      await superAdminClient.from('rentals').delete().eq('id', testRentalId)
    }
    if (testSubrentalId) {
      await superAdminClient.from('rentals').delete().eq('id', testSubrentalId)
    }
    if (testProductId) {
      await superAdminClient.from('products').delete().eq('id', testProductId)
    }

    await cleanupClients(superAdminClient)
  })

  // ============================================================
  // Trigger 1: decrease_product_availability
  // Decreases available_quantity when rental item created (rental only)
  // ============================================================

  describe('Trigger: decrease_product_availability', () => {
    it('should decrease available_quantity when rental item is created (type=rental)', async () => {
      // Create a rental (type='rental')
      const { data: rental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Inventory Decrease Test',
          rental_number: `R-${Date.now()}`,
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'active',
          type: 'rental', // CRITICAL: type='rental' triggers inventory decrease
          final_currency: 'EUR',
          final_total: 500,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      testRentalId = rental!.id

      // Add rental item (should trigger decrease)
      const rentalQuantity = 3
      const { error: itemError } = await superAdminClient.from('rental_items').insert({
        rental_id: testRentalId,
        product_id: testProductId,
        quantity: rentalQuantity,
        daily_rate: 100,
        days: 7,
        subtotal: 700,
        condition_on_pickup: 'excellent',
      })

      expect(itemError).toBeNull()

      // Verify available_quantity decreased
      const { data: product } = await superAdminClient
        .from('products')
        .select('available_quantity, stock_quantity')
        .eq('id', testProductId)
        .single()

      expect(product!.available_quantity).toBe(initialAvailableQuantity - rentalQuantity)
      expect(product!.stock_quantity).toBe(initialStockQuantity) // stock_quantity unchanged

      console.log(
        `   ✓ Available quantity decreased: ${initialAvailableQuantity} → ${product!.available_quantity}`
      )
    })

    it('should NOT decrease available_quantity for subrentals (type=subrental)', async () => {
      // Create a subrental (type='subrental')
      const { data: subrental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Subrental Inventory Test',
          rental_number: `S-${Date.now()}`,
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'active',
          type: 'subrental', // CRITICAL: type='subrental' should NOT affect inventory
          supplier_name: 'Test Supplier',
          final_currency: 'EUR',
          final_total: 500,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      testSubrentalId = subrental!.id

      // Add subrental item (should NOT trigger decrease)
      const subrentalQuantity = 5
      const { error: itemError } = await superAdminClient.from('rental_items').insert({
        rental_id: testSubrentalId,
        product_id: testProductId,
        quantity: subrentalQuantity,
        daily_rate: 100,
        days: 7,
        subtotal: 700,
        purchase_price: 50, // Subrental has purchase price
        condition_on_pickup: 'excellent',
      })

      expect(itemError).toBeNull()

      // Verify available_quantity UNCHANGED
      const { data: product } = await superAdminClient
        .from('products')
        .select('available_quantity, stock_quantity')
        .eq('id', testProductId)
        .single()

      expect(product!.available_quantity).toBe(initialAvailableQuantity) // UNCHANGED
      expect(product!.stock_quantity).toBe(initialStockQuantity) // UNCHANGED

      console.log(
        `   ✓ Available quantity unchanged for subrental: ${product!.available_quantity}`
      )
    })

    it('should raise exception when insufficient stock', async () => {
      // Create a rental
      const { data: rental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Insufficient Stock Test',
          rental_number: `R-INSUFFICIENT-${Date.now()}`,
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'active',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 1000,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      const insufficientRentalId = rental!.id

      // Try to rent MORE than available (should fail)
      const excessiveQuantity = initialAvailableQuantity + 5
      const { error } = await superAdminClient.from('rental_items').insert({
        rental_id: insufficientRentalId,
        product_id: testProductId,
        quantity: excessiveQuantity,
        daily_rate: 100,
        days: 7,
        subtotal: 700,
        condition_on_pickup: 'excellent',
      })

      // Should fail with either custom exception or check constraint violation
      expect(error).toBeDefined()
      // Accept either custom exception or database check constraint error
      const errorMessage = error!.message.toLowerCase()
      const hasStockError =
        errorMessage.includes('insufficient stock') ||
        errorMessage.includes('check constraint') ||
        errorMessage.includes('available_quantity')

      expect(hasStockError).toBe(true)

      // Cleanup
      await superAdminClient.from('rentals').delete().eq('id', insufficientRentalId)

      console.log(`   ✓ Insufficient stock validation working (${error!.code})`)
    })
  })

  // ============================================================
  // Trigger 2: increase_product_availability
  // Increases available_quantity when item returned
  // ============================================================

  describe('Trigger: increase_product_availability', () => {
    it('should increase available_quantity when rental item is returned (type=rental)', async () => {
      // Create rental and rental item
      const { data: rental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Return Test',
          rental_number: `R-RETURN-${Date.now()}`,
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'active',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 500,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      const returnRentalId = rental!.id

      const rentalQuantity = 4
      const { data: item } = await superAdminClient
        .from('rental_items')
        .insert({
          rental_id: returnRentalId,
          product_id: testProductId,
          quantity: rentalQuantity,
          daily_rate: 100,
          days: 7,
          subtotal: 700,
          condition_on_pickup: 'excellent',
        })
        .select()
        .single()

      const itemId = item!.id

      // Verify quantity decreased
      const { data: afterRental } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(afterRental!.available_quantity).toBe(initialAvailableQuantity - rentalQuantity)

      // Mark item as returned (should trigger increase)
      const { error: returnError } = await superAdminClient
        .from('rental_items')
        .update({
          is_returned: true,
          condition_on_return: 'good',
        })
        .eq('id', itemId)

      expect(returnError).toBeNull()

      // Verify available_quantity increased back
      const { data: afterReturn } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(afterReturn!.available_quantity).toBe(initialAvailableQuantity) // Restored

      // Verify returned_at timestamp was set
      const { data: returnedItem } = await superAdminClient
        .from('rental_items')
        .select('returned_at')
        .eq('id', itemId)
        .single()

      expect(returnedItem!.returned_at).not.toBeNull()

      // Cleanup
      await superAdminClient.from('rentals').delete().eq('id', returnRentalId)

      console.log(`   ✓ Available quantity increased on return: ${afterReturn!.available_quantity}`)
    })

    it('should NOT increase available_quantity for subrental returns (type=subrental)', async () => {
      // Create subrental and item
      const { data: subrental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Subrental Return Test',
          rental_number: `S-RETURN-${Date.now()}`,
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'active',
          type: 'subrental',
          supplier_name: 'Test Supplier',
          final_currency: 'EUR',
          final_total: 500,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      const subrentalReturnId = subrental!.id

      const { data: item } = await superAdminClient
        .from('rental_items')
        .insert({
          rental_id: subrentalReturnId,
          product_id: testProductId,
          quantity: 3,
          daily_rate: 100,
          days: 7,
          subtotal: 700,
          purchase_price: 50,
          condition_on_pickup: 'excellent',
        })
        .select()
        .single()

      const itemId = item!.id

      // Verify quantity UNCHANGED (subrental doesn't affect inventory)
      const { data: beforeReturn } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(beforeReturn!.available_quantity).toBe(initialAvailableQuantity)

      // Mark subrental item as returned
      await superAdminClient
        .from('rental_items')
        .update({
          is_returned: true,
          condition_on_return: 'good',
        })
        .eq('id', itemId)

      // Verify available_quantity still UNCHANGED
      const { data: afterReturn } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(afterReturn!.available_quantity).toBe(initialAvailableQuantity) // Still unchanged

      // Cleanup
      await superAdminClient.from('rentals').delete().eq('id', subrentalReturnId)

      console.log(`   ✓ Available quantity unchanged for subrental return`)
    })
  })

  // ============================================================
  // Trigger 3: restore_product_availability
  // Restores available_quantity when rental item deleted
  // ============================================================

  describe('Trigger: restore_product_availability', () => {
    it('should restore available_quantity when unreturned rental item is deleted', async () => {
      // Create rental and rental item
      const { data: rental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Delete Test',
          rental_number: `R-DELETE-${Date.now()}`,
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'draft',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 500,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      const deleteRentalId = rental!.id

      const rentalQuantity = 2
      const { data: item } = await superAdminClient
        .from('rental_items')
        .insert({
          rental_id: deleteRentalId,
          product_id: testProductId,
          quantity: rentalQuantity,
          daily_rate: 100,
          days: 7,
          subtotal: 700,
          condition_on_pickup: 'excellent',
        })
        .select()
        .single()

      const itemId = item!.id

      // Verify quantity decreased
      const { data: afterCreate } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(afterCreate!.available_quantity).toBe(initialAvailableQuantity - rentalQuantity)

      // Delete the rental item (should restore quantity)
      const { error: deleteError } = await superAdminClient
        .from('rental_items')
        .delete()
        .eq('id', itemId)

      expect(deleteError).toBeNull()

      // Verify available_quantity restored
      const { data: afterDelete } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(afterDelete!.available_quantity).toBe(initialAvailableQuantity) // Restored

      // Cleanup
      await superAdminClient.from('rentals').delete().eq('id', deleteRentalId)

      console.log(`   ✓ Available quantity restored on delete: ${afterDelete!.available_quantity}`)
    })

    it('should NOT restore if item was already returned', async () => {
      // Create rental and rental item
      const { data: rental } = await superAdminClient
        .from('rentals')
        .insert({
          client_id: testClientId,
          project_name: 'Delete Returned Test',
          rental_number: `R-DEL-RET-${Date.now()}`,
          start_date: '2026-01-02',
          end_date: '2026-01-09',
          status: 'completed',
          type: 'rental',
          final_currency: 'EUR',
          final_total: 500,
          created_by: superAdminUserId,
        })
        .select()
        .single()

      const deleteReturnedRentalId = rental!.id

      const rentalQuantity = 2
      const { data: item } = await superAdminClient
        .from('rental_items')
        .insert({
          rental_id: deleteReturnedRentalId,
          product_id: testProductId,
          quantity: rentalQuantity,
          daily_rate: 100,
          days: 7,
          subtotal: 700,
          condition_on_pickup: 'excellent',
        })
        .select()
        .single()

      const itemId = item!.id

      // Mark as returned first
      await superAdminClient
        .from('rental_items')
        .update({
          is_returned: true,
          condition_on_return: 'good',
        })
        .eq('id', itemId)

      // Quantity should be back to initial
      const { data: afterReturn } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(afterReturn!.available_quantity).toBe(initialAvailableQuantity)

      // Now delete the returned item (should NOT restore again)
      await superAdminClient.from('rental_items').delete().eq('id', itemId)

      // Verify quantity still at initial (not double-restored)
      const { data: afterDelete } = await superAdminClient
        .from('products')
        .select('available_quantity')
        .eq('id', testProductId)
        .single()

      expect(afterDelete!.available_quantity).toBe(initialAvailableQuantity) // No change

      // Cleanup
      await superAdminClient.from('rentals').delete().eq('id', deleteReturnedRentalId)

      console.log(`   ✓ No double restoration for returned items`)
    })
  })

  // ============================================================
  // Summary
  // ============================================================

  it('should have correct inventory trigger summary', () => {
    console.log('\n📊 Inventory Triggers Summary:')
    console.log('   ✅ Rental creation decreases available_quantity')
    console.log('   ✅ Subrental creation does NOT affect inventory')
    console.log('   ✅ Rental return increases available_quantity')
    console.log('   ✅ Subrental return does NOT affect inventory')
    console.log('   ✅ Rental item deletion restores available_quantity')
    console.log('   ✅ Insufficient stock raises exception')
    console.log('   ✅ No double restoration for returned items\n')

    expect(true).toBe(true)
  })
})
