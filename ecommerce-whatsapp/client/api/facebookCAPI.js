// Facebook Conversion API service for Vercel serverless functions
// Adaptado desde server/src/services/facebookCAPI.js

// Hash de string usando SHA-256 (requerido por Facebook)
// Usamos Web Crypto API en lugar de Node crypto para compatibilidad con Vercel
const hashData = async (data) => {
  if (!data) return null
  try {
    const normalized = String(data).toLowerCase().trim().replace(/\s+/g, '')
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(normalized)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.error('Error al hacer hash:', error)
    return null
  }
}

// Preparar datos de usuario con hash
const prepareUserData = async (user = {}) => {
  const userData = {}

  // Datos básicos (hasheados) - Prioridad alta
  if (user.email) userData.em = await hashData(user.email)
  if (user.phone) userData.ph = await hashData(user.phone)
  if (user.first_name) userData.fn = await hashData(user.first_name)
  if (user.last_name) userData.ln = await hashData(user.last_name)

  // Ubicación (hasheados) - Prioridad media
  if (user.city) userData.ct = await hashData(user.city)
  if (user.state) userData.st = await hashData(user.state)
  if (user.zip) userData.zp = await hashData(user.zip)
  if (user.country) userData.country = await hashData(user.country)

  // Identificadores de Facebook (NO hasheados) - Críticos
  if (user.fbp) userData.fbp = user.fbp
  if (user.fbc) userData.fbc = user.fbc

  // Identificador externo
  if (user.user_id || user.id) {
    userData.external_id = user.user_id || user.id
  }

  // Datos del navegador - Siempre incluir
  if (user.client_ip_address) {
    userData.client_ip_address = user.client_ip_address
  }
  if (user.client_user_agent) {
    userData.client_user_agent = user.client_user_agent
  }

  // Si no hay suficientes datos, agregar datos genéricos para evitar error
  const hasRequiredData = userData.em || userData.ph || userData.external_id
  if (!hasRequiredData) {
    // Agregar datos genéricos para cumplir con requisitos mínimos
    userData.client_ip_address = userData.client_ip_address || '0.0.0.0'
    userData.client_user_agent = userData.client_user_agent || 'Unknown'
  }

  return userData
}

// Enviar evento a Facebook Conversion API desde el servidor (serverless)
export async function trackServerEvent(eventName, eventData = {}) {
  const pixelId = process.env.FB_PIXEL_ID
  const accessToken = process.env.FB_ACCESS_TOKEN
  const apiVersion = 'v18.0'

  if (!pixelId || !accessToken) {
    console.warn(
      'Facebook Conversion API no está configurada. Falta FB_PIXEL_ID o FB_ACCESS_TOKEN'
    )
    return null
  }

  try {
    const userData = await prepareUserData(eventData.user || {})

    // Generar ID único para deduplicación
    const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const payload = {
      data: [
        {
          event_name: eventName,
          event_id: eventId,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: eventData.event_source_url || '',
          action_source: 'website',
          user_data: userData,
          custom_data: {
            value: eventData.value ?? undefined,
            currency: eventData.currency || 'ARS',
            content_name: eventData.content_name || undefined,
            content_type: eventData.content_type || 'product',
            content_id: eventData.content_id || undefined,
            contents: eventData.contents || []
          }
        }
      ],
      test_event_code: process.env.FB_TEST_EVENT_CODE || undefined
    }

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          access_token: accessToken
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Error en Facebook Conversion API (Serverless):', error)
      return null
    }

    const result = await response.json()
    console.log(`✅ Evento Facebook registrado (Serverless): ${eventName}`, result)
    return result
  } catch (error) {
    console.error('Error al rastrear evento Facebook (Serverless):', error)
    return null
  }
}

// Rastrear compra/conversión
export async function trackServerPurchase(order, eventSourceUrl = '') {
  return trackServerEvent('Purchase', {
    user: order.user,
    value: order.total,
    content_id: order.id,
    content_name: `Order #${order.id}`,
    event_source_url: eventSourceUrl,
    contents: (order.items || []).map((item) => ({
      id: item.product_id,
      quantity: item.quantity,
      item_price: item.price,
      title: item.product_name,
      delivery_category: 'home_delivery'
    }))
  })
}
