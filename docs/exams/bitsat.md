# BITSAT — Crawl Audit

Official source for AvisoMe BITSAT notifications.

## Official URL

```
https://www.bitsadmission.com/BITSAT_LP/index.html
```

The root `bitsadmission.com` homepage mixes MBA, PhD, and FD programmes. The BITSAT LP page is the engineering entrance source.

## Render type

**Static server-rendered HTML.** Plain `fetch()` is sufficient.

## Where announcements live

| Region | Content |
|--------|---------|
| `.notice-bar-container .notice-text` | Fraud warning (duplicated in scrolling marquee) |
| `#timeline .timeline-card` | Application open, deadline, edit window, exam sessions |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/bitsat.parser.ts`](../../apps/crawler/src/crawler/parsers/bitsat.parser.ts)

| Field | Rule |
|-------|------|
| Notice bar | Normalized text; first link or `#notice-{slug}` |
| Timeline | `BITSAT 2026 — {heading} ({date})` from `h4.m-text` + `.timeline-date` |
| **Dedupe** | Identical notice-bar text collapsed; unique `sourceUrl` per event |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` (timeline titles include 2026) |
| **EventType** | Shared `classifyAnnouncementTitle()` on heading + description |

## Known limitations

- Live notice bar content is mostly static fraud advisory — timeline provides stable deadline/exam events.
- Apply button may link to external Digialm portal; not parsed separately.

## Activation checklist

1. Parser tests pass
2. Seed URL updated to BITSAT LP; `ACTIVE` + `isActive = true`
3. Manual crawl: ~7 events (1 notice + 6 timeline cards)
