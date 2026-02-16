import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Client } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

function getProjectRef(url) {
  const u = new URL(url)
  const host = u.hostname
  const parts = host.split('.')
  return parts[0]
}

async function connect() {
  const ref = getProjectRef(process.env.SUPABASE_URL)
  const client = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  return client
}

async function execFile(client, p) {
  const sql = fs.readFileSync(p, 'utf8')
  await client.query(sql)
}

async function run() {
  const client = await connect()
  const baseDir = path.join(__dirname)
  const schemaFile = path.join(baseDir, 'supabase-schema.sql')
  await execFile(client, schemaFile)
  const migrationsDir = path.join(baseDir, 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  for (const f of files) {
    await execFile(client, path.join(migrationsDir, f))
  }
  const buckets = [
    { id: 'product-images', name: 'product-images', public: true },
    { id: 'category-images', name: 'category-images', public: true },
    { id: 'logos', name: 'logos', public: true }
  ]
  for (const b of buckets) {
    await client.query(
      'INSERT INTO storage.buckets (id, name, public) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [b.id, b.name, b.public]
    )
  }
  const storagePolicies = path.join(baseDir, 'supabase-storage-policies.sql')
  await execFile(client, storagePolicies)
  await client.end()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
