# SRMJEEE — Crawl Audit

Official source for AvisoMe SRMJEEE notifications.

## Official URL

```
https://applications.srmist.edu.in/btech
```

The generic `srmist.edu.in` admissions page returns 403 to crawlers; the B.Tech application portal above is used instead.

## Render type

**Static server-rendered HTML.** Plain `fetch()` is sufficient.

## Where announcements live

| Region | Content |
|--------|---------|
| `table.entranceEx_table` | Phase-wise exam dates and application deadlines |
| Tab content | PDF links (eligibility, syllabus, exam pattern, FAQs) |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/srmjeee.parser.ts`](../../apps/crawler/src/crawler/parsers/srmjeee.parser.ts)

| Field | Rule |
|-------|------|
| Timeline | Parse phase headers (Phase 1–3) from row 3–4 of entrance exam table |
| Titles | `SRMJEEE 2026 — {Phase} — {label} ({date})` |
| PDFs | `a[href*=".pdf"]` — prefix with `SRMJEEE 2026` when year missing |
| **sourceUrl** | PDF href or `#timeline-{phase}-{exam\|deadline}` anchors on portal |
| **Cycle filter** | Applied to PDF titles after prefixing |
| **EventType** | Shared `classifyAnnouncementTitle()` |

## Known limitations

- Eligibility/syllabus PDFs without “2026” rely on title prefix for cycle filter.
- Campus-wise programme tables and ranking sections are ignored.

## Activation checklist

1. Parser tests pass (`srmjeee.parser.test.ts`)
2. `Exam.status = ACTIVE` and source URL + `isActive = true` in seed
3. Manual crawl: 6 timeline events + FAQ PDF for 2026 cycle
