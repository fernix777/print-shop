import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Load env vars
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load client env for URL
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Load server env for Service Key
const serverEnvPath = path.resolve(__dirname, '../../server/.env')
let serviceKey = null

try {
  const serverEnv = fs.readFileSync(serverEnvPath, 'utf8')
  const match = serverEnv.match(/SUPABASE_SERVICE_KEY=(.+)/)
  if (match) {
    serviceKey = match[1].trim()
  }
} catch (e) {
  console.error('Could not read server .env', e)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function inspectUserOrders() {
  const email = 'djfernix@gmail.com'
  console.log(`Inspecting user: ${email}`)

  // 1. Find User ID
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
      console.error('Error listing users:', userError)
      return
  }

  const user = users.users.find(u => u.email === email)
  
  if (!user) {
      console.log('User not found in Auth system.')
  } else {
      console.log('User found:', user.id)
      console.log('Created:', user.created_at)
      
      // 2. Check orders by user_id
      const { data: ordersById, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (ordersError) console.error('Error fetching orders by ID:', ordersError)
      
      console.log(`Orders linked to user_id (${user.id}):`, ordersById?.length || 0)
      ordersById?.forEach(o => console.log(` - ID: ${o.id}, Created: ${o.created_at}, Status: ${o.status}`))
  }

  // 3. Check orders by email in customer_info (even if user_id is null)
  console.log('Searching orders by customer_info->>email...')
  
  // Note: JSONB filtering syntax
  const { data: ordersByEmail, error: emailSearchError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (emailSearchError) {
      console.error('Error fetching all orders:', emailSearchError)
      return
  }
  
  // Filter manually since JSONB syntax in JS client can be tricky or we can iterate
  const matchingOrders = ordersByEmail.filter(o => 
      o.customer_info && o.customer_info.email === email
  )
  
  console.log(`Orders with email ${email} in customer_info:`, matchingOrders.length)
  
  matchingOrders.forEach(o => {
      console.log('---')
      console.log(`Order ID: ${o.id}`)
      console.log(`Created: ${o.created_at}`)
      console.log(`User ID column: ${o.user_id}`)
      console.log(`Is Linked correctly? ${o.user_id === user?.id}`)
  })
}

inspectUserOrders()
