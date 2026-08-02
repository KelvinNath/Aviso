# Aviso

**Official information. Unofficial personality.**

Aviso monitors official engineering entrance exam websites (starting with JEE Main) and delivers timely alerts to students via Telegram and the web dashboard.

## Monorepo structure

```
Aviso/
├── apps/
│   ├── web/          # Next.js 15 — landing, dashboard, auth, API routes
│   └── crawler/      # Exam crawler, scheduler, Telegram bot, notification worker
├── packages/         # Shared packages (scaffolding — not yet wired in)
├── prisma/           # Schema and migrations (PostgreSQL)
├── docs/             # Architecture, domain, database documentation
├── design.md         # Brand and UI design system
└── docker-compose.yml
```

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- Google Cloud OAuth credentials (web sign-in)
- Telegram Bot token (notifications + account linking)

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` at the repo root and fill in values:

```bash
cp .env.example .env
```

Generate an auth secret (use `AUTH_SECRET`, not `BETTER_AUTH_SECRET`):

```bash
npx auth secret
```

Key variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`, `BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`.

The web app loads env from the **repo root** via `apps/web/next.config.ts`.

### 3. Database

```bash
docker compose up -d
npx prisma migrate deploy
npx prisma generate
```

Optional seed (local dev):

```bash
npx tsx prisma/seed.ts
```

### 4. Run services

```bash
# Web app (default port 3000; set AUTH_URL to match your port)
npm run dev --workspace=@aviso/web

# Or run web + crawler together via Turbo
npm run dev

# Telegram bot (separate terminal)
npm run bot
```

### 5. Sign in and connect Telegram

1. Open `http://localhost:3000/signin` (or your configured port)
2. Sign in with Google
3. On the dashboard, pick exams and connect Telegram via **Connect Telegram**

## Product flow

| Channel | Role |
|---------|------|
| **Website** | Control center — sign in, manage subscriptions, view notification history |
| **Telegram** | Delivery channel — instant alerts when official updates are detected |

When the crawler detects a new official event, it creates `Notification` rows for matching subscriptions. The worker sends Telegram messages; the dashboard **My Notifications** section shows the same history even if Telegram is down.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/README.md](./docs/README.md) | Documentation index |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [docs/DOMAIN.md](./docs/DOMAIN.md) | Domain model and business rules |
| [docs/DATABASE.md](./docs/DATABASE.md) | Database schema reference |
| [docs/ERD.md](./docs/ERD.md) | Entity relationship diagram |
| [design.md](./design.md) | Brand, UI, and copy guidelines |
| [adr/README.md](./adr/README.md) | Architecture decision records |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps via Turbo |
| `npm run build` | Build all workspaces |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run bot` | Run Telegram bot |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:validate` | Validate Prisma schema |

## License

Private — all rights reserved.
