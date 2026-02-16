import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function upsertSettings() {
  const rows = [
    { key: 'store_name', value: 'Print Shop', type: 'string' },
    { key: 'whatsapp_number', value: '+5491112345678', type: 'string' },
    { key: 'store_email', value: 'info@printshop.com.ar', type: 'string' },
    { key: 'store_address', value: 'Buenos Aires, Argentina', type: 'string' },
    { key: 'currency', value: 'ARS', type: 'string' },
    { key: 'tax_rate', value: '0', type: 'number' }
  ]
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
  if (error) throw error
}

async function seedCategories() {
  const categories = [
    { name: 'Remeras', slug: 'remeras', description: 'Remeras personalizadas', display_order: 1 },
    { name: 'Tazas', slug: 'tazas', description: 'Tazas personalizadas', display_order: 2 },
    { name: 'Gorras', slug: 'gorras', description: 'Gorras personalizadas', display_order: 3 }
  ]
  const { data, error } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' }).select()
  if (error) throw error
  return data
}

async function seedSubcategories(catMap) {
  const subcats = [
    { category_id: catMap['remeras'], name: 'Estampadas', slug: 'remeras-estampadas', description: null, display_order: 1 },
    { category_id: catMap['remeras'], name: 'Personalizadas', slug: 'remeras-personalizadas', description: null, display_order: 2 },
    { category_id: catMap['tazas'], name: 'Cerámica', slug: 'tazas-ceramica', description: null, display_order: 1 },
    { category_id: catMap['gorras'], name: 'Clasicas', slug: 'gorras-clasicas', description: null, display_order: 1 }
  ]
  const { data, error } = await supabase.from('subcategories').upsert(subcats, { onConflict: 'slug' }).select()
  if (error) throw error
  return data
}

async function seedSampleProduct(catMap, subcatList) {
  const subMap = {}
  for (const s of subcatList) subMap[s.slug] = s.id
  const product = {
    name: 'Remera Personalizada',
    slug: 'remera-personalizada',
    description: 'Remera básica de algodón con impresión personalizada',
    price: 9999.0,
    stock: 100,
    category_id: catMap['remeras'],
    subcategory_id: subMap['remeras-personalizadas'],
    featured: true,
    active: true
  }
  const { data: prod, error: pErr } = await supabase.from('products').upsert([product], { onConflict: 'slug' }).select().single()
  if (pErr) throw pErr
  // Vincular producto con categoría via tabla pivote
  const pivot = {
    product_id: prod.id,
    category_id: catMap['remeras'],
    subcategory_id: subMap['remeras-personalizadas']
  }
  const { error: pcErr } = await supabase.from('product_categories').upsert([pivot], { onConflict: 'product_id,category_id,subcategory_id' })
  if (pcErr) throw pcErr
  const images = [
    { product_id: prod.id, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600', is_primary: true, display_order: 1 }
  ]
  const { error: iErr } = await supabase.from('product_images').upsert(images)
  if (iErr) throw iErr
  const variants = [
    { product_id: prod.id, variant_type: 'color', variant_value: 'Negro', price_modifier: 0, stock: 50, sku: 'REM-N-001', active: true },
    { product_id: prod.id, variant_type: 'size', variant_value: 'M', price_modifier: 0, stock: 25, sku: 'REM-M-001', active: true }
  ]
  const { error: vErr } = await supabase.from('product_variants').upsert(variants)
  if (vErr) throw vErr
}

async function run() {
  await upsertSettings()
  const cats = await seedCategories()
  const catMap = {}
  for (const c of cats) catMap[c.slug] = c.id
  const subcats = await seedSubcategories(catMap)
  await seedSampleProduct(catMap, subcats)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
