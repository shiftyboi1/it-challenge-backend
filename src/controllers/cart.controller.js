const prisma = require('../prisma');

module.exports = {
  // ADD ITEM
  // ak uz item v carte je, prida mu +1 do amount
  async addItem(req, res, next) {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        const error = new Error('Product ID is required');
        error.status = 400;
        throw error;
      }

      // Check ci produkt vobec existuje
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
      }

      // Check ci uz je v carte
      const existing = await prisma.shoppingCart.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId,
          },
        },
      });

      let cartItem;

      if (existing) {
        // +1
        cartItem = await prisma.shoppingCart.update({
          where: { id: existing.id },
          data: { amount: existing.amount + 1 },
          include: { product: true },
        });
      } else {
        // strc novy cart item skrz krk
        cartItem = await prisma.shoppingCart.create({
          data: {
            userId: userId,
            productId: productId,
            amount: 1,
          },
          include: { product: true },
        });
      }

      res.json(cartItem);
    } catch (err) {
      next(err);
    }
  },

  // Remove one item from cart (decrement amount or delete if amount becomes 0)
  // wow dik za comment ai
  async removeItem(req, res, next) {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        const error = new Error('Product ID is required');
        error.status = 400;
        throw error;
      }

      const cartItem = await prisma.shoppingCart.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId,
          },
        },
      });

      if (!cartItem) {
        const error = new Error('Item not in cart');
        error.status = 404;
        throw error;
      }

      if (cartItem.amount > 1) {
        // -1
        const updated = await prisma.shoppingCart.update({
          where: { id: cartItem.id },
          data: { amount: cartItem.amount - 1 },
          include: { product: true },
        });
        res.json(updated);
      } else {
        // odstran item
        await prisma.shoppingCart.delete({
          where: { id: cartItem.id },
        });
        res.json({ message: 'Item removed from cart' });
      }
    } catch (err) {
      next(err);
    }
  },

  // Remove vsetky itemy jedneho typu z cartu
  async removeAll(req, res, next) {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        const error = new Error('Product ID is required');
        error.status = 400;
        throw error;
      }

      const cartItem = await prisma.shoppingCart.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId,
          },
        },
      });

      if (!cartItem) {
        const error = new Error('Item not in cart');
        error.status = 404;
        throw error;
      }

      await prisma.shoppingCart.delete({
        where: { id: cartItem.id },
      });

      res.json({ message: 'All items removed from cart' });
    } catch (err) {
      next(err);
    }
  },

  async getCart(req, res, next) {
    try {
      const userId = req.user.id;

      const cartItems = await prisma.shoppingCart.findMany({
        where: { userId: userId },
        include: {
          product: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(cartItems);
    } catch (err) {
      next(err);
    }
  },

  // Odstran vsetko z cartu
  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;

      await prisma.shoppingCart.deleteMany({
        where: { userId: userId },
      });

      res.json({ message: 'Cart cleared' });
    } catch (err) {
      next(err);
    }
  },
};
