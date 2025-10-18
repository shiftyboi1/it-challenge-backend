const prisma = require('../prisma');
const bcrypt = require('bcryptjs');

// Controller pre userov, spracováva requesty z user.routes.js

module.exports = {
  async list(req, res, next) {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      });
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async exists(req, res, next) {
    try {
      const { email } = req.query;
      if (!email) {
        const error = new Error('Email query param is required');
        error.status = 400;
        throw error;
      }
      const found = await prisma.user.findUnique({ where: { email } });
      res.json({ exists: Boolean(found) });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { email, name, password } = req.body;

      if (!email) {
        const error = new Error('Prosíme zadajte email');
        error.status = 400;
        throw error;
      }

      if (!password || password.length < 8) {
        const error = new Error('Heslo musí byť aspoň 8 znakov dlhé');
        error.status = 400;
        throw error;
      }

      // Check for duplicate email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        const error = new Error('Email už obsadený, skill issue');
        error.status = 409; // Conflict
        throw error;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: { email, name, passwordHash },
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },
};
