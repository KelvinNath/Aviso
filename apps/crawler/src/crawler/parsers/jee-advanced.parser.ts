import * as cheerio from "cheerio";
import type { Element } from "domhandler";

import type { ParsedEvent } from "../types/parsed-event.js";
import { shouldIncludeJeeAdvancedAnnouncement } from "./jee-advanced/cycle-filter.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://jeeadv.ac.in/";

const ANNOUNCEMENT_BLOCK_SELECTOR = "#announcements div.border.rounded-1";

const POSTED_DATE_PATTERN =
  /Posted on\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/;

const SUMMARY_MAX_LENGTH = 200;

type CheerioBlock = cheerio.Cheerio<Element>;

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return undefined;
  }
}

function slugifyTitle(title: string): string {
  return encodeURIComponent(
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80),
  );
}

function fallbackSourceUrl(title: string): string {
  return `${BASE_URL}#announcement-${slugifyTitle(title)}`;
}

function extractTitle($block: CheerioBlock): string {
  const head = $block.find("h4.announcement__head").first().clone();
  head.find("img").remove();

  return normalizeText(head.text());
}

function extractSummary($block: CheerioBlock): string {
  const text = normalizeText($block.find(".announcement__text").first().text());

  if (text.length <= SUMMARY_MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, SUMMARY_MAX_LENGTH - 1)}…`;
}

function extractSourceUrl($block: CheerioBlock, title: string): string {
  const href = $block.find("a[href]").first().attr("href");

  if (href) {
    const resolved = resolveUrl(href);

    if (resolved) {
      return resolved;
    }
  }

  return fallbackSourceUrl(title);
}

function parsePostedDate(blockText: string): Date | undefined {
  const match = blockText.match(POSTED_DATE_PATTERN);

  if (!match) {
    return undefined;
  }

  const [, monthName, day, year] = match;
  const parsed = new Date(`${monthName} ${day}, ${year}`);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseAnnouncementBlock($block: CheerioBlock): ParsedEvent | undefined {
  const title = extractTitle($block);

  if (!title) {
    return undefined;
  }

  const publishedAt = parsePostedDate($block.text());

  if (!shouldIncludeJeeAdvancedAnnouncement(title, publishedAt)) {
    return undefined;
  }

  return {
    type: classifyAnnouncementTitle(title),
    title,
    summary: extractSummary($block),
    sourceUrl: extractSourceUrl($block, title),
    publishedAt,
  };
}

/**
 * Parser for JEE Advanced official sources (jeeadv.ac.in).
 *
 * Extracts structured announcement blocks from the homepage
 * "Important Announcements" section.
 */
export class JeeAdvancedParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const events: ParsedEvent[] = [];
      const seenUrls = new Set<string>();

      $(ANNOUNCEMENT_BLOCK_SELECTOR).each((_, element) => {
        const parsed = parseAnnouncementBlock($(element));

        if (!parsed || seenUrls.has(parsed.sourceUrl)) {
          return;
        }

        seenUrls.add(parsed.sourceUrl);
        events.push(parsed);
      });

      return events;
    } catch {
      return [];
    }
  }
}
