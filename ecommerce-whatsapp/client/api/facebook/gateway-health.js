export default async function handler(req, res) {
  // Log para debugging
  console.log('🔍 Gateway health called:', { 
    method: req.method, 
    headers: req.headers,
    query: req.query,
    body: req.body 
  })
  
  // Aceptar GET y POST para compatibilidad con Meta
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Respuesta simple que Meta espera
  res.status(200).json({
    success: true,
    message: 'Gateway endpoint is ready',
    timestamp: new Date().toISOString(),
    method: req.method
  })
}
