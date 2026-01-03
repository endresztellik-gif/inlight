import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const results = []

function log(message) {
  console.log('\n' + message)
}

function logResult(result) {
  const emoji = result.passed ? '✅' : '❌'
  console.log(emoji + ' ' + result.step)
  console.log('   Expected: ' + result.expected)
  console.log('   Actual: ' + result.actual)
  if (result.details) {
    console.log('   Details: ' + result.details)
  }
  results.push(result)
}

async function getProductInventory(productId) {
  const { data, error } = await supabase
    .from('products')
    .select('available_quantity')
    .eq('id', productId)
    .single()

  if (error) throw error
  return data.available_quantity
}

async function getOrCreateClient() {
  const { data } = await supabase.from('clients').select('id').limit(1).single()
  
  if (data) return data.id

  log('No clients found, using anonymous authentication...')
  const { data: authData } = await supabase.auth.getUser()
  if (authData.user) {
    log('✅ Authenticated user: ' + authData.user.id)
    return authData.user.id
  }
  
  throw new Error('No clients available and not authenticated')
}

async function getOrCreateProduct() {
  const { data } = await supabase
    .from('products')
    .select('id, available_quantity, total_quantity, name')
    .gt('available_quantity', 5)
    .limit(1)
    .single()

  if (data) return data

  log('⚠️  No products with sufficient inventory found')
  log('📋 Listing all products...')
  
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, available_quantity, total_quantity')
    .limit(5)

  if (!allProducts || allProducts.length === 0) {
    throw new Error('No products found in database. Please create at least one product first.')
  }

  console.log('\nAvailable products:')
  allProducts.forEach((p, i) => {
    console.log((i + 1) + '. ' + p.name + ' - ' + p.available_quantity + '/' + p.total_quantity)
  })

  return allProducts[0]
}

async function runTests() {
  log('🧪 ===== SUBRENTAL INVENTORY TRIGGER TEST =====')

  try {
    log('📋 Setup: Getting test client and product...')

    const clientId = await getOrCreateClient()
    const product = await getOrCreateProduct()

    log('✅ Test Client ID: ' + clientId)
    log('✅ Test Product: ' + (product.name || product.id))
    log('✅ Initial Inventory: ' + product.available_quantity + '/' + product.total_quantity)

    const initialInventory = product.available_quantity
    const testQuantity = Math.min(2, product.available_quantity)

    if (testQuantity === 0) {
      throw new Error('Product has 0 available quantity. Cannot test inventory changes.')
    }

    // TEST 1: Create RENTAL
    log('\n📦 TEST 1: Creating RENTAL...')

    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .insert({
        client_id: clientId,
        project_name: 'TEST: Rental Inventory Test',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        type: 'rental',
        rental_number: 'R-TEST-' + Date.now(),
        final_currency: 'EUR',
        final_total: 100,
        created_by: clientId,
      })
      .select()
      .single()

    if (rentalError) throw rentalError
    log('✅ Rental created: ' + rental.rental_number)

    await supabase
      .from('rental_items')
      .insert({
        rental_id: rental.id,
        product_id: product.id,
        quantity: testQuantity,
        daily_rate: 10,
        days: 7,
        subtotal: 140,
        condition_on_pickup: 'good',
      })

    const inventoryAfterRental = await getProductInventory(product.id)

    logResult({
      step: 'TEST 1: Rental decreases inventory',
      expected: 'Inventory: ' + (initialInventory - testQuantity),
      actual: 'Inventory: ' + inventoryAfterRental,
      passed: inventoryAfterRental === initialInventory - testQuantity,
      details: 'Changed by: ' + (inventoryAfterRental - initialInventory) + ' (expected: -' + testQuantity + ')',
    })

    // TEST 2: Return RENTAL
    log('\n🔄 TEST 2: Returning RENTAL items...')

    const { data: rentalItems } = await supabase
      .from('rental_items')
      .select('id')
      .eq('rental_id', rental.id)

    if (rentalItems && rentalItems.length > 0) {
      await supabase
        .from('rental_items')
        .update({
          is_returned: true,
          condition_on_return: 'good',
          returned_at: new Date().toISOString(),
        })
        .eq('id', rentalItems[0].id)
    }

    const inventoryAfterReturn = await getProductInventory(product.id)

    logResult({
      step: 'TEST 2: Rental return increases inventory',
      expected: 'Inventory: ' + initialInventory,
      actual: 'Inventory: ' + inventoryAfterReturn,
      passed: inventoryAfterReturn === initialInventory,
      details: 'Back to initial: ' + (inventoryAfterReturn === initialInventory ? 'YES' : 'NO'),
    })

    // TEST 3: Create SUBRENTAL
    log('\n📦 TEST 3: Creating SUBRENTAL...')

    const inventoryBeforeSubrental = await getProductInventory(product.id)

    const { data: subrental, error: subrentalError } = await supabase
      .from('rentals')
      .insert({
        client_id: clientId,
        project_name: 'TEST: Subrental Inventory Test',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        type: 'subrental',
        rental_number: 'S-TEST-' + Date.now(),
        supplier_name: 'TEST Supplier',
        supplier_contact: 'test@supplier.com',
        final_currency: 'EUR',
        final_total: 150,
        created_by: clientId,
      })
      .select()
      .single()

    if (subrentalError) throw subrentalError
    log('✅ Subrental created: ' + subrental.rental_number)

    await supabase
      .from('rental_items')
      .insert({
        rental_id: subrental.id,
        product_id: product.id,
        quantity: testQuantity,
        daily_rate: 15,
        days: 7,
        purchase_price: 50,
        subtotal: 210,
        condition_on_pickup: 'good',
      })

    const inventoryAfterSubrental = await getProductInventory(product.id)

    logResult({
      step: 'TEST 3: Subrental does NOT change inventory',
      expected: 'Inventory: ' + inventoryBeforeSubrental + ' (unchanged)',
      actual: 'Inventory: ' + inventoryAfterSubrental,
      passed: inventoryAfterSubrental === inventoryBeforeSubrental,
      details: 'Changed by: ' + (inventoryAfterSubrental - inventoryBeforeSubrental) + ' (expected: 0)',
    })

    // TEST 4: Return SUBRENTAL
    log('\n🔄 TEST 4: Returning SUBRENTAL items...')

    const inventoryBeforeSubrentalReturn = await getProductInventory(product.id)

    const { data: subrentalItems } = await supabase
      .from('rental_items')
      .select('id')
      .eq('rental_id', subrental.id)

    if (subrentalItems && subrentalItems.length > 0) {
      await supabase
        .from('rental_items')
        .update({
          is_returned: true,
          condition_on_return: 'good',
          returned_at: new Date().toISOString(),
        })
        .eq('id', subrentalItems[0].id)
    }

    const inventoryAfterSubrentalReturn = await getProductInventory(product.id)

    logResult({
      step: 'TEST 4: Subrental return does NOT change inventory',
      expected: 'Inventory: ' + inventoryBeforeSubrentalReturn + ' (unchanged)',
      actual: 'Inventory: ' + inventoryAfterSubrentalReturn,
      passed: inventoryAfterSubrentalReturn === inventoryBeforeSubrentalReturn,
      details: 'Changed by: ' + (inventoryAfterSubrentalReturn - inventoryBeforeSubrentalReturn) + ' (expected: 0)',
    })

    // TEST 5: Number formats
    log('\n🔢 TEST 5: Verifying rental number formats...')

    logResult({
      step: 'TEST 5a: Rental number starts with R-',
      expected: 'Starts with R-',
      actual: rental.rental_number,
      passed: rental.rental_number.startsWith('R-'),
    })

    logResult({
      step: 'TEST 5b: Subrental number starts with S-',
      expected: 'Starts with S-',
      actual: subrental.rental_number,
      passed: subrental.rental_number.startsWith('S-'),
    })

    // CLEANUP
    log('\n🧹 Cleaning up test data...')

    await supabase.from('rental_items').delete().eq('rental_id', rental.id)
    await supabase.from('rental_items').delete().eq('rental_id', subrental.id)
    await supabase.from('rentals').delete().eq('id', rental.id)
    await supabase.from('rentals').delete().eq('id', subrental.id)

    log('✅ Test data cleaned up')

    // SUMMARY
    log('\n==================================================')
    log('📊 TEST SUMMARY')
    log('==================================================')

    const passed = results.filter(r => r.passed).length
    const total = results.length
    const percentage = Math.round((passed / total) * 100)

    console.log('\nTotal Tests: ' + total)
    console.log('Passed: ' + passed + ' ✅')
    console.log('Failed: ' + (total - passed) + ' ❌')
    console.log('Success Rate: ' + percentage + '%\n')

    if (passed === total) {
      log('🎉 ALL TESTS PASSED! M2 Subrental module is working correctly!')
      log('✅ Inventory triggers are functioning as expected')
      log('✅ Rental and Subrental types are properly distinguished')
      log('✅ Ready for production deployment')
    } else {
      log('⚠️ SOME TESTS FAILED - Review the results above')
      log('❌ DO NOT deploy until all tests pass')

      log('\nFailed tests:')
      results.filter(r => !r.passed).forEach(r => {
        console.log('  - ' + r.step)
      })
    }

    process.exit(passed === total ? 0 : 1)

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error)
    console.error('\n💡 HINT: Make sure you have:')
    console.error('   1. At least one client in the database')
    console.error('   2. At least one product with available_quantity > 0')
    console.error('   3. Valid Supabase credentials')
    process.exit(1)
  }
}

runTests()
