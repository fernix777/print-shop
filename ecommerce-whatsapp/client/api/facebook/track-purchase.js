import { trackServerPurchase } from '../facebookCAPI'

export default async function handler(req, res) {
  console.log('🔍 track-purchase called:', { method: req.method, body: req.body })
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { order, eventSourceUrl } = req.body || {}
    console.log('📦 Parsed payload:', { order, eventSourceUrl })

    if (!order) {
      console.log('❌ Missing order payload')
      res.status(400).json({ success: false, error: 'Missing order payload' })
      return
    }

    // Temporarily skip Facebook API call and just return success
    console.log('✅ Simulated success (Facebook API call disabled for debugging)')
    res.status(200).json({ 
      success: true, 
      data: { 
        message: 'Simulated success - Facebook API call disabled',
        order: order,
        eventSourceUrl: eventSourceUrl || ''
      }
    })
  } catch (error) {
    console.error('❌ Error tracking purchase (serverless):', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
