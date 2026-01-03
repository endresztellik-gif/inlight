import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://njqkdsoccdosydidmkqj.supabase.co',
  'sb_publishable_ejdq8CvEk1rAWq0o3FkH_g_DlEgiIoR'
)

async function checkDatabase() {
  console.log('\n🔍 Checking database contents...\n')

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, available_quantity, total_quantity')
    .limit(5)

  if (prodError) {
    console.log('❌ Products error:', prodError.message)
  } else {
    console.log('📦 Products (' + (products?.length || 0) + '):')
    products?.forEach(p => {
      console.log('  - ' + p.name + ': ' + p.available_quantity + '/' + p.total_quantity)
    })
  }

  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('id, name, company')
    .limit(5)

  if (clientError) {
    console.log('\n❌ Clients error:', clientError.message)
  } else {
    console.log('\n👥 Clients (' + (clients?.length || 0) + '):')
    clients?.forEach(c => {
      console.log('  - ' + c.name + (c.company ? ' (' + c.company + ')' : ''))
    })
  }

  const { data: rentals, error: rentalError } = await supabase
    .from('rentals')
    .select('id, rental_number, type')
    .limit(5)

  if (rentalError) {
    console.log('\n❌ Rentals error:', rentalError.message)
  } else {
    console.log('\n📋 Rentals (' + (rentals?.length || 0) + '):')
    rentals?.forEach(r => {
      console.log('  - ' + r.rental_number + ' (type: ' + r.type + ')')
    })
  }
}

checkDatabase()
