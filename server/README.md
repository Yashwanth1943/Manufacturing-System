# Manufacturing ERP Backend

Express.js API server for the Manufacturing Production & Defect Tracking System. It provides secure JWT authentication, role-based authorization, SQLite persistence, production batch workflow APIs, defect tracking, quality inspection, analytics, and notifications.

## Tech Stack

- Node.js
- Express.js
- SQLite
- JWT
- bcryptjs
- CORS

## Features

- JWT authentication
- bcrypt password hashing
- Protected API routes
- Role-based authorization
- SQLite database initialization and seed data
- Auto-generated unique batch IDs
- Production workflow:
  - Production creates and updates batches
  - Defects team reports and manages defects
  - Quality team approves/rejects batches
  - Admin monitors analytics
- Security hardening:
  - Required production env validation
  - Security headers
  - Rate limiting
  - Request body size limit
  - Safer production error responses
  - Graceful shutdown

## Setup

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm start
```

The API runs on:

```text
http://localhost:3000/api
```

Health check:

```text
GET http://localhost:3000/api/health
```

## Environment Variables

Copy `.env.example` and configure real values for production.

```env
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-frontend-domain.example
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
REQUEST_LIMIT=100kb
```

Required in production:

- `JWT_SECRET`
- `CLIENT_URL`

Development defaults allow:

- `http://127.0.0.1:5173`
- `http://localhost:5173`

## Available Scripts

```bash
npm start
```

Starts the API with Node.

```bash
npm run dev
```

Starts the API with Nodemon.

```bash
npm run check
```

Runs Node syntax checks.

```bash
npm run prod
```

Starts the server with `NODE_ENV=production` on Windows. Make sure production env variables are set first.

## Seed Users

Use these accounts for local development. Change passwords before using real production data.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@factory.com` | `admin123` |
| Production | `production@factory.com` | `production123` |
| Defects | `defects@factory.com` | `defects123` |
| Quality | `quality@factory.com` | `quality123` |

## API Overview

### Authentication

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Admin |
| GET | `/api/auth/profile` | Authenticated |

### Production Batches

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/batches` | Admin, Production, Defects, Quality |
| POST | `/api/batches` | Admin, Production |
| PUT | `/api/batches/:id` | Admin, Production |
| DELETE | `/api/batches/:id` | Admin, Production |

Production users cannot set batch status to `Approved` or `Rejected`. Those actions belong to the Quality workflow.

### Defects

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/defects` | Admin, Defects |
| POST | `/api/defects` | Admin, Defects |
| PUT | `/api/defects/:id` | Admin, Defects |
| DELETE | `/api/defects/:id` | Admin, Defects |

### Quality

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/quality` | Admin, Quality |
| POST | `/api/quality` | Admin, Quality |
| PUT | `/api/quality/:id/status` | Admin, Quality |
| DELETE | `/api/quality/:id` | Admin, Quality |

### Dashboards

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/production` | Admin, Production |
| GET | `/api/dashboard/defects` | Admin, Defects |
| GET | `/api/dashboard/quality` | Admin, Quality |

### Notifications

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/notifications` | Authenticated |
| PUT | `/api/notifications/read` | Authenticated |
| DELETE | `/api/notifications/:id` | Authenticated, role-scoped |

## Database

SQLite database file:

```text
server/database/manufacturing.db
```

Tables:

- `users`
- `production_batches`
- `defects`
- `quality_checks`
- `machines`
- `notifications`
- `production_lines`
- `batch_sequences`

## Production Notes

- Set a strong `JWT_SECRET`.
- Change seed user passwords.
- Back up `database/manufacturing.db`.
- Set `CLIENT_URL` to the deployed frontend origin.
- Do not commit `.env` files.
- For Linux/macOS production startup, use:

```bash
NODE_ENV=production node index.js
```
