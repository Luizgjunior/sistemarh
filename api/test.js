// Arquivo de teste simples para debug na Vercel
module.exports = (req, res) => {
  res.json({
    message: 'Test endpoint funcionando!',
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
};
