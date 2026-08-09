# Database Design

PostgreSQL database managed by Prisma. Schema: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Overview

| Model | Purpose |
|-------|---------|
| `Exam` | Exam being monitored |
| `ExamCycle` | Admissions cycle phase and milestone dates per exam/year |
| `ExamSource` | Crawlable URL for an exam |
| `Event` | Detected official announcement |
| `User` | Student account (Google + optional Telegram) |
| `Subscription` | User ↔ exam + event type preferences |
| `Notification` | Event delivery queue item per subscription |

## Models

### Exam

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | cuid |
| `name` | `String` | Display name (e.g. "JEE Main") |
| `slug` | `String` | Unique URL key |
| `status` | `ExamStatus` | `ACTIVE` or `ARCHIVED` |

### ExamCycle

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | cuid |
| `examId` | `String` | FK → Exam |
| `cycleYear` | `Int` | Admissions year (e.g. 2026) |
| `phase` | `ExamCyclePhase` | Current cycle phase |
| `registrationClose` | `DateTime?` | Last registration day |
| `examDate` | `DateTime?` | Primary exam day |
| `counsellingClose` | `DateTime?` | Last counselling day |
| `completedAt` | `DateTime?` | Set when phase becomes `COMPLETE` |

**Unique:** `(examId, cycleYear)`  
**Index:** `(examId, phase)`

Phases: `REGISTRATION` → `PRE_EXAM` → `POST_EXAM` → `COMPLETE`. When `phase` is `COMPLETE`, the exam stays `ACTIVE` but new subscriptions and notifications are blocked for that cycle year.

### ExamSource

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | cuid |
| `examId` | `String` | FK → Exam |
| `url` | `String` | Source URL |
| `label` | `String` | Human label |
| `isActive` | `Boolean` | Whether crawler fetches this source |

**Index:** `examId`

### Event

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | cuid |
| `examId` | `String` | FK → Exam |
| `examSourceId` | `String` | FK → ExamSource |
| `type` | `EventType` | Category of update |
| `title` | `String` | Headline |
| `summary` | `String` | Body text |
| `sourceUrl` | `String` | Link to official notice |
| `fingerprint` | `String` | Unique dedupe key |
| `publishedAt` | `DateTime?` | Official publish date if known |
| `detectedAt` | `DateTime` | When crawler found it |
| `effectiveDate` | `DateTime?` | Last day the event stays actionable (deadline, exam day, window end) |
| `notifyPolicy` | `NotifyPolicy` | `ALERT` (notify/display) or `REFERENCE` (ingest only) |

**Unique:** `fingerprint`  
**Index:** `(examId, createdAt)`

`effectiveDate` is the last calendar day an event stays actionable for notify/display. Parsers set it from deadlines, exam days, or registration windows; the crawler and dashboard hide events once `effectiveDate` is in the past. `RESULT` and `ANSWER_KEY` events usually omit it and rely on `publishedAt` freshness instead.

### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | cuid |
| `email` | `String` | Unique; from Google OAuth |
| `displayName` | `String?` | From Google profile |
| `avatarUrl` | `String?` | From Google profile |
| `telegramChatId` | `String?` | For Telegram delivery |
| `telegramUserId` | `String?` | Telegram user ID |
| `telegramUsername` | `String?` | @username for dashboard display |
| `linkCode` | `String?` | Unique; temporary deep-link code |
| `linkCodeExpiresAt` | `DateTime?` | 10-minute TTL |
| `preferredChannel` | `NotificationChannel` | Default `TELEGRAM` |

### Subscription

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | cuid |
| `userId` | `String` | FK → User |
| `examId` | `String` | FK → Exam |
| `eventTypes` | `EventType[]` | PostgreSQL array |
| `status` | `SubscriptionStatus` | `ACTIVE` or `CANCELLED` |

**Unique:** `(userId, examId)`  
**Index:** `(examId, status)`

### Notification

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | cuid |
| `eventId` | `String` | FK → Event |
| `subscriptionId` | `String` | FK → Subscription |
| `status` | `NotificationStatus` | `PENDING`, `DELIVERED`, `FAILED` |
| `attemptedAt` | `DateTime?` | Last delivery attempt |
| `deliveredAt` | `DateTime?` | Successful delivery time |
| `failureReason` | `String?` | Error message if failed |

**Unique:** `(eventId, subscriptionId)`  
**Index:** `(subscriptionId, createdAt)`

## Migrations

| Migration | Description |
|-----------|-------------|
| `20260802130500_redesign_user_model` | User model redesign |
| `20260802180000_add_telegram_link_fields` | `linkCode`, `linkCodeExpiresAt`, `telegramUserId`, `telegramUsername` |

Apply migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Create a new migration during development:

```bash
npx prisma migrate dev --name describe_change
```

## Connection

Default local connection (from `.env.example`). Host port **5433** avoids conflicting with other Postgres on 5432 (e.g. Onelot):

```
postgresql://aviso:aviso_dev_password@localhost:5433/aviso
```

Start Postgres:

```bash
docker compose up -d
```

Inspect data:

```bash
npx prisma studio
```

## Query patterns

### User's notifications (dashboard)

```
Notification
  WHERE subscription.userId = :userId
    AND subscription.status = ACTIVE
    AND (event.effectiveDate IS NULL OR event.effectiveDate >= now)
  INCLUDE event.exam
  ORDER BY createdAt DESC
```

Additional client-side filtering via `isActionableEvent()` for result/answer-key freshness. Implemented in `apps/web/src/services/notification.service.ts`.

### Subscription upsert (track wizard)

```
Subscription UPSERT ON (userId, examId)
  SET status = ACTIVE, eventTypes = :selected
```

Reactivates `CANCELLED` rows instead of failing on duplicate key. Implemented in `apps/web/src/services/subscription.service.ts`.

### Subscriptions for an event

```
Subscription
  WHERE examId = event.examId
    AND status = ACTIVE
    AND eventTypes HAS event.type
```

Implemented in `apps/crawler/src/services/notification.service.ts`.

## Seed data

Run:

```bash
npx tsx prisma/seed.ts
```

The seed upserts 11 engineering exams with official source URLs. Activation policy:

| Exam | Slug | Status | Source active |
|------|------|--------|---------------|
| JEE Main | `jee-main` | ACTIVE | yes |
| JEE Advanced | `jee-advanced` | ACTIVE | yes |
| BITSAT | `bitsat` | ACTIVE | yes |
| VITEEE | `viteee` | ACTIVE | yes |
| COMEDK UGET | `comedk-uget` | ACTIVE | yes |
| MHT CET | `mht-cet` | ACTIVE | yes |
| WBJEE | `wbjee` | ACTIVE | yes |
| KCET | `kcet` | ACTIVE | yes |
| MET | `met` | ACTIVE | yes |
| SRMJEEE | `srmjeee` | ACTIVE | yes |
| KIITEE | `kiitee` | ARCHIVED | no (Cloudflare blocks crawler fetch) |

Promote KIITEE when live fetch works and parser output is verified:

1. Set `Exam.status` to `ACTIVE`
2. Set `ExamSource.isActive` to `true`

No new migration required for multi-exam seeding.
