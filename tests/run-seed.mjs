import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://njqkdsoccdosydidmkqj.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ejdq8CvEk1rAWq0o3FkH_g_DlEgiIoR'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('\n🌱 Running seed script...\n')

// Read and execute seed.sql file
const seedSQL = readFileSync('supabase/seed.sql', 'utf-8')

// Execute using Supabase RPC or direct SQL execution
// Note: This requires executing the DO $$ block which needs elevated permissions
// Recommended: Run this in Supabase Dashboard SQL Editor instead

console.log('⚠️  This seed script contains PL/pgSQL blocks that require admin privileges.')
console.log('📋 Please run the following file in Supabase Dashboard SQL Editor:')
console.log('   supabase/seed.sql')
console.log('\n🔗 Dashboard URL: https://supabase.com/dashboard/project/njqkdsoccdosydidmkqj/sql/new')
console.log('\n📝 Steps:')
console.log('   1. Open the URL above')
console.log('   2. Copy/paste the contents of supabase/seed.sql')
console.log('   3. Click "Run"')
console.log('\n✅ After running, the database will have:')
console.log('   - 5 categories (Camera, Lenses, Lighting, Audio, Grip)')
console.log('   - 20 products')
console.log('   - 5 clients')
console.log('   - 3 rentals (2 active, 1 completed)')
console.log('   - 3 subrentals (1 active, 2 completed)')
console.log('')
