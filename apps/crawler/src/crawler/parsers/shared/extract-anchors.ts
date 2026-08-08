import type { CheerioAPI } from "cheerio";
import type { EventType } from "@prisma/client";

import type { ParsedEvent } from "../../types/parsed-event.js";
import { normalizeText } from "./normalize-title.js";
import { shouldIngestAnnouncement } from "./should-ingest-announcement.js";

function resolveUrl(href: string, baseUrl: string): string | undefined {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return undefined;
  }
}

function parseAnchor(
  href: string | undefined,
  title: string,
  baseUrl: string,
  classifyFn: (title: string) => EventType,
): ParsedEvent | undefined {
  if (!href || !title) {
    return undefined;
  }

  const normalizedTitle = normalizeText(title);

  if (!normalizedTitle || normalizedTitle.toLowerCase() === "view all") {
    return undefined;
  }

  const sourceUrl = resolveUrl(href, baseUrl);

  if (!sourceUrl) {
    return undefined;
  }

  if (!shouldIngestAnnouncement(normalizedTitle, sourceUrl)) {
    return undefined;
  }

  return {
    type: classifyFn(normalizedTitle),
    title: normalizedTitle,
    summary: "",
    sourceUrl,
  };
}

type ExtractAnchorAnnouncementsOptions = {
  selectors: readonly string[];
  baseUrl: string;
  classifyFn: (title: string) => EventType;
};

/**
 * Extracts announcement links from HTML using CSS selectors.
 */
export function extractAnchorAnnouncements(
  $: CheerioAPI,
  options: ExtractAnchorAnnouncementsOptions,
): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const seenUrls = new Set<string>();

  for (const selector of options.selectors) {
    $(selector).each((_, element) => {
      const anchor = $(element);
      const parsed = parseAnchor(
        anchor.attr("href"),
        anchor.text(),
        options.baseUrl,
        options.classifyFn,
      );

      if (!parsed || seenUrls.has(parsed.sourceUrl)) {
        return;
      }

      seenUrls.add(parsed.sourceUrl);
      events.push(parsed);
    });
  }

  return events;
}
