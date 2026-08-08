# KIITEE — Crawl Audit

Official source for AvisoMe KIITEE notifications.

## Official URL

```
https://kiitee.kiit.ac.in/
```

## Render type

**Cloudflare-protected.** Plain `fetch()` from server/datacenter IPs returns a challenge page (~5 KB), not the real portal HTML.

## Where announcements live (expected)

| Region | Content |
|--------|---------|
| Notice board | Brochure, prospectus, apply-now links |
| Important dates | Registration and exam schedule pages |

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/kiitee.parser.ts`](../../apps/crawler/src/crawler/parsers/kiitee.parser.ts)

| Field | Rule |
|-------|------|
| Links | `.notice-board a`, `.news-notice a`, `a[href*='kiitee']` |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` |
| **EventType** | Shared `classifyAnnouncementTitle()` |
| **Fixture** | `kiitee-homepage.html` — handcrafted representative HTML until live fetch works |

## Known limitations

- **Not activated in seed** — crawler would ingest Cloudflare challenge HTML with zero useful events.
- Options to enable later: headless browser fetch, residential proxy, or alternate official URL if KIIT publishes one without CF.

## Activation checklist

1. Parser tests pass (`kiitee.parser.test.ts`) against fixture
2. Live fetch verified (non-challenge HTML)
3. Set `Exam.status = ACTIVE` and `ExamSource.isActive = true` in seed
