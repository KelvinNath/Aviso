# WBJEE — Crawl Audit

Official source for AvisoMe WBJEE notifications.

## Official URL

```
https://wbjeeb.nic.in/wbjee/
```

## Render type

**Static server-rendered HTML.** Plain `fetch()` is sufficient.

## Where announcements live

| Region | Content |
|--------|---------|
| Current Events | PDF notices in `.gen-list` (counselling, bulletin, press release) |
| News & Events | Extended list of PDF notices |
| Important Links | External registration / counselling portals |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/wbjee.parser.ts`](../../apps/crawler/src/crawler/parsers/wbjee.parser.ts)

| Field | Rule |
|-------|------|
| Lists | `.gen-list ul li a[href]` and `.newsticker ul.slides li a[href]` |
| **sourceUrl** | Resolved PDF or portal href |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` — title must mention 2026 |
| **EventType** | Shared `classifyAnnouncementTitle()` |
| **Dedup** | By `sourceUrl` across duplicated list sections |

## Known limitations

- Pharmacy-only notices share the same homepage; no scope filter in v1.
- Inline body text dates (exam date, registration window) are not parsed separately from PDF list items.

## Activation checklist

1. Parser tests pass (`wbjee.parser.test.ts`)
2. `Exam.status = ACTIVE` and source URL + `isActive = true` in seed
3. Manual crawl: parsed count reasonable (~15–25 unique PDF/portal links for 2026)
