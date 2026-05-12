
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConstraint() {
  const { data, error } = await supabase.rpc('get_check_constraint', { constraint_name: 'orders_status_check' })
  if (error) {
    // If RPC doesn't exist, try a direct query if possible, or just try to insert/update with different values
    console.log('RPC failed, trying raw query if possible (likely not via Supabase client)...')
    
    // Testing values by trying to update a dummy order or just reporting error message details
    const { error: testError } = await supabase.from('orders').update({ status: 'test_value' }).eq('id', '00000000-0000-0000-0000-000000000000')
    console.log('Test update error message:', testError?.message)
  } else {
    console.log('Constraint definition:', data)
  }
}

checkConstraint()
