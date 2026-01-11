import { trackServerInitiateCheckout } from '../facebookCAPI.js'

export default async function handler(req, res) {
  console.log('🔍 track-checkout called:', { method: req.method, body: req.body })
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { cartTotal, itemsCount, user, eventSourceUrl } = req.body || {}
    console.log('📦 Parsed payload:', { cartTotal, itemsCount, user, eventSourceUrl })

    if (!cartTotal || !itemsCount) {
      console.log('❌ Missing cartTotal or itemsCount')
      res.status(400).json({ success: false, error: 'Missing cartTotal or itemsCount' })
      return
    }

    console.log('🚀 Calling trackServerInitiateCheckout...')
    const result = await trackServerInitiateCheckout(cartTotal, itemsCount, user, eventSourceUrl || '')
    console.log('✅ trackServerInitiateCheckout result:', result)
    res.status(200).json({ success: !!result, data: result })
  } catch (error) {
    console.error('❌ Error tracking checkout (serverless):', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
