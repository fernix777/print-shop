export default async function handler(req, res) {
  res.status(200).json({ 
    message: 'Minimal test endpoint working',
    method: req.method,
    timestamp: new Date().toISOString()
  })
}
