# Digivla IDS 2.0 — Frontend

Web admin platform for **Digivla IDS** (TV, Radio, Online media operations).

**Repository:** `gitlab.digivla.id/support/input-digivla-2.0-frontend`

## Stack

- **Next.js 15** (App Router)
- **Ant Design** + custom Digivla theme
- **TypeScript**
- BFF API routes → backend FastAPI

## Quick Start

```bash
npm install
cp .env.example .env.local   # set BACKEND_API_URL
npm run dev                  # http://localhost:3005
```

## Environment

| Variable | Description |
|----------|-------------|
| `BACKEND_API_URL` | Backend API (e.g. `http://192.168.100.50:8005`) |
| `JWT_SECRET_KEY` | Must match backend for cookie/session |

## Features

- RBAC sidebar (superadmin, admin, staff, analis)
- Dashboard, Media, TV / Radio / Online articles
- Quality Control, User Management, Tools (Media Reach)

## Production

```bash
npm run build
npm run start   # port 3005, host 0.0.0.0
```

## Related repos

- Backend: `support/input-digivla-2.0-backend`
- Mobile: Flutter app (`digivla_mobile`)
