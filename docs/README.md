# Aviso Documentation

Technical and product documentation for the Aviso monorepo.

## Index

| Document | Contents |
|----------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Apps, services, data flow, auth, notifications |
| [DOMAIN.md](./DOMAIN.md) | Entities, enums, business rules |
| [DATABASE.md](./DATABASE.md) | Prisma models, indexes, migrations |
| [ERD.md](./ERD.md) | Visual entity relationship diagram |
| [../design.md](../design.md) | Brand personality, colors, typography, UI patterns |
| [../adr/README.md](../adr/README.md) | Architecture decision records |
| [exams/](./exams/) | Per-exam parser notes |

## Apps

### `@aviso/web`

Next.js 15 application:

- Marketing site (`/`, `/privacy`, `/terms`)
- Google OAuth sign-in (`/signin`)
- Dashboard control panel (`/dashboard`)
- Track wizard (`/dashboard/track`) — exam → event types → save
- Actionable notifications (`/dashboard/notifications`)
- Edit preferences modal on subscription cards
- REST API under `/api/*`

### `@aviso/crawler`

Node.js backend service:

- Crawls official exam sources via per-exam parsers (10 active exams)
- Creates `Event` records with `effectiveDate` and queues `Notification` rows
- Refreshes `ExamCycle` milestone dates after each crawl
- Scheduler runs crawl + notification worker on a cron
- Telegram bot — subscribe, status, deep-link account linking

## Packages

| Package | Status |
|---------|--------|
| `@aviso/shared-utils` | `event-relevance` helpers for actionable event filtering |
| `@aviso/shared-types` | Scaffolding |
| `@aviso/adapters` | Scaffolding |
| `@aviso/config` | Scaffolding |

Apps contain their own implementations until more shared extraction is needed.

## Environment

All apps read from the **root `.env`**. See [`.env.example`](../.env.example) for required variables.

## Local development checklist

1. `docker compose up -d`
2. Configure `.env` (auth, Google OAuth, Telegram, database)
3. `npx prisma migrate deploy && npx prisma generate`
4. `npm run dev` (web) and `npm run bot` (Telegram)
5. Sign in → track an exam at `/dashboard/track` → connect Telegram → verify notifications at `/dashboard/notifications`
