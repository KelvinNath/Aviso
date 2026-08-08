import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { normalizeText } from "./shared/normalize-title.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://applications.srmist.edu.in/btech";

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return undefined;
  }
}

function parseTimelineTable($: cheerio.CheerioAPI): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const table = $("table.entranceEx_table").first();

  if (table.length === 0) {
    return events;
  }

  const rows = table.find("tr").toArray();

  if (rows.length < 4) {
    return events;
  }

  const phaseHeaders = $(rows[2])
    .find("td, th")
    .toArray()
    .slice(1)
    .map((cell) => normalizeText($(cell).text()).replace(/\*$/, ""));

  const examRow = $(rows[3]).find("td, th").toArray();
  const examLabel = normalizeText($(examRow[0]).text());

  for (let index = 0; index < phaseHeaders.length; index += 1) {
    const phase = phaseHeaders[index];
    const dateCell = examRow[index + 1];

    if (!phase || !dateCell) {
      continue;
    }

    const dateRange = normalizeText($(dateCell).text());

    if (!dateRange) {
      continue;
    }

    const title = `SRMJEEE 2026 — ${phase} — ${examLabel} (${dateRange})`;

    events.push({
      type: classifyAnnouncementTitle(`${examLabel} ${dateRange}`),
      title,
      summary: dateRange,
      sourceUrl: `${BASE_URL}#timeline-${phase.toLowerCase().replace(/\s+/g, "-")}-exam`,
    });
  }

  const deadlineRow = rows[4] ? $(rows[4]).find("td, th").toArray() : [];
  const deadlineLabel = normalizeText($(deadlineRow[0]).text());

  for (let index = 0; index < phaseHeaders.length; index += 1) {
    const phase = phaseHeaders[index];
    const dateCell = deadlineRow[index + 1];

    if (!phase || !dateCell) {
      continue;
    }

    const deadline = normalizeText($(dateCell).text());

    if (!deadline) {
      continue;
    }

    const title = `SRMJEEE 2026 — ${phase} — ${deadlineLabel} (${deadline})`;

    events.push({
      type: classifyAnnouncementTitle(`${deadlineLabel} ${deadline}`),
      title,
      summary: deadline,
      sourceUrl: `${BASE_URL}#timeline-${phase.toLowerCase().replace(/\s+/g, "-")}-deadline`,
    });
  }

  return events;
}

function parsePdfLinks($: cheerio.CheerioAPI): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const seenUrls = new Set<string>();

  $('a[href*=".pdf"]').each((_, element) => {
    const anchor = $(element);
    const href = anchor.attr("href");
    let title = normalizeText(anchor.text());

    if (!href || !title) {
      return;
    }

    if (!title.includes("2026")) {
      title = `SRMJEEE 2026 — ${title}`;
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

  return events;
}

/**
 * Parser for SRMJEEE B.Tech application portal (applications.srmist.edu.in/btech).
 */
export class SrmjeeeParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const seenUrls = new Set<string>();
      const events: ParsedEvent[] = [];

      for (const parsed of [...parseTimelineTable($), ...parsePdfLinks($)]) {
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
