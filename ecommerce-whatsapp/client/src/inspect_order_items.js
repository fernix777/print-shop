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

async function inspectOrderItems() {
  console.log('Fetching last order items...')
  
  // Get last order first
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    
  if (!orders || orders.length === 0) {
      console.log('No orders found')
      return
  }
  
  const orderId = orders[0].id
  console.log('Inspecting items for Order ID:', orderId)

  const { data: items, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) {
    console.error('Error fetching items:', error)
    return
  }

  console.log('Items found:', items.length)
  items.forEach(item => {
      console.log('---')
      console.log('ID:', item.id)
      console.log('Product Name:', item.product_name)
      console.log('Price (raw):', item.price, 'Type:', typeof item.price)
      console.log('Quantity:', item.quantity)
      console.log('Variant Info:', item.variant_info)
  })
}

inspectOrderItems()
