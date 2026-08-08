# MHT CET — Crawl Audit

Official source for AvisoMe MHT CET (engineering PCM) notifications.

## Official URL

```
https://cetcell.mahacet.org/
```

## Render type

**Static server-rendered HTML** (WordPress + Elementor). Homepage marquee content is present in the initial HTML response.

## Where announcements live

Horizontal announcement marquee:

```html
<ul class="educms-download-content-items-horizontal">
  <li><a href="...pdf">Notice title</a></li>
</ul>
```

The marquee mixes many CET types (MBA, LLB, MHT-CET, etc.). AvisoMe scopes to **engineering PCM aspirants**.

## Parser strategy

Implementation: [`apps/crawler/src/crawler/parsers/mht-cet.parser.ts`](../../apps/crawler/src/crawler/parsers/mht-cet.parser.ts)

Scope filter: [`mht-cet/scope-filter.ts`](../../apps/crawler/src/crawler/parsers/mht-cet/scope-filter.ts)

| Step | Rule |
|------|------|
| Extract | `ul.educms-download-content-items-horizontal li a[href]` |
| **Include** | Title matches MHT-CET, PCM, engineering, technical-education CAP |
| **Exclude** | MBA/MMS, LLB, NEET, DCET, MCA, pharmacy, law |
| **Cycle filter** | Shared `shouldIncludeCycleAnnouncement()` |
| **Dedupe** | By `sourceUrl` (marquee repeats items across cloned `ul` elements) |

## Known limitations

- PCB/medical MHT-CET notices mentioning PCM eligibility are included when title references MHT-CET.
- CAP schedules for non-engineering courses are excluded by scope filter.
- Deeper CET-specific pages are not crawled in v1.

## Activation checklist

1. Parser + scope filter tests pass
2. `Exam.status = ACTIVE` and `ExamSource.isActive = true` in seed
3. Manual crawl: ~3–6 engineering-scoped marquee items
