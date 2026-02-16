import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan variables SUPABASE_URL o SUPABASE_SERVICE_KEY')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function toSlug(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function listStorageProducts() {
  const root = 'products'
  const { data, error } = await supabase.storage.from('product-images').list(root, { limit: 10000, recursive: true })
  if (error) throw error
  const byProduct = {}
  for (const item of data || []) {
    if (item.name && item.id) {
      const fullPath = item.name.startsWith(root) ? item.name : `${root}/${item.name}`
      const parts = fullPath.split('/')
      const idx = parts.indexOf('products')
      const pid = parts[idx + 1]
      const numId = Number(pid)
      if (Number.isFinite(numId)) {
        const filePath = `products/${pid}/${parts.slice(idx + 2).join('/')}`
        const { data: pu } = supabase.storage.from('product-images').getPublicUrl(filePath)
        byProduct[pid] = byProduct[pid] || []
        byProduct[pid].push({ path: filePath, url: pu.publicUrl })
      }
    }
  }
  return byProduct
}

async function recoverFromOrders(productId) {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_name, price, order_id, created_at')
    .eq('product_id', Number(productId))
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) return null
  if (!data || data.length === 0) return null
  const row = data[0]
  return { name: row.product_name || `Producto ${productId}`, price: Number(row.price) || 0 }
}

async function productExists(productId) {
  const { data } = await supabase.from('products').select('id').eq('id', Number(productId)).limit(1)
  return data && data.length > 0
}

async function insertProduct(productId, name, price) {
  const slug = toSlug(name || `producto-${productId}`)
  const payload = {
    id: Number(productId),
    name: name || `Producto ${productId}`,
    slug,
    description: '',
    price: Number(price) || 0,
    base_price: Number(price) || 0,
    stock: 0,
    featured: false,
    active: true
  }
  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'id' }).select().single()
  if (error) throw error
  return data
}

async function insertImages(productId, images) {
  if (!images || images.length === 0) return
  const records = images.map((img, idx) => ({
    product_id: Number(productId),
    image_url: img.url,
    display_order: idx,
    is_primary: idx === 0
  }))
  const { error } = await supabase.from('product_images').insert(records)
  if (error) throw error
}

async function main() {
  try {
    const byProduct = await listStorageProducts()
    const productIds = Object.keys(byProduct)
    if (productIds.length === 0) {
      console.log('No se encontraron imágenes en Storage bajo products/')
    }
    let recovered = 0
    for (const pid of productIds) {
      const exists = await productExists(pid)
      if (exists) continue
      const fromOrder = await recoverFromOrders(pid)
      const name = fromOrder?.name || `Producto ${pid}`
      const price = fromOrder?.price || 0
      const prod = await insertProduct(pid, name, price)
      await insertImages(pid, byProduct[pid])
      recovered++
      console.log(`Recuperado producto ${pid}: ${prod.name} con ${byProduct[pid].length} imágenes`)
    }
    if (recovered === 0 && productIds.length > 0) {
      console.log('Todos los productos con imágenes ya existen en la base.')
    }
    if (productIds.length === 0) {
      const { data } = await supabase
        .from('order_items')
        .select('product_id, product_name, price')
        .order('created_at', { ascending: false })
        .limit(2000)
      const seen = new Map()
      for (const row of data || []) {
        const pid = Number(row.product_id)
        if (!Number.isFinite(pid)) continue
        if (await productExists(pid)) continue
        if (seen.has(pid)) continue
        await insertProduct(pid, row.product_name || `Producto ${pid}`, Number(row.price) || 0)
        seen.set(pid, true)
        recovered++
        console.log(`Recuperado producto ${pid} desde órdenes: ${row.product_name}`)
      }
    }
    console.log(`Total recuperado: ${recovered}`)
    process.exit(0)
  } catch (err) {
    console.error('Error en recuperación:', err)
    process.exit(1)
  }
}

main()
