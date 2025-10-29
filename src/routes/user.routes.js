const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// ROUTER PRE USEROV
// Router robí to, že hovorí, kde čo aká URL dá. POST/GET sú typy requestov
// na danú funkciu pošle dáta z requestu/URL, funkcia ich spracuje a vráti response

// Public routy
router.get('/exists', userController.exists);
router.post('/', userController.create);

// Admin-only routy
// Použitý na list userov a na zmenu roly
router.get('/', requireAuth, requireRole(['ADMIN']), userController.list);
router.patch('/:id/role', requireAuth, requireRole(['ADMIN']), userController.updateRole);

module.exports = router;
