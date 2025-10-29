const prisma = require('../prisma');
const bcrypt = require('bcryptjs');

// Controller pre userov, spracováva requesty z user.routes.js

module.exports = {
  // Admin only: paginated user list with optional role filter and email search
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = 20;
      const skip = (page - 1) * pageSize;

      const { role, email } = req.query;

      const where = {};
      if (role && ['USER', 'SPRAVCA', 'ADMIN'].includes(role.toUpperCase())) {
        where.role = role.toUpperCase();
      }
      if (email) {
        where.email = { contains: email, mode: 'insensitive' };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
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
      const { email, name, password, type } = req.body;

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
        data: { email, name, passwordHash, role: 'USER' }, // Always default to USER
        select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
      });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },

  // Admin only: change user role (USER <-> SPRAVCA only, cannot touch ADMIN)
  async updateRole(req, res, next) {
    try {
      const targetUserId = parseInt(req.params.id);
      const { role } = req.body;

      if (!role || !['USER', 'SPRAVCA'].includes(role.toUpperCase())) {
        const error = new Error('Role must be USER or SPRAVCA');
        error.status = 400;
        throw error;
      }

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Cannot change role of ADMIN users
      if (targetUser.role === 'ADMIN') {
        const error = new Error('Cannot change role of admin users');
        error.status = 403;
        throw error;
      }

      // Cannot change own role
      if (req.user.id === targetUserId) {
        const error = new Error('Cannot change your own role');
        error.status = 403;
        throw error;
      }

      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: role.toUpperCase() },
        select: { id: true, email: true, name: true, role: true, updatedAt: true },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
