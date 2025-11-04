const { Router } = require('express');
const productController = require('../controllers/product.controller');

const router = Router();

// Public endpoints for products
router.get('/', productController.list);
router.get('/:id', productController.getById);

module.exports = router;
