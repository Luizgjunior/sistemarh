// Script de inicialização segura
const path = require('path');

// Configurar variáveis de ambiente
process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_12345';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

console.log('🔧 Configurações carregadas:');
console.log('- Porta:', process.env.PORT);
console.log('- Ambiente:', process.env.NODE_ENV);
console.log('- Frontend URL:', process.env.FRONTEND_URL);

// Tentar inicializar o banco de dados primeiro
const { initDatabase } = require('./config/database');

console.log('🗄️  Inicializando banco de dados...');

initDatabase()
  .then(() => {
    console.log('✅ Banco de dados inicializado com sucesso!');
    
    // Agora iniciar o servidor
    console.log('🚀 Iniciando servidor...');
    require('./server');
  })
  .catch((error) => {
    console.error('❌ Erro ao inicializar banco:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
