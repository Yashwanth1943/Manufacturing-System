# Manufacturing Production & Defect Tracking System

Full-stack biscuit factory workflow system built with React, Express, SQLite, JWT, and plain CSS.

## Production Checklist

1. Install dependencies in both folders:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. Configure backend environment from `server/.env.example`.

3. Required production variables:
   - `NODE_ENV=production`
   - `CLIENT_URL`
   - `JWT_SECRET`

4. Build frontend:
   ```bash
   cd client
   npm run build
   ```

5. Start backend:
   ```bash
   cd server
   npm start
   ```

## Seed Users

- Admin: `admin@factory.com` / `admin123`
- Production: `production@factory.com` / `production123`
- Defects: `defects@factory.com` / `defects123`
- Quality: `quality@factory.com` / `quality123`

Change seeded passwords before using real production data.

## Project Documentation

- Frontend documentation: [client/README.md](client/README.md)
- Backend documentation: [server/README.md](server/README.md)
