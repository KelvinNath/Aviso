import * as cheerio from "cheerio";
import type { Element } from "domhandler";

import type { ParsedEvent } from "../types/parsed-event.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://viteee.vit.ac.in/";

const SUMMARY_MAX_LENGTH = 200;

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

function truncateSummary(text: string): string {
  if (text.length <= SUMMARY_MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, SUMMARY_MAX_LENGTH - 1)}…`;
}

function pushEvent(
  events: ParsedEvent[],
  seenUrls: Set<string>,
  title: string,
  sourceUrl: string,
  applyCycleFilter: boolean,
): void {
  if (!title || (applyCycleFilter && !shouldIncludeCycleAnnouncement(title))) {
    return;
  }

  if (seenUrls.has(sourceUrl)) {
    return;
  }

  seenUrls.add(sourceUrl);

  events.push({
    type: classifyAnnouncementTitle(title),
    title,
    summary: truncateSummary(title),
    sourceUrl,
  });
}

function parseMarqueeText($: cheerio.CheerioAPI, events: ParsedEvent[], seenUrls: Set<string>): void {
  $(".marquee-text").each((_, element) => {
    const text = normalizeText($(element).text());

    if (!text) {
      return;
    }

    pushEvent(
      events,
      seenUrls,
      truncateSummary(text),
      `${BASE_URL}#marquee-${slugifyTitle(text)}`,
      false,
    );
  });
}

function parseMarks($: cheerio.CheerioAPI, events: ParsedEvent[], seenUrls: Set<string>): void {
  $("mark").each((_, element) => {
    const mark = $(element);
    const title = normalizeText(mark.text());

    if (!title) {
      return;
    }

    const href = mark.find("a[href]").first().attr("href");
    const siblingLink = mark.next("a[href]").attr("href");
    const link = href ?? siblingLink;
    const sourceUrl =
      link && resolveUrl(link)
        ? resolveUrl(link)!
        : `${BASE_URL}#notice-${slugifyTitle(title)}`;

    pushEvent(events, seenUrls, title, sourceUrl, false);
  });
}

function parseProminentLinks(
  $: cheerio.CheerioAPI,
  events: ParsedEvent[],
  seenUrls: Set<string>,
): void {
  $('a[href*="viteee2026"], a[href*="otbs.vit.ac.in"]').each((_, element) => {
    const anchor = $(element);
    const title = normalizeText(anchor.text());
    const href = anchor.attr("href");

    if (!title || !href) {
      return;
    }

    const sourceUrl = resolveUrl(href);

    if (!sourceUrl) {
      return;
    }

    pushEvent(events, seenUrls, title, sourceUrl, false);
  });
}

function parseImportantDates($: cheerio.CheerioAPI, events: ParsedEvent[], seenUrls: Set<string>): void {
  $("#important-dates .steps-item").each((index, element) => {
    const item = $(element);
    const dateText = normalizeText(item.find("h5").first().text());
    const label = normalizeText(item.find("p.mb-0").first().text());

    if (!dateText || !label) {
      return;
    }

    const title = `VITEEE 2026 — ${label} (${dateText})`;
    const sourceUrl = `${BASE_URL}#important-dates-${index + 1}`;

    pushEvent(events, seenUrls, title, sourceUrl, true);
  });
}

/**
 * Parser for VITEEE official portal (viteee.vit.ac.in).
 */
export class ViteeeParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const seenUrls = new Set<string>();
      const events: ParsedEvent[] = [];

      parseMarqueeText($, events, seenUrls);
      parseMarks($, events, seenUrls);
      parseProminentLinks($, events, seenUrls);
      parseImportantDates($, events, seenUrls);

      return events;
    } catch {
      return [];
    }
  }
}
