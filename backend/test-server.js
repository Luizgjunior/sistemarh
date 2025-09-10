// Script para testar o servidor
const http = require('http');

// Função para testar o health check
function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Servidor funcionando!');
      console.log('Status:', res.statusCode);
      console.log('Resposta:', JSON.parse(data));
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erro ao conectar:', err.message);
  });

  req.end();
}

// Aguardar um pouco e testar
setTimeout(testHealthCheck, 2000);
