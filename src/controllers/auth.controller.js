const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

module.exports = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        const err = new Error('Email and password are required');
        err.status = 400;
        throw err;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
      }

      const token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      next(err);
    }
  },
};
