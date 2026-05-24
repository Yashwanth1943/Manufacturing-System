# Manufacturing ERP Frontend

React frontend for the Manufacturing Production & Defect Tracking System. The UI is built for a biscuit factory workflow with secure role-based portals for Admin, Production, Defects, and Quality teams.

## Tech Stack

- React.js
- React Router DOM
- Axios
- Vite
- Plain CSS

## Features

- JWT login flow with token persistence in `localStorage`
- Protected routes by role
- Role-based dashboards:
  - Admin: analytics, reports, approval statistics, recent activity
  - Production: create batches, update production status, machine cards
  - Defects: report/edit/delete defects, severity analytics
  - Quality: inspect, approve, reject, and delete quality checks
- Dynamic data from the backend API
- Search, filter, and pagination in tables
- Toast notifications
- Responsive sidebar, topbar, profile dropdown, and notifications panel

## Setup

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Default frontend URLs:

- `http://127.0.0.1:5173`
- `http://localhost:5173`

## Backend API URL

The Axios client defaults to:

```text
http://localhost:3000/api
```

To use another API URL, create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Available Scripts

```bash
npm run dev
```

Runs the Vite development server.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run lint
```

Runs ESLint checks.

```bash
npm run preview
```

Previews the production build locally.

## Login Credentials

Use the matching role in the role dropdown.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@factory.com` | `admin123` |
| Production Operator | `production@factory.com` | `production123` |
| Defects Team | `defects@factory.com` | `defects123` |
| Quality Inspector | `quality@factory.com` | `quality123` |

## Routes

| Route | Access |
| --- | --- |
| `/login` | Public |
| `/admin` | Admin |
| `/production` | Admin, Production |
| `/defects` | Admin, Defects |
| `/quality` | Admin, Quality |

## Production Build

```bash
npm run lint
npm run build
```

Deploy the generated `dist/` folder to your static hosting provider.

For production, ensure the backend `CLIENT_URL` environment variable matches the deployed frontend origin.
