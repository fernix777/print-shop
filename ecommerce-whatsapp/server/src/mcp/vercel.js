import axios from 'axios'

const VERCEL_API_BASE = process.env.VERCEL_API_URL || 'https://vercel.com/api/v6'
const TOKEN = process.env.VERCEL_TOKEN || process.env.MCP_VERCEL_TOKEN

export async function connectToVERCEL() {
  if (!TOKEN) {
    throw new Error('VERCEL_TOKEN not defined')
  }
  const url = `${VERCEL_API_BASE}/projects`
  const headers = { Authorization: `Bearer ${TOKEN}` }
  const resp = await axios.get(url, { headers })
  return resp.data
}
