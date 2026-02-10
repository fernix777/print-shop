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

async function inspectOrder8() {
  const orderId = 8
  console.log(`Inspecting Order #${orderId}...`)

  // Check Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError) {
      console.error('Error fetching order:', orderError)
      return
  }
  
  console.log('Order found:', order)

  // Check Items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (itemsError) {
    console.error('Error fetching items:', itemsError)
    return
  }

  console.log(`Items found: ${items.length}`)
  items.forEach(item => {
      console.log('---')
      console.log('ID:', item.id)
      console.log('Product ID:', item.product_id)
      console.log('Product Name:', item.product_name)
      console.log('Price:', item.price)
      console.log('Quantity:', item.quantity)
  })
}

inspectOrder8()
