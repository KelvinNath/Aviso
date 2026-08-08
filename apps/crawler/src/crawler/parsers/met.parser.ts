import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { shouldIncludeMetAnnouncement } from "./met/scope-filter.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL =
  "https://www.manipal.edu/mu/admission/indian-students/online-entrance-exam-overview/overview.html";

const ANNOUNCE_SELECTORS = [".announce-bar-main a[href]"] as const;
const MET_NAV_SELECTOR = 'a[data-name*="MET 2026"]';

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return undefined;
  }
}

function pushEvent(
  events: ParsedEvent[],
  seenUrls: Set<string>,
  title: string,
  sourceUrl: string,
): void {
  if (
    !title ||
    !shouldIncludeMetAnnouncement(title) ||
    !shouldIncludeCycleAnnouncement(title)
  ) {
    return;
  }

  if (seenUrls.has(sourceUrl)) {
    return;
  }

  seenUrls.add(sourceUrl);

  events.push({
    type: classifyAnnouncementTitle(title),
    title,
    summary: "",
    sourceUrl,
  });
}

/**
 * Parser for MET (Manipal Entrance Test) overview and related links.
 */
export class MetParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const events: ParsedEvent[] = [];
      const seenUrls = new Set<string>();

      for (const selector of ANNOUNCE_SELECTORS) {
        $(selector).each((_, element) => {
          const anchor = $(element);
          const href = anchor.attr("href");
          const title = normalizeText(anchor.text());

          if (!href) {
            return;
          }

          const sourceUrl = resolveUrl(href);

          if (!sourceUrl) {
            return;
          }

          pushEvent(events, seenUrls, title, sourceUrl);
        });
      }

      $(MET_NAV_SELECTOR).each((_, element) => {
        const anchor = $(element);
        const href = anchor.attr("href");
        const title = normalizeText(anchor.attr("data-name") ?? anchor.text());

        if (!href || !title) {
          return;
        }

        const sourceUrl = resolveUrl(href);

        if (!sourceUrl) {
          return;
        }

        pushEvent(events, seenUrls, title, sourceUrl);
      });

      const applyLink = $('a[href*="apply.manipal.edu"]').first();

      if (applyLink.length > 0) {
        const href = applyLink.attr("href");
        const title = "MET 2026 — Apply Online";

        if (href) {
          pushEvent(events, seenUrls, title, href);
        }
      }

      return events;
    } catch {
      return [];
    }
  }
}
