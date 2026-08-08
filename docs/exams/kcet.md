# KCET (UGCET) — Crawl Audit

Official source for AvisoMe KCET / UGCET notifications.

## Official URL

```
https://cetonline.karnataka.gov.in/kea/
```

Previous seed URL (`cetonline.karnataka.gov.in/` root) redirects; the KEA landing page above is authoritative.

## Render type

**Static server-rendered HTML.** Plain `fetch()` is sufficient.

## Where announcements live

| Region | Content |
|--------|---------|
| `#section-admission` | UGCET / DCET / PGCET card link lists |
| `#section-common` | Quick-link list items (`.cl-item a`) |
| Quick Links column | UGCET 2026 portal link |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/kcet.parser.ts`](../../apps/crawler/src/crawler/parsers/kcet.parser.ts)

| Field | Rule |
|-------|------|
| Links | `#section-admission .card-link-list a`, UGCET hrefs, `.cl-item a` |
| **Scope filter** | `shouldIncludeKcetAnnouncement()` — UGCET/KCET/engineering only; excludes DCET, PGCET, NEET, recruitment |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` |
| **EventType** | Shared `classifyAnnouncementTitle()` |

## Known limitations

- UGNEET links on the same UGCET card pass scope filter when title mentions UGCET; NEET-only quick links are excluded.
- Detailed exam schedules on sub-portals (`/kea/ugcet2026`) are not crawled in v1.

## Activation checklist

1. Parser tests pass (`kcet.parser.test.ts`)
2. `Exam.status = ACTIVE` and source URL + `isActive = true` in seed
3. Manual crawl: UGCET application/option/enrolment links present; no DCET/PGCET noise
