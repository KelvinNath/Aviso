# Domain Model

Business entities, enums, and rules for the Aviso exam notification platform.

## Core concepts

### Exam

An entrance exam Aviso monitors (e.g. JEE Main). Has one or more **ExamSource** URLs to crawl.

### ExamSource

A crawlable official URL tied to an exam. The crawler fetches active sources and parses new announcements.

### Event

A detected official update — result declared, admit card released, application deadline, etc. Identified by a unique **fingerprint** to prevent duplicates.

### User

A student account. Created via Google OAuth on first sign-in. May link a Telegram account for delivery.

### Subscription

Links a user to an exam with selected **event types**. One active subscription per user per exam.

### Notification

A queued alert connecting an **Event** to a **Subscription**. Tracks delivery status to Telegram.

### ExamCycle

Tracks the current admissions cycle for an exam (e.g. JEE Advanced 2026). Milestone dates come from seed data and are refreshed from ingested events after each crawl. When the cycle reaches `COMPLETE`, notifications stop and the exam is hidden from new subscriptions — without archiving the exam record itself.

## Enums

### ExamStatus

| Value | Meaning |
|-------|---------|
| `ACTIVE` | Exam is monitored and available for subscription |
| `ARCHIVED` | No longer actively monitored (manual, e.g. blocked crawler) |

### ExamCyclePhase

| Value | Meaning |
|-------|---------|
| `REGISTRATION` | Before registration closes |
| `PRE_EXAM` | After registration closes, before exam day |
| `POST_EXAM` | After exam day, before counselling ends |
| `COUNSELLING` | Reserved for future counselling-specific rules |
| `COMPLETE` | Cycle over; no new notifications or subscriptions for this year |

`COMPLETE` is not the same as `ExamStatus.ARCHIVED`. An exam can stay `ACTIVE` across years while each year's `ExamCycle` row moves to `COMPLETE`.

### EventType

| Value | User-facing label |
|-------|-------------------|
| `RESULT` | Results |
| `ADMIT_CARD_RELEASED` | Admit Cards |
| `ANSWER_KEY` | Answer Keys |
| `EXAM_DATE` | Exam Dates |
| `APPLICATION_OPEN` | Application Open |
| `APPLICATION_CLOSE` | Application Deadlines |
| `COUNSELLING_OPEN` | Counselling Open |
| `COUNSELLING_CLOSE` | Counselling Close |

Web UI labels live in `apps/web/src/lib/event-types.ts`.

### SubscriptionStatus

| Value | Meaning |
|-------|---------|
| `ACTIVE` | User receives notifications for this exam |
| `CANCELLED` | Soft-deleted; no new notifications |

### NotificationStatus

| Value | Meaning |
|-------|---------|
| `PENDING` | Queued, not yet sent |
| `DELIVERED` | Successfully sent via Telegram |
| `FAILED` | Delivery failed (e.g. no `telegramChatId`, Telegram API error) |

### NotificationChannel

Currently only `TELEGRAM`. Stored on `User.preferredChannel`.

## Business rules

### Exam detection

- Each event has a unique `fingerprint` — duplicate detections are ignored.
- Events are tied to an exam and the source that produced them.
- On first crawl, all visible announcements on a source page may be ingested. Use `shouldIngestAnnouncement()` (in `parsers/shared/`) when enabling new exams to limit historical floods.

### Exam lifecycle (seed + cycle)

| Status | Crawled? | Subscribable? |
|--------|----------|---------------|
| `ACTIVE` + source `isActive` + cycle not `COMPLETE` | Yes | Yes |
| `ACTIVE` + cycle `COMPLETE` for current year | Yes (ingest only) | No |
| `ARCHIVED` or source inactive | No | No |

After each scheduled crawl, the crawler refreshes milestone dates from events and recomputes `ExamCycle.phase`. When counselling closes (or 90 days after exam day if counselling is unknown), the cycle becomes `COMPLETE`.

Seed includes 11 engineering exams. **JEE Main**, **JEE Advanced**, **BITSAT**, **VITEEE**, **COMEDK UGET**, **MHT CET**, **WBJEE**, **KCET**, **MET**, and **SRMJEEE** are ACTIVE. **KIITEE** stays ARCHIVED until live fetch bypasses Cloudflare (parser + fixture tests are ready).

Seeded slugs: `jee-main`, `jee-advanced`, `bitsat`, `viteee`, `comedk-uget`, `mht-cet`, `wbjee`, `kcet`, `met`, `srmjeee`, `kiitee`.

### Notification creation

When a new event is stored:

1. Find all `ACTIVE` subscriptions for that `examId`.
2. Filter subscriptions whose `eventTypes` array includes the event's `type`.
3. Create one `Notification` per subscription (`skipDuplicates` on `[eventId, subscriptionId]`).

### Notification delivery

- Worker processes `PENDING` notifications.
- Requires `user.telegramChatId` on the subscription's user.
- On success: `DELIVERED` + `deliveredAt`.
- On failure: `FAILED` + `attemptedAt` + `failureReason`.

### Subscriptions

- A user may subscribe to multiple exams.
- At most one subscription per `(userId, examId)` pair.
- Cancelling sets status to `CANCELLED` (not hard delete).
- Re-subscribing to a cancelled exam upserts the same row and sets status back to `ACTIVE` with updated `eventTypes`.
- Event type preferences can be updated via PATCH without cancelling.

### Telegram linking

- Google-authenticated users connect Telegram via one-time deep link codes.
- `linkCode` is 6 characters, expires in 10 minutes, cleared after successful link.
- Linking sets `telegramChatId`, `telegramUserId`, `telegramUsername` on the existing Google user.
- Does **not** create a separate `telegram+...@aviso.local` user when linking from the web flow.

### Dashboard notification history

- Shows notifications for the logged-in user's active subscriptions at `/dashboard/notifications`.
- Same records as the Telegram pipeline — not a separate inbox.
- **Actionable filter:** events with a past `effectiveDate` are hidden; result/answer-key events use freshness rules instead.
- Filterable by exam slug and event type; paginated.

## User journeys

### New student

1. Land on marketing site → sign in with Google
2. Track wizard at `/dashboard/track`: pick exam → choose event types → save
3. Connect Telegram on dashboard (optional but required for Telegram delivery)
4. Receive alerts on Telegram; browse actionable history at `/dashboard/notifications`

### Returning student

1. Sign in → dashboard control panel
2. Edit tracking preferences via modal, stop/re-add exams, connect Telegram
3. Browse **My Notifications** at `/dashboard/notifications` with filters

### Bot-only user (legacy path)

Users who `/start` the bot without a web account get a Telegram-only user record via `upsertTelegramUser()`. Web linking merges Telegram onto the Google account instead.
