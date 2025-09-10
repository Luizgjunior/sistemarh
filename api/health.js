// Endpoint de health check super simples
export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    status: 'OK',
    message: 'RH Pro API funcionando na Vercel!',
    timestamp: new Date().toISOString(),
    environment: 'production',
    method: req.method,
    url: req.url
  });
}
