// Berie variable z .env súboru a sprístupňuje ich appke.
// Aby som nemenil všicko v kóde jak dilino ale proste v 1 súbore
// "Ako to funguje samo?" basically uh šlohneš si config a accesuješ ho
const dotenv = require('dotenv');

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

if (!config.databaseUrl) {
  // Warn v dev; v prod thrownem error eventuelne
  console.warn('[config] DATABASE_URL is not set. Set it in your .env file.');
}

module.exports = config;
