# IT Challenge Backend

Express + Prisma + PostgreSQL backend with a clean, scalable file structure.

## Project Structure

```
src/
  config/
    env.js               # Loads env vars, shared config
  controllers/
    user.controller.js   # Example controller using Prisma
  middleware/
    errorHandler.js      # Central error handler
  routes/
    health.routes.js     # GET /api/health
    user.routes.js       # /api/users endpoints
  prisma.js              # Prisma client singleton
  server.js              # App bootstrap
prisma/
  schema.prisma          # Database schema (source of truth)
  seed.js                # Optional seed script
.env.example             # Template for environment variables
```

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create your .env from the example and configure the database

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL to your local Postgres
```

3. Create and migrate the database

```bash
npm run migrate -- --name init
```

4. Generate Prisma client (optional, migration runs it too)

```bash
npm run generate
```

5. Start the server

```bash
npm run dev
# or
npm start
```

6. Try the endpoints

```bash
# Health
curl http://localhost:3000/api/health

# Users (empty list initially)
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

## Notes

- Migrations are the source of truth for schema changes. On a fresh clone: `npm install && npm run migrate`.
- Use `npm run studio` to open Prisma Studio to inspect your DB.
- Configure CORS via `CORS_ORIGIN` in `.env`.
- In production, run `npm run deploy:migrations` before starting the app.
