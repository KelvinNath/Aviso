import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { classifyJeeEventType } from "./jee-event-classifier.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://jeemain.nta.nic.in/";

const ANNOUNCEMENT_SELECTORS = [
  ".newsticker ul.slides li a[href]",
  ".scrollable-notices .gen-list ul li a[href]",
] as const;

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return undefined;
  }
}

function parseAnchor(
  href: string | undefined,
  title: string,
): ParsedEvent | undefined {
  if (!href || !title) {
    return undefined;
  }

  const normalizedTitle = normalizeText(title);

  if (!normalizedTitle || normalizedTitle.toLowerCase() === "view all") {
    return undefined;
  }

  const sourceUrl = resolveUrl(href);

  if (!sourceUrl) {
    return undefined;
  }

  return {
    type: classifyJeeEventType(normalizedTitle),
    title: normalizedTitle,
    summary: "",
    sourceUrl,
  };
}

/**
 * Parser for JEE Main official sources (jeemain.nta.nic.in).
 *
 * Extracts items from the homepage "Latest News" ticker and
 * "Public Notices" scrollable list.
 */
export class JeeParser implements Parser {
  parse(html: string): ParsedEvent[] {
    try {
      const $ = cheerio.load(html);
      const events: ParsedEvent[] = [];
      const seenUrls = new Set<string>();

      for (const selector of ANNOUNCEMENT_SELECTORS) {
        $(selector).each((_, element) => {
          const anchor = $(element);
          const parsed = parseAnchor(anchor.attr("href"), anchor.text());

          if (!parsed || seenUrls.has(parsed.sourceUrl)) {
            return;
          }

          seenUrls.add(parsed.sourceUrl);
          events.push(parsed);
        });
      }

      return events;
    } catch {
      return [];
    }
  }
}
