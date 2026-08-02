# Architecture Decision Records

Architecture Decision Records (ADRs) document significant technical decisions, their context, and consequences.

## Format

When adding an ADR, create a numbered file:

```
adr/0001-short-title.md
```

Each ADR should include:

1. **Title** — short descriptive name
2. **Status** — Proposed | Accepted | Deprecated | Superseded
3. **Context** — what problem or choice prompted the decision
4. **Decision** — what was chosen
5. **Consequences** — trade-offs, follow-ups

## Index

| ADR | Title | Status |
|-----|-------|--------|
| — | *No ADRs recorded yet* | — |

## Decisions captured elsewhere

Until formal ADRs are written, these decisions are documented in [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Monorepo with npm workspaces + Turbo** — separate `web` and `crawler` apps, shared Prisma schema
- **JWT sessions (Auth.js)** — no database session table; user synced via jwt callback
- **Edge-safe middleware** — `authConfig` separate from `auth.ts` to avoid Prisma in middleware
- **Telegram as delivery, web as control center** — same `Notification` rows power both channels
- **Soft-delete subscriptions** — `CANCELLED` status instead of hard delete
- **Event fingerprint deduplication** — unique constraint prevents duplicate crawled events
- **Root `.env`** — single env file loaded by web (`next.config.ts`) and crawler (`dotenv`)

## When to add an ADR

- Choosing a new external service or replacing one
- Changing auth strategy, database, or notification delivery model
- Introducing a shared package or breaking API contract
- Security or compliance decisions with long-term impact
