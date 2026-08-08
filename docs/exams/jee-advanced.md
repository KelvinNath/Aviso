# JEE Advanced — Crawl Audit

Official source for AvisoMe JEE Advanced notifications.

## Official URL

```
https://jeeadv.ac.in/
```

Administered by IITs (organizing institute rotates yearly). This is the authoritative JEE Advanced portal — not third-party aggregators.

## Render type

**Static server-rendered HTML.** A plain `fetch()` is sufficient. The navbar is loaded via client-side `fetch('navbar.html')`, but announcement content is present in the initial HTML response.

## Where announcements live

Section `#announcements` → **Important Announcements**

Each announcement is a block:

```html
<div class="display-6 fs-6 text-start border rounded-1 border-success mt-3 p-2">
  <h4 class="announcement__head">Title here</h4>
  <div class="announcement__text">...</div>
  <span>[ Posted on Month DD, YYYY, HH:MM IST ]</span>
</div>
```

This is **block-based**, not an anchor list like JEE Main (`jeemain.nta.nic.in`).

## Parser strategy

| Field | Rule |
|-------|------|
| **Selector** | `#announcements div.border.rounded-1` |
| **Title** | Text of `h4.announcement__head` (strip nested `img`) |
| **sourceUrl** | First `a[href]` in block, resolved against `https://jeeadv.ac.in/`; fallback `#announcement-{slugified-title}` on same origin |
| **summary** | Plain text from `.announcement__text`, truncated to ~200 chars |
| **publishedAt** | Parsed from `[ Posted on Month DD, YYYY, HH:MM IST ]` |
| **EventType** | Shared `classifyAnnouncementTitle()` keyword rules |

Implementation: [`apps/crawler/src/crawler/parsers/jee-advanced.parser.ts`](../../apps/crawler/src/crawler/parsers/jee-advanced.parser.ts)

## Deduplication

AvisoMe fingerprint: `SHA256(examId + title + sourceUrl)`.

Duplicate titles can appear (e.g. two "JEE (Advanced) 2026 Results" blocks with different links). Using the **first link per block** as `sourceUrl` keeps identities stable and distinct.

The parser also dedupes by `sourceUrl` within a single crawl pass.

## First-run / cycle filter

The homepage currently lists ~33 announcements spanning multiple months. To avoid flooding the database on activation:

Include an announcement only if **either**:

1. Title contains the current exam cycle year (`2026`), **or**
2. `publishedAt` is within the last 12 months

Skip blocks with empty titles.

Filter: [`apps/crawler/src/crawler/parsers/jee-advanced/cycle-filter.ts`](../../apps/crawler/src/crawler/parsers/jee-advanced/cycle-filter.ts)

Update `EXAM_CYCLE_YEAR` at the start of each admissions cycle.

## Event type mapping

Uses shared `EventType` enum — no JEE Advanced-specific types.

| Example title | EventType |
|---------------|-----------|
| JEE (Advanced) 2026 Results | `RESULT` |
| Admit Card for JEE(Advanced) 2026 | `ADMIT_CARD_RELEASED` |
| Provisional / Final Answer Keys | `ANSWER_KEY` |
| Registration for JEE (Advanced) | `APPLICATION_OPEN` |
| Registration closes / last date | `APPLICATION_CLOSE` |
| Round N Allotment for JoSAA | `COUNSELLING_OPEN` |
| Withdrawal from JoSAA | `COUNSELLING_CLOSE` |

JoSAA round notices are in scope for JEE Advanced aspirants (post-exam counselling).

## Known limitations

- **Navbar** is JS-loaded — not used for announcements.
- **External links** (JoSAA portal, candidate portal) are used as `sourceUrl` when they are the first link in a block.
- **AAT (Architecture)** notices are included — relevant to a subset of JEE Advanced qualifiers; classified via shared keywords.
- Site redesign may break selectors — fixture tests in `jee-advanced.parser.test.ts` guard regressions.

## Activation checklist

1. Parser implemented and tests pass
2. `Exam.status = ACTIVE` and `ExamSource.isActive = true` in seed
3. Manual crawl: parsed count reasonable, no duplicate fingerprints
4. End-to-end: new event → subscription → Telegram (use `/test` for format check)
