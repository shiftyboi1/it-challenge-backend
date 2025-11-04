const prisma = require('../prisma');

module.exports = {
  // List all products (public)
  async list(req, res, next) {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({ products });
    } catch (err) {
      next(err);
    }
  },

  // Get single product by id (public)
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isFinite(id)) {
        const error = new Error('Invalid product id');
        error.status = 400;
        throw error;
      }

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
      }
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },
};
