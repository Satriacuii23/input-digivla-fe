# Digivla IDS V2 - Frontend Structure

New frontend project using **Next.js 15** with **Mantine UI 7**.

## Technology Stack

- **Framework**: Next.js 15
- **UI Library**: Mantine UI 7
- **Icons**: Tabler Icons
- **Date**: Day.js + Mantine Dates

## Project Structure

```
Frontend/V2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (proxy to backend)
│   │   │   └── auth/         # Authentication endpoints
│   │   ├── login/            # Login page
│   │   ├── (dashboard)/      # Dashboard routes (with layout)
│   │   │   ├── media/        # Media management
│   │   │   │   ├── list/     # Media list page
│   │   │   │   └── add/      # Add media page
│   │   │   ├── tv/           # TV articles
│   │   │   │   ├── list/     # TV list page
│   │   │   │   └── upload/   # TV upload page
│   │   │   ├── radio/        # Radio articles
│   │   │   │   ├── list/     # Radio list page
│   │   │   │   └── upload/   # Radio upload page
│   │   │   ├── online/       # Online articles
│   │   │   │   ├── list/     # Online list page
│   │   │   │   └── upload/   # Online upload page
│   │   │   ├── page.tsx      # Dashboard overview
│   │   │   └── layout.tsx    # Dashboard layout wrapper
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Root redirect
│   │
│   ├── components/            # React components
│   │   └── layout/           # Layout components
│   │       └── dashboard-layout.tsx
│   │
│   └── lib/                   # Utilities
│       ├── api/              # API client
│       │   └── client.ts
│       ├── hooks/            # Custom hooks
│       └── types/           # TypeScript types
│
├── package.json
├── tsconfig.json
├── next.config.mjs
└── postcss.config.cjs
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/dashboard` | Dashboard overview |
| `/media/list` | Media list |
| `/media/add` | Add new media |
| `/tv/list` | TV articles list |
| `/tv/upload` | Upload TV article |
| `/radio/list` | Radio articles list |
| `/radio/upload` | Upload Radio article |
| `/online/list` | Online articles list |
| `/online/upload` | Upload Online article |

## Commands

```bash
# Install dependencies
cd Frontend/V2
npm install

# Development (port 3002)
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

## Design Guidelines

- Clean, simple, informative design
- Professional and modern without gradient colors
- Color palette: Blues, greens, oranges for type differentiation
- Mantine UI components with minimal custom styling