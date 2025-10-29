const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Spravca a Admin môžu listnúť všetky ordery
router.get('/', requireAuth, requireRole(['SPRAVCA', 'ADMIN']), orderController.list);

module.exports = router;
