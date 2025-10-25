const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { requireAuth } = require('../middleware/auth');

// ROUTER PRE CART
// Co je router? pozri comment v user.routes.js

// Cart routy potrebuju auth
router.use(requireAuth);

// GET /api/cart - Getni cart usera
router.get('/', cartController.getCart);

// POST /api/cart/add - Pridaj item do cartu (alebo zväčši množstvo)
router.post('/add', cartController.addItem);

// POST /api/cart/remove - Odstran jeden item z cartu (zmenši množstvo)
router.post('/remove', cartController.removeItem);

// POST /api/cart/remove-all - Odstran všetky kusy jedného produktu z cartu
router.post('/remove-all', cartController.removeAll);

// DELETE /api/cart - Clearni cart
router.delete('/', cartController.clearCart);

module.exports = router;
