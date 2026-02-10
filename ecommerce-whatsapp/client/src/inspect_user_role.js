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

async function inspectUserRole() {
  const email = 'djfernix@gmail.com'
  
  const { data: users, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
      console.error('Error:', error)
      return
  }

  const user = users.users.find(u => u.email === email)
  
  if (user) {
      console.log('User Metadata:', user.user_metadata)
      console.log('App Metadata:', user.app_metadata)
      console.log('Role:', user.role)
  } else {
      console.log('User not found')
  }
}

inspectUserRole()
