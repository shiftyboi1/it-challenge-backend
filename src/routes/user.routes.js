const { Router } = require('express');
const userController = require('../controllers/user.controller');

const router = Router();

// ROUTER PRE USEROV
// Router robí to, že hovorí, kde čo aká URL dá. POST/GET sú typy requestov
// na danú funkciu pošle dáta z requestu/URL, funkcia ich spracuje a vráti response

router.get('/exists', userController.exists);
router.get('/', userController.list);
router.post('/', userController.create);

module.exports = router;
