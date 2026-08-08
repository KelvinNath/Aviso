import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://kiitee.kiit.ac.in/";

const LINK_SELECTORS = [
  ".notice-board a[href]",
  ".news-notice a[href]",
  "a[href*='kiitee']",
] as const;

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return undefined;
  }
}

/**
 * Parser for KIITEE official portal (kiitee.kiit.ac.in).
 * Live fetch is often blocked by Cloudflare; fixture-based tests validate structure.
 */
export class KiiteeParser implements Parser {
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

          if (!shouldIncludeCycleAnnouncement(title)) {
            return;
          }

          const sourceUrl = resolveUrl(href);

          if (!sourceUrl || seenUrls.has(sourceUrl)) {
            return;
          }

          seenUrls.add(sourceUrl);

          events.push({
            type: classifyAnnouncementTitle(title),
            title,
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
