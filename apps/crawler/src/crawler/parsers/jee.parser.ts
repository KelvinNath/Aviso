import * as cheerio from "cheerio";

import type { ParsedEvent } from "../types/parsed-event.js";
import { classifyAnnouncementTitle } from "./shared/classify-announcement.js";
import { shouldIncludeCycleAnnouncement } from "./shared/cycle-filter.js";
import { extractAnchorAnnouncements } from "./shared/extract-anchors.js";
import type { Parser } from "./parser.js";

const BASE_URL = "https://jeemain.nta.nic.in/";

const ANNOUNCEMENT_SELECTORS = [
  ".newsticker ul.slides li a[href]",
  ".scrollable-notices .gen-list ul li a[href]",
] as const;

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

      return extractAnchorAnnouncements($, {
        selectors: ANNOUNCEMENT_SELECTORS,
        baseUrl: BASE_URL,
        classifyFn: classifyAnnouncementTitle,
        cycleFilter: (title) => shouldIncludeCycleAnnouncement(title),
      });
    } catch {
      return [];
    }
  }
}
