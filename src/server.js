const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');
const { requireAuth } = require('./middleware/auth');

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
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Defaultná route, ak niekto niečo poserie + na testing či funguje
app.get('/', (req, res) => {
  res.json({ name: 'IT Challenge API teamu Teodora' });
});

// User info z tokenu
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Error handler
// Stará sa o to, že ak sa niečo pokazí, tak to on spracuje
// Takto nedám stack trace (error detaily) dakomu, komu ich dať fakt nechcem
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
