// Handler da API para Vercel
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Configurar variáveis de ambiente para produção
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'rhpro_jwt_secret_production_2024';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

// Middleware básico
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Importar e inicializar banco de dados
try {
  const { initDatabase } = require('../backend/config/database');
  initDatabase().catch(error => {
    console.error('Erro ao inicializar banco:', error);
  });
} catch (error) {
  console.error('Erro ao importar database:', error);
}

// Rota de health check simples
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API RH Pro funcionando na Vercel!',
    timestamp: new Date().toISOString(),
    environment: 'production',
    database: 'SQLite'
  });
});

// Importar rotas com tratamento de erro
try {
  const authRoutes = require('../backend/routes/auth');
  const userRoutes = require('../backend/routes/users');
  const jobRoutes = require('../backend/routes/jobs');
  const applicationRoutes = require('../backend/routes/applications');

  // Aplicar rotas
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
} catch (error) {
  console.error('Erro ao importar rotas:', error);
  
  // Fallback routes em caso de erro
  app.use('/api/*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  });
}

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Rota 404 para APIs
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.path}`
  });
});

// Rota catch-all
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

module.exports = app;