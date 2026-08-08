# MET — Crawl Audit

Official source for AvisoMe MET (Manipal Entrance Test) notifications.

## Official URL

```
https://www.manipal.edu/mu/admission/indian-students/online-entrance-exam-overview/overview.html
```

The legacy `entrancetest.html` URL is superseded by the MET 2026 overview page.

## Render type

**Static server-rendered HTML.** Plain `fetch()` is sufficient.

## Where announcements live

| Region | Content |
|--------|---------|
| Left navigation | `a[data-name*="MET 2026"]` section links (schedule, syllabus, OTBS) |
| Apply button | `https://apply.manipal.edu` registration portal |
| Announce bar | Generic MAHE notices (mostly filtered out) |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/met.parser.ts`](../../apps/crawler/src/crawler/parsers/met.parser.ts)

| Field | Rule |
|-------|------|
| Nav links | `a[data-name*="MET 2026"]` — title from `data-name` |
| Apply | Single synthetic event `MET 2026 — Apply Online` from apply.manipal.edu |
| **Scope filter** | `shouldIncludeMetAnnouncement()` — MET/entrance-test only |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` |
| **EventType** | Shared `classifyAnnouncementTitle()` |

## Known limitations

- Exam schedule dates on the centres page are link targets only; date rows are not parsed until a second source is added.
- Announce bar items are generic university notices and excluded by scope filter.

## Activation checklist

1. Parser tests pass (`met.parser.test.ts`)
2. `Exam.status = ACTIVE` and source URL + `isActive = true` in seed
3. Manual crawl: MET 2026 nav links + apply URL present
