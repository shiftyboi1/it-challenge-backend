const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

// ROUTER PRE AUTH
// Co je router? pozri comment v user.routes.js

// Asi netreba genia na to aby zistil co by "auth contoller login" robil
router.post('/login', authController.login);

module.exports = router;
