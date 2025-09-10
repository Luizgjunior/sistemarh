// API Handler para Vercel
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Configurar variáveis de ambiente
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_12345';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Importar configuração do banco
const { initializeDB } = require('../backend/config/database');

// Importar rotas
const authRoutes = require('../backend/routes/auth');
const userRoutes = require('../backend/routes/users');
const jobRoutes = require('../backend/routes/jobs');
const applicationRoutes = require('../backend/routes/applications');

// Importar middleware
const { errorHandler } = require('../backend/middleware/errorHandler');

const app = express();

// Inicializar banco de dados
initializeDB().catch(console.error);

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});
app.use('/api', limiter);

// CORS
app.use(cors({
  origin: true, // Aceitar qualquer origem em produção
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor RH Pro funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'SQLite'
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

module.exports = app;
