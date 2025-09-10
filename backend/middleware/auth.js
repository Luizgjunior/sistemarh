const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou usuário inativo'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar tipos de usuário
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tipo de usuário'
      });
    }
    next();
  };
};

// Middleware para verificar se é o próprio usuário ou admin
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (req.user.userType === 'admin' || req.user._id.toString() === req.params.id) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin
};
