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
      type: decoded.type,
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

module.exports = { requireAuth };
