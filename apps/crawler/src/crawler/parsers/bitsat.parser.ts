import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://www.bitsadmission.com/BITSAT_LP/index.html";

const SUMMARY_MAX_LENGTH = 200;

function slugifyTitle(title: string): string {
  return encodeURIComponent(
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80),
  );
}

function truncateSummary(text: string): string {
  if (text.length <= SUMMARY_MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, SUMMARY_MAX_LENGTH - 1)}…`;
}

function parseNoticeBar($: cheerio.CheerioAPI): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const seenTitles = new Set<string>();

  $(".notice-bar-container .notice-text").each((_, element) => {
    const block = $(element);
    const title = normalizeText(block.text());

    if (!title || seenTitles.has(title)) {
      return;
    }

    seenTitles.add(title);

    const href = block.find("a[href]").first().attr("href");
    let sourceUrl = `${BASE_URL}#notice-${slugifyTitle(title)}`;

    if (href) {
      try {
        sourceUrl = new URL(href, BASE_URL).href;
      } catch {
        // keep fallback
      }
    }

    events.push({
      type: classifyAnnouncementTitle(title),
      title: truncateSummary(title),
      summary: truncateSummary(title),
      sourceUrl,
    });
  });

  return events;
}

function parseTimeline($: cheerio.CheerioAPI): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  $("#timeline .timeline-card").each((index, element) => {
    const card = $(element);
    const heading = normalizeText(card.find("h4.m-text").first().text());
    const date = normalizeText(card.find(".timeline-date").first().text());
    const description = normalizeText(card.find(".timeline-desc").first().text());

    if (!heading || !date) {
      return;
    }

    const title = `BITSAT 2026 — ${heading} (${date})`;

    if (!shouldIncludeCycleAnnouncement(title)) {
      return;
    }

    events.push({
      type: classifyAnnouncementTitle(`${heading} ${description}`),
      title,
      summary: truncateSummary(description || heading),
      sourceUrl: `${BASE_URL}#timeline-${index + 1}`,
    });
  });

  return events;
}

/**
 * Parser for BITSAT landing page (bitsadmission.com/BITSAT_LP).
 */
export class BitsatParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const seenUrls = new Set<string>();
      const events: ParsedEvent[] = [];

      for (const parsed of [...parseNoticeBar($), ...parseTimeline($)]) {
        if (seenUrls.has(parsed.sourceUrl)) {
          continue;
        }

        seenUrls.add(parsed.sourceUrl);
        events.push(parsed);
      }

      return events;
    } catch {
      return [];
    }
  }
}
