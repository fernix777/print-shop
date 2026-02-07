import express from 'express'
import { connectToVERCEL } from '../mcp/vercel.js'

const router = express.Router()

// MCP-Vercel integration endpoint
router.get('/vercel', async (req, res) => {
  try {
    const data = await connectToVERCEL()
    res.json({ vercel: data })
  } catch (err) {
    console.error('[MCP] vercel endpoint error:', err?.message ?? err)
    res.status(500).json({ error: err?.message ?? 'Internal MCP VerceI Error' })
  }
})

export default router
