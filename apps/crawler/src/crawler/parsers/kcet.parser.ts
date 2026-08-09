import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { shouldIncludeKcetAnnouncement } from "./kcet/scope-filter.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement, getExamCycleYear } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://cetonline.karnataka.gov.in/kea/";

const LINK_SELECTORS = [
  "#section-admission .card-link-list a[href]",
  "#section-admission a[href*='/kea/ugcet']",
  "#section-quicklinks a[href*='ugcet']",
  ".cl-item a[href]",
] as const;

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return undefined;
  }
}

/**
 * Parser for KCET (UGCET) on the KEA cetonline portal.
 */
export class KcetParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const events: ParsedEvent[] = [];
      const seenUrls = new Set<string>();

      for (const selector of LINK_SELECTORS) {
        $(selector).each((_, element) => {
          const anchor = $(element);
          const href = anchor.attr("href");
          const title = normalizeText(anchor.text());

          if (!href || !title) {
            return;
          }

          if (!shouldIncludeKcetAnnouncement(title)) {
            return;
          }

          const cycleYear = getExamCycleYear();
          const displayTitle = title.includes(String(cycleYear))
            ? title
            : `KCET ${cycleYear} — ${title}`;

          if (!shouldIncludeCycleAnnouncement(displayTitle)) {
            return;
          }

          const sourceUrl = resolveUrl(href);

          if (!sourceUrl || seenUrls.has(sourceUrl)) {
            return;
          }

          seenUrls.add(sourceUrl);

          events.push({
            type: classifyAnnouncementTitle(displayTitle),
            title: displayTitle,
            summary: "",
            sourceUrl,
          });
        });
      }

      return events;
    } catch {
      return [];
    }
  }
}
