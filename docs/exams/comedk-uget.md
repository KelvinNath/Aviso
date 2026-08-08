# COMEDK UGET — Crawl Audit

Official source for AvisoMe COMEDK UGET notifications.

## Official URL

```
https://www.comedk.org/about-uget-and-notification-2026
```

The `/UGET` landing page is mostly navigation. The authoritative 2026 cycle content lives on the notification page above.

## Render type

**Static server-rendered HTML.** Plain `fetch()` is sufficient.

## Where announcements live

| Region | Content |
|--------|---------|
| Top buttons | Brochure and quick guide PDFs |
| Notification tab | Bullet list with PDF links (exam date notification, etc.) |
| Calendar of Events table | Date / day / event rows for the 2026 cycle |
| Counselling page | Separate URL (`counselling-document-2026`) — not crawled in v1 |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/comedk-uget.parser.ts`](../../apps/crawler/src/crawler/parsers/comedk-uget.parser.ts)

| Field | Rule |
|-------|------|
| Brochures | `.button-3a[href*=".pdf"]` — title from link text |
| Notifications | `h3` containing "Notification" → following `ul li` items |
| Calendar | `h3` containing "Calendar of Events" → next `table.table-4` rows (skip header) |
| **sourceUrl** | PDF href for links; `#calendar-{slug}` or `#notification-{slug}` on notification page for table/list items |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` — title must mention 2026 or have recent `publishedAt` |
| **EventType** | Shared `classifyAnnouncementTitle()` |

Exam centres table rows are excluded (first column is "State", not a date).

## Known limitations

- Counselling updates on a separate page are not ingested until a second source is added.
- Calendar rows without explicit 2026 in the title still pass the cycle filter when the date cell contains 2026 cycle dates and event text references the current cycle.

## Activation checklist

1. Parser tests pass (`comedk-uget.parser.test.ts`)
2. `Exam.status = ACTIVE` and source URL + `isActive = true` in seed
3. Manual crawl: parsed count reasonable (~15–25 events from calendar + brochures + notifications)
