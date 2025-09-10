const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, companyInfo, candidateInfo } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findByEmailWithPassword(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já está em uso'
      });
    }

    // Criar usuário
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      userType
    };

    // Adicionar informações específicas do tipo de usuário
    if (userType === 'empresa' && companyInfo) {
      userData.companyInfo = companyInfo;
    } else if (userType === 'candidato' && candidateInfo) {
      userData.candidateInfo = candidateInfo;
    }

    const user = await User.create(userData);

    // Gerar token
    const token = User.generateAuthToken(user);

    // Atualizar último login
    await User.updateLastLogin(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login do usuário
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    // Buscar usuário com senha
    const user = await User.findByEmailWithPassword(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isPasswordValid = User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar tipo de usuário se fornecido
    if (userType && user.user_type !== userType) {
      return res.status(401).json({
        success: false,
        message: 'Tipo de usuário incorreto'
      });
    }

    // Gerar token
    const token = User.generateAuthToken(user);

    // Atualizar último login
    await User.updateLastLogin(user.id);

    // Buscar dados completos do usuário
    const fullUser = await User.findById(user.id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: fullUser
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout do usuário
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obter dados do usuário atual
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Solicitar recuperação de senha
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmailWithPassword(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Aqui você implementaria o envio de e-mail
    res.json({
      success: true,
      message: 'E-mail de recuperação enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verificar se token é válido
// @access  Private
router.post('/verify-token', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
});

module.exports = router;