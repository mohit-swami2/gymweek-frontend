# GymWeek Frontend

React 18 SPA for **GymWeek** — public marketing site, user fitness dashboard, and super-admin panel with live CMS/theme previews.

## Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite 6 | Build tool & dev server |
| React Router 6 | Client-side routing |
| Axios | API client |
| Recharts | Progress & volume charts |
| Sonner | Toast notifications |
| Lucide React | Icons |

## Design System

Matches the **GymWeek** Figma reference:

- Background: `#080808`
- Primary (lime): `#c8ff00`
- Accent (orange): `#ff4d00`
- Fonts: **Barlow Condensed** (headings), **Barlow** (body)
- Admin panel uses a separate blue theme (configurable via CMS)

Three theme zones managed from Admin → Themes:
- `website` — landing page
- `user` — dashboard, planner, workout log
- `admin` — super-admin panel

CSS variables are injected at runtime by `ThemeProvider` from the API.

## Project Structure

```
frontend/
├── src/
│   ├── common/
│   │   ├── api/             # client.js, cmsApi.js, fitnessApi.js
│   │   └── components/      # DataTable, CmsCrudPage, PreviewPanel, StatusBadge, ChartCard
│   ├── context/
│   │   └── ThemeProvider.jsx
│   ├── modules/
│   │   ├── website/         # Landing page, legal pages, contact form
│   │   ├── auth/            # User + admin login, register, password reset
│   │   ├── user-dashboard/  # Dashboard, profile, progress views
│   │   ├── admin-dashboard/ # CMS, users, contacts, themes
│   │   ├── planner/         # Weekly workout planner
│   │   └── workout-logger/  # Live session logging
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── vercel.json
└── .env.example
```

## Prerequisites

- Node.js 20+
- GymWeek API running at `http://localhost:5000`

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at **http://localhost:5173**.

### Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL. Leave empty for local dev (Vite proxy handles `/api`) |

For production, set to your deployed API URL (e.g. `https://api.gymweek.app`).

### Vite Proxy (development)

`vite.config.js` proxies `/api` → `http://localhost:5000`, so no CORS issues in local dev.

## Routes

| Path | Panel | Auth | Description |
|------|-------|------|-------------|
| `/` | Website | Public | Marketing landing page |
| `/terms` | Website | Public | Terms & conditions |
| `/privacy` | Website | Public | Privacy policy |
| `/auth/login` | Website | Public | User login |
| `/auth/register` | Website | Public | User registration |
| `/auth/forgot-password` | Website | Public | Password recovery |
| `/admin/login` | Admin | Public | Super admin login |
| `/dashboard` | User | JWT | Fitness dashboard |
| `/planner` | User | JWT | Weekly workout planner |
| `/log` | User | JWT | Live workout logger |
| `/progress` | User | JWT | Charts & personal records |
| `/profile` | User | JWT | Profile & stats |
| `/admin` | Admin | Admin JWT | Admin overview |
| `/admin/users` | Admin | Admin JWT | User management + impersonation |
| `/admin/contacts` | Admin | Admin JWT | Contact inquiries |
| `/admin/themes` | Admin | Admin JWT | Theme config + live preview |
| `/admin/cms/*` | Admin | Admin JWT | CMS subsections |

## API Clients

| Client | Token key | Base path |
|--------|-----------|-----------|
| `websiteApi` | `gymweek_user_token` | `/api/website` |
| `adminApi` | `gymweek_admin_token` | `/api/admin` |

Response format: `{ success, message, data: [] }` — always unwrap `data[0]` for single objects.

## Admin Panel Features

- **Users** — CRUD, restrict, one-click impersonation
- **Contacts** — status workflow (pending → in_progress → fulfilled)
- **Themes** — per-panel branding with live preview
- **CMS**
  - Page Sections (hero, about, features)
  - Testimonials
  - Email Templates (`{{placeholder}}` syntax)
  - Terms & Conditions (HTML + preview)
  - Privacy Policy (HTML + preview)

## User Panel Features

- **Dashboard** — stats, weekly overview, check-in, start workout
- **Planner** — 7-day grid, add exercises from library, save plan
- **Workout Log** — set-by-set logging, timer, finish → PR/badge toasts
- **Progress** — volume charts, personal records
- **Profile** — editable profile + lifetime stats

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Deployment (Vercel)

1. Connect repo, set root to `frontend/`
2. Set `VITE_API_URL` to your production API
3. `vercel.json` handles SPA rewrites

Update the API proxy target in `vercel.json` if your backend URL differs.

## Default Admin Login

| Field | Value |
|-------|-------|
| URL | http://localhost:5173/admin/login |
| Email | mohit@mailinator.com |
| Password | 123123123 |

## Impersonation Flow

1. Admin → Users → **Login as User**
2. Admin token backed up to `gymweek_admin_token_backup`
3. User token stored in `gymweek_user_token`
4. Redirect to `/dashboard`
5. Banner shows **Exit & Return to Admin**
