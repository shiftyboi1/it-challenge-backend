const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Middleware na verifikáciu JWT tokenu a savenutie usera do reqestu
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('No token provided');
      error.status = 401;
      throw error;
    }

    const token = authHeader.substring(7); // Odstran 'Bearer '

    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      err.status = 401;
      err.message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      err.status = 401;
      err.message = 'Token expired';
    }
    next(err);
  }
}

// Middleware čo checkuje ci user má nejakú z required rolí
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
