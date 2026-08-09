# Architecture

Aviso is a monorepo with two runtime applications sharing a PostgreSQL database via Prisma.

## High-level diagram

```mermaid
flowchart TB
    subgraph sources [Official Sources]
        Portals[JEE / BITSAT / COMEDK / state CET portals]
    end

    subgraph crawler [apps/crawler]
        Scheduler[Scheduler cron]
        Crawler[Crawler service]
        Parsers[Per-exam parsers]
        CycleSvc[exam-cycle.service]
        NotifSvc[notification.service]
        Worker[notification.worker]
        Bot[Telegram bot]
    end

    subgraph db [PostgreSQL]
        Events[(Event)]
        Cycles[(ExamCycle)]
        Notifs[(Notification)]
        Subs[(Subscription)]
        Users[(User)]
    end

    subgraph web [apps/web]
        Next[Next.js App Router]
        Auth[Auth.js Google OAuth]
        Dash[Dashboard]
        Track[Track wizard]
        Inbox[Notifications inbox]
        API[API routes]
    end

    subgraph delivery [Delivery]
        TG[Telegram API]
        Browser[Student browser]
    end

    Portals --> Crawler
    Scheduler --> Crawler
    Scheduler --> Worker
    Crawler --> Parsers
    Parsers --> Events
    Crawler --> CycleSvc
    CycleSvc --> Cycles
    Crawler --> NotifSvc
    NotifSvc --> Notifs
    Worker --> Notifs
    Worker --> TG

    Browser --> Next
    Next --> Auth
    Auth --> Users
    Dash --> API
    Track --> API
    Inbox --> API
    API --> Subs
    API --> Notifs
    API --> Users
    Bot --> Users
    Bot --> TG
```

## Responsibilities

### Website (`apps/web`)

| Concern | Implementation |
|---------|----------------|
| Auth | Auth.js v5, Google OAuth, JWT sessions |
| User sync | `findOrCreateUser()` on sign-in (jwt callback) |
| Subscriptions | CRUD via `/api/subscriptions`; PATCH for event type updates |
| Tracking wizard | `/dashboard/track` — pick exam, choose event types, save |
| Edit preferences | Modal on dashboard subscription cards |
| Telegram linking | `/api/me/telegram-link` + bot `/start CODE` deep links |
| Actionable inbox | `/dashboard/notifications` + `/api/me/notifications` |
| Middleware | Edge-safe `authConfig` — protects `/dashboard/*` |

**Service layer:** `apps/web/src/services/` — Prisma + business logic used by Server Components and API routes.

### Crawler (`apps/crawler`)

| Concern | Implementation |
|---------|----------------|
| Crawling | `crawler.service.ts` — fetch sources, parse, dedupe by fingerprint |
| Parsing | `parser.factory.ts` — per-exam parsers; shared utils in `parsers/shared/` |
| Exam cycles | `exam-cycle.service.ts` — refresh milestone dates, compute phase |
| Notification queue | `notification.service.ts` — `createNotificationsForEvent()` |
| Delivery | `notification.worker.ts` — sends Telegram using `exam.name` from event |
| Scheduling | `scheduler.ts` — cron for crawl + worker; per-exam summary log |
| Bot | `telegram-bot.service.ts` — `/exams`, `/subscribe <slug>`, `/unsubscribe <slug>` |

## Notification pipeline

1. Crawler detects a new `Event` (unique `fingerprint`) with optional `effectiveDate`.
2. `createNotificationsForEvent()` finds active `Subscription` rows where `eventTypes` includes the event type and the exam cycle is not `COMPLETE`.
3. One `Notification` row per matching subscription (`PENDING`).
4. Worker sends Telegram message to `user.telegramChatId` using exam-agnostic formatting (`Exam.name` + event type), sets `DELIVERED` or `FAILED`.
5. Dashboard inbox reads the same `Notification` → `Event` → `Exam` chain, hiding stale events once `effectiveDate` has passed.

Telegram is the delivery channel. The dashboard is the permanent, actionable history.

## Authentication

- **Provider:** Google OAuth
- **Session:** JWT (not database sessions)
- **Middleware:** Uses `authConfig` only (no Prisma on Edge)
- **DB user ID:** Set in `jwt` callback via `findOrCreateUser()` on first sign-in

Required env: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`.

## Telegram account linking

1. Authenticated user clicks **Connect Telegram** on dashboard.
2. Web generates a 6-character `linkCode` (10-minute TTL) on `User`.
3. Deep link opens `https://t.me/{bot}?start={code}`.
4. Bot calls `linkTelegramAccountWithCode()` — attaches `telegramChatId` to the Google user, clears code.

## API routes (web)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/*` | * | — | Auth.js handlers |
| `/api/exams` | GET | — | List active exams |
| `/api/events` | GET | — | List events (unfiltered) |
| `/api/subscriptions` | GET, POST | Yes | User subscriptions (POST upserts / reactivates) |
| `/api/subscriptions/[id]` | PATCH, DELETE | Yes | Update event types or cancel subscription |
| `/api/me` | GET | Yes | Current user profile |
| `/api/me/telegram-link` | POST | Yes | Generate link code + deep link |
| `/api/me/notifications` | GET | Yes | Paginated actionable notification history |

## Dashboard routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Control panel — Telegram card, tracking settings list |
| `/dashboard/track` | 2-step wizard: exam → event types → save |
| `/dashboard/notifications` | Actionable inbox with filters |
| `/dashboard/onboarding` | Redirects to `/dashboard/track` |

First-time users with no subscriptions are redirected to `/dashboard/track` from dashboard and notifications pages.

## Tech stack

| Layer | Technology |
|-------|------------|
| Web | Next.js 15, React 19, Tailwind v4, Framer Motion, Auth.js |
| Crawler | Node.js, tsx, cheerio, node-cron |
| Database | PostgreSQL 16, Prisma 6 |
| Monorepo | npm workspaces, Turbo |
| Bot | Telegram Bot API (long polling) |

## What not to duplicate

- **Landing exam data** — static in `landing-data.ts` (marketing; 10 live exams)
- **Dashboard exams** — from database via `getActiveExams()`
- **Event type labels** — `apps/web/src/lib/event-types.ts` (web); crawler formatter uses generic `EventType` headings

## Multi-exam platform

- **Parser factory** — `getParser(examSlug)` maps slugs to exam-specific parsers.
- **Shared utilities** — `parsers/shared/` holds title normalization, announcement classification, anchor extraction, `infer-effective-date`, and `shouldIngestAnnouncement()`.
- **Exam activation** — seed includes 11 engineering exams; 10 are `ACTIVE` with live parsers. KIITEE stays `ARCHIVED` until Cloudflare bypass is solved.
- **Exam cycles** — `ExamCycle` tracks phase and milestone dates; `COMPLETE` blocks new subscriptions and notifications for that year.
- **Telegram bot** — subscribe/unsubscribe by exam slug; `/exams` lists ACTIVE exams from the database.
- **Subscription reactivation** — creating a subscription for a previously cancelled exam upserts and sets status back to `ACTIVE`.

Future: extract more shared types/utils into `packages/` when drift becomes a problem.
