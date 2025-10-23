const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Middleware to verify JWT token and attach user info to request
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('No token provided');
      error.status = 401;
      throw error;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach user info to request object
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
