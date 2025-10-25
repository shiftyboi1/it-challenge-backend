// Checkuje stav servera. Môj util a hlavne testing endpoint, dw abt it
const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

module.exports = router;
