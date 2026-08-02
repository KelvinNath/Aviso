# Database Design

PostgreSQL database managed by Prisma. Schema: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Overview

| Model | Purpose |
|-------|---------|
| `Exam` | Exam being monitored |
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
| `effectiveDate` | `DateTime?` | Relevant date (deadline, exam date) |

**Unique:** `fingerprint`  
**Index:** `(examId, createdAt)`

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

Default local connection (from `.env.example`):

```
postgresql://aviso:aviso_dev_password@localhost:5432/aviso
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
  INCLUDE event.exam
  ORDER BY createdAt DESC
```

Implemented in `apps/web/src/services/notification.service.ts`.

### Subscriptions for an event

```
Subscription
  WHERE examId = event.examId
    AND status = ACTIVE
    AND eventTypes HAS event.type
```

Implemented in `apps/crawler/src/services/notification.service.ts`.
