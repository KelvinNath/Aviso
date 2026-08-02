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

## Apps

### `@aviso/web`

Next.js 15 application:

- Marketing site (`/`, `/privacy`, `/terms`, `/design-system`)
- Google OAuth sign-in (`/signin`)
- Dashboard (`/dashboard`, `/dashboard/onboarding`)
- REST API under `/api/*`
- **My Notifications** — paginated notification history from the database

### `@aviso/crawler`

Node.js backend service:

- Crawls official exam sources (JEE parser)
- Creates `Event` records and queues `Notification` rows
- Scheduler runs crawl + notification worker on a cron
- Telegram bot — subscribe, status, deep-link account linking

## Packages (scaffolding)

The `packages/` workspace exists for future shared code:

- `@aviso/shared-types` — shared TypeScript types
- `@aviso/shared-utils` — shared utilities
- `@aviso/adapters` — external service adapters
- `@aviso/config` — shared configuration

These are currently empty stubs. Apps contain their own implementations until shared extraction is needed.

## Environment

All apps read from the **root `.env`**. See [`.env.example`](../.env.example) for required variables.

## Local development checklist

1. `docker compose up -d`
2. Configure `.env` (auth, Google OAuth, Telegram, database)
3. `npx prisma migrate deploy && npx prisma generate`
4. `npm run dev` (web) and `npm run bot` (Telegram)
5. Sign in → onboard → connect Telegram → verify notifications on dashboard
