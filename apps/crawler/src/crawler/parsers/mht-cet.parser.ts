import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { shouldIncludeMhtCetAnnouncement } from "./mht-cet/scope-filter.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://cetcell.mahacet.org/";

const MARQUEE_SELECTOR =
  "ul.educms-download-content-items-horizontal li a[href]";

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return undefined;
  }
}

/**
 * Parser for MHT CET (engineering PCM scope) on cetcell.mahacet.org homepage marquee.
 */
export class MhtCetParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const events: ParsedEvent[] = [];
      const seenUrls = new Set<string>();

      $(MARQUEE_SELECTOR).each((_, element) => {
        const anchor = $(element);
        const href = anchor.attr("href");
        const title = normalizeText(anchor.text());

        if (!href || !title) {
          return;
        }

        if (
          !shouldIncludeMhtCetAnnouncement(title) ||
          !shouldIncludeCycleAnnouncement(title)
        ) {
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

      return events;
    } catch {
      return [];
    }
  }
}
