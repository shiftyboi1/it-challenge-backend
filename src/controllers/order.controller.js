const prisma = require('../prisma');

module.exports = {
  // List all orders (spravca + admin)
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

  // Vytvor order z userovho cartu (tzv. checkout)
  async create(req, res, next) {
    try {
      const userId = req.user.id;

      // schmatni šlupni ulízni itemy v carte usera s info o produktoch
      const cartItems = await prisma.shoppingCart.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        const error = new Error('Cart is empty');
        error.status = 400;
        throw error;
      }

      // Vypocitaj sucet ceny a priprav order itemy
      // To robim tu, aby ak dakedy dakto zmeni cenu, cena orery ostane rovnaka
      let total = 0;
      const orderItems = cartItems.map((item) => {
        const itemTotal = item.product.cost * item.amount;
        total += itemTotal;
        return {
          productId: item.productId,
          quantity: item.amount,
          price: item.product.cost, // "Snapshot" aktualnej ceny
        };
      });

      // Vytvor order s itemami v tzv. transaction
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            total,
            status: 'PROCESSING',
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        });

        // Clearni cart usera
        await tx.shoppingCart.deleteMany({
          where: { userId },
        });

        return newOrder;
      });

      res.status(201).json({ order });
    } catch (err) {
      next(err);
    }
  },

  // Getni ordery usera
  async myOrders(req, res, next) {
    try {
      const userId = req.user.id;

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, cost: true },
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

  // Getni detaily ordery podľa ID (user vidí len svoje, admin/spravca vidí akukoľvek)
  async getById(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, description: true, cost: true },
              },
            },
          },
        },
      });

      if (!order) {
        const error = new Error('Order not found');
        error.status = 404;
        throw error;
      }

      // Check auth
      if (order.userId !== userId && !['ADMIN', 'SPRAVCA'].includes(userRole)) {
        const error = new Error('Forbidden: cannot view this order');
        error.status = 403;
        throw error;
      }

      res.json({ order });
    } catch (err) {
      next(err);
    }
  },

  // Update order status (len admin/spravca)
  async updateStatus(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      const validStatuses = ['FULFILLED', 'CANCELLED', 'PROCESSING'];
      if (!status || !validStatuses.includes(status.toUpperCase())) {
        const error = new Error('Status must be FULFILLED, CANCELLED, or PROCESSING');
        error.status = 400;
        throw error;
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        const error = new Error('Order not found');
        error.status = 404;
        throw error;
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: status.toUpperCase() },
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
      });

      res.json({ order: updatedOrder });
    } catch (err) {
      next(err);
    }
  },

  // Delete entire order (admin/spravca)
  async remove(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      const existing = await prisma.order.findUnique({ where: { id: orderId } });
      if (!existing) {
        const error = new Error('Order not found');
        error.status = 404;
        throw error;
      }

      await prisma.order.delete({ where: { id: orderId } });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  // Delete a single order item (admin/spravca)
  // If it was the last item, the order is deleted automatically.
  async removeItem(req, res, next) {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);

      const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
      if (!item || item.orderId !== orderId) {
        const error = new Error('Order item not found');
        error.status = 404;
        throw error;
      }

      const result = await prisma.$transaction(async (tx) => {
        // delete the item
        await tx.orderItem.delete({ where: { id: itemId } });

        // recompute remaining items
        const remaining = await tx.orderItem.findMany({ where: { orderId } });
        if (remaining.length === 0) {
          await tx.order.delete({ where: { id: orderId } });
          return { deletedOrder: true };
        }

        const newTotal = remaining.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        const updated = await tx.order.update({ where: { id: orderId }, data: { total: newTotal } });
        return { deletedOrder: false, order: updated };
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
