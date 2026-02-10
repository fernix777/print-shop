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
const supabase = createClient(supabaseUrl, serviceKey)

async function checkProduct() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', 32)
  
  console.log(data, error)
}

checkProduct()
