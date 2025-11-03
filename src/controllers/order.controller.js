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
};
