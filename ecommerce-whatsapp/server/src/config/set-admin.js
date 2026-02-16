import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const targetEmail = 'administracion@mail.com'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setAdminByEmail(email) {
  // Listar usuarios y buscar por email
  let nextPageToken = undefined
  let found = null

  do {
    const { data, error } = await supabase.auth.admin.listUsers({ page: nextPageToken ? undefined : 1 })
    if (error) throw error
    for (const u of data.users || []) {
      if (u.email && u.email.toLowerCase() === email.toLowerCase()) {
        found = u
        break
      }
    }
    nextPageToken = data.nextPageToken
  } while (!found && nextPageToken)

  if (!found) {
    console.error(`No se encontró el usuario con email: ${email}. Pide al usuario que se registre e intenta de nuevo.`)
    process.exit(2)
  }

  const { error: updErr } = await supabase.auth.admin.updateUserById(found.id, {
    user_metadata: { role: 'admin' }
  })
  if (updErr) throw updErr

  console.log(`Usuario ${email} actualizado a role=admin`)
}

setAdminByEmail(targetEmail).catch(err => {
  console.error(err)
  process.exit(1)
})
