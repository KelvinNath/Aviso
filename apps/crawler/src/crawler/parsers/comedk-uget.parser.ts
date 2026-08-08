import * as cheerio from "cheerio";
import type { Element } from "domhandler";

import type { ParsedEvent } from "../types/parsed-event.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://www.comedk.org/";
const PAGE_PATH = "about-uget-and-notification-2026";
const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;

const SUMMARY_MAX_LENGTH = 200;

const CALENDAR_DATE_PATTERN = /\d{1,2}[-/]\w{3}/i;

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

function headingIsExact($heading: cheerio.Cheerio<Element>, label: string): boolean {
  return normalizeText($heading.text()).toLowerCase() === label.toLowerCase();
}

function headingMatches($heading: cheerio.Cheerio<Element>, label: string): boolean {
  return normalizeText($heading.text()).toLowerCase().includes(label.toLowerCase());
}

function stripClickHere(title: string): string {
  return normalizeText(title.replace(/\s*click here\s*/gi, " "));
}

function parseBrochures($: cheerio.CheerioAPI): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  $(".button-3a[href*='.pdf']").each((_, element) => {
    const anchor = $(element);
    const href = anchor.attr("href");

    if (!href) {
      return;
    }

    const title = normalizeText(anchor.text());

    if (!title || !shouldIncludeCycleAnnouncement(title)) {
      return;
    }

    const sourceUrl = resolveUrl(href);

    if (!sourceUrl) {
      return;
    }

    events.push({
      type: classifyAnnouncementTitle(title),
      title,
      summary: "",
      sourceUrl,
    });
  });

  return events;
}

function parseNotifications($: cheerio.CheerioAPI): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const notificationHeading = $("h3")
    .filter((_, element) => headingIsExact($(element), "Notification"))
    .first();

  if (notificationHeading.length === 0) {
    return events;
  }

  notificationHeading.parent().find("ul li").each((_, liElement) => {
      const item = $(liElement);
      const rawTitle = stripClickHere(item.text());

      if (!rawTitle || !shouldIncludeCycleAnnouncement(rawTitle)) {
        return;
      }

      const href = item.find("a[href]").first().attr("href");
      const sourceUrl = href ? resolveUrl(href) : `${PAGE_URL}#notification-${slugifyTitle(rawTitle)}`;

      if (!sourceUrl) {
        return;
      }

      events.push({
        type: classifyAnnouncementTitle(rawTitle),
        title: rawTitle,
        summary: truncateSummary(rawTitle),
        sourceUrl,
      });
    });

  return events;
}

function parseCalendar($: cheerio.CheerioAPI): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  $("h3").each((_, element) => {
    const heading = $(element);

    if (!headingMatches(heading, "calendar of events")) {
      return;
    }

    const table = heading.nextAll("table").first();

    table.find("tr").each((_, rowElement) => {
      const cells = $(rowElement)
        .find("td")
        .map((__, cell) => normalizeText($(cell).text()))
        .get()
        .filter(Boolean);

      if (cells.length < 3) {
        return;
      }

      const dateCell = cells[0];
      const eventCell = cells[2];

      if (
        !dateCell ||
        !eventCell ||
        !CALENDAR_DATE_PATTERN.test(dateCell) ||
        eventCell.toLowerCase() === "event" ||
        dateCell.toLowerCase() === "date"
      ) {
        return;
      }

      const title = `COMEDK UGET 2026 — ${eventCell} — ${dateCell}`;

      if (!shouldIncludeCycleAnnouncement(title)) {
        return;
      }

      events.push({
        type: classifyAnnouncementTitle(title),
        title,
        summary: truncateSummary(eventCell),
        sourceUrl: `${PAGE_URL}#calendar-${slugifyTitle(title)}`,
      });
    });
  });

  return events;
}

/**
 * Parser for COMEDK UGET official notification page (comedk.org).
 */
export class ComedkUgetParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const seenUrls = new Set<string>();
      const events: ParsedEvent[] = [];

      for (const parsed of [
        ...parseBrochures($),
        ...parseNotifications($),
        ...parseCalendar($),
      ]) {
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
