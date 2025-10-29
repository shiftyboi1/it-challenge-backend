const prisma = require('../prisma');

module.exports = {
  // Listni všetky ordery (spravca + admin)
  async list(req, res, next) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },
};
