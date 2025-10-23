const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { requireAuth } = require('../middleware/auth');

// All cart routes require authentication
router.use(requireAuth);

// GET /api/cart - Get user's cart
router.get('/', cartController.getCart);

// POST /api/cart/add - Add item to cart (or increment amount)
router.post('/add', cartController.addItem);

// POST /api/cart/remove - Remove one item from cart (decrement amount)
router.post('/remove', cartController.removeItem);

// POST /api/cart/remove-all - Remove all of a specific product from cart
router.post('/remove-all', cartController.removeAll);

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart);

module.exports = router;
