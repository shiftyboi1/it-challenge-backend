const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const cartRoutes = require('./routes/cart.routes');
const jwt = require('jsonwebtoken');
const cfg = require('./config/env');

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Pripoj routes
// Route = vpodstate URL endpoint. Teda "{URL}/api/users" pôjde do "userRoutes"
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);

// Defaultná route, ak niekto niečo poserie + na testing či funguje
app.get('/', (req, res) => {
  res.json({ name: 'IT Challenge API teamu Teodora :D' });
});

// Protected route middleware
// Robí to, že user musí byť prihlásený, aby mohol pokračovať
// Prihlásenie: poslanie email a pass do /api/auth/login, dostane token
// Token sa musí store-núť (napr. localStorage, cookie) a posielať v Authorization headeri
// v tvare "Bearer {token}"
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);
  try {
    // Dáva do req.user payload z tokenu, teda info o userovi
    // req.user.sub = user ID
    // req.user.email = user email

    // TODO: Only save mail, not ID, so i can change user emails if needed
    // TODO: Also save roles/permissions in token you utter bollocks
    const payload = jwt.verify(token, cfg.jwtSecret);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Example protected route
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Error handler (posledný)
// Stará sa o to, že ak sa niečo pokazí, tak to on spracuje
// Takto nedám stack trace (error detaily) dakomu, komu ich dať fakt nechcem
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
