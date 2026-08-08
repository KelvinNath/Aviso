# VITEEE — Crawl Audit

Official source for AvisoMe VITEEE notifications.

## Official URL

```
https://viteee.vit.ac.in/
```

## Render type

**Static server-rendered HTML.** Plain `fetch()` is sufficient.

## Where announcements live

| Region | Content |
|--------|---------|
| `.marquee-text mark` | Public notices, mock test links, application guidance |
| `#important-dates .steps-item` | Application deadline, exam dates, results, counselling |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/viteee.parser.ts`](../../apps/crawler/src/crawler/parsers/viteee.parser.ts)

| Field | Rule |
|-------|------|
| Marquee | Text from each `mark`; first nested `a[href]` as `sourceUrl`, else `#notice-{slug}` |
| Important dates | `{label} ({date})` from `h5` + `p.mb-0`; `sourceUrl` = `#important-dates-{n}` |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` |
| **EventType** | Shared `classifyAnnouncementTitle()` |

## Known limitations

- Marquee may repeat items; deduped by `sourceUrl` within a crawl.
- Mock test links point to external Digialm URLs — used as `sourceUrl`.

## Activation checklist

1. Parser tests pass
2. `Exam.status = ACTIVE` and `ExamSource.isActive = true` in seed
3. Manual crawl: ~7–10 events (marquee + important dates)
