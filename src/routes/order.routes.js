const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// User endpointy
router.post('/', requireAuth, orderController.create); // Vytvor order z cartu
router.get('/my', requireAuth, orderController.myOrders); // Getni ordery pre aktualneho usera
router.get('/:id', requireAuth, orderController.getById); // Getni specific order (+ auth check)

// Admin/Spravca endpointy
router.get('/', requireAuth, requireRole(['SPRAVCA', 'ADMIN']), orderController.list); // List orderov
router.patch('/:id/status', requireAuth, requireRole(['SPRAVCA', 'ADMIN']), orderController.updateStatus); // Zmen status orderu
router.delete('/:id', requireAuth, requireRole(['SPRAVCA', 'ADMIN']), orderController.remove); // Zmaž objednávku
router.delete('/:orderId/items/:itemId', requireAuth, requireRole(['SPRAVCA', 'ADMIN']), orderController.removeItem); // Zmaž položku objednávky

module.exports = router;
