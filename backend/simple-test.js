// Teste simples para verificar se o servidor está funcionando
const http = require('http');

console.log('🔍 Testando conectividade...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Servidor está funcionando!');
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (err) => {
  console.log('❌ Erro de conexão:', err.message);
  console.log('💡 Certifique-se de que o servidor está rodando na porta 3000');
});

req.on('timeout', () => {
  console.log('⏰ Timeout - Servidor não respondeu em 5 segundos');
  req.destroy();
});

req.end();
