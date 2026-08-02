import { getParser } from "./parser.factory.js";
import type { ParsedEvent } from "./types/parsed-event.js";

export type ExamSourceInput = {
  examSlug: string;
  url: string;
};

/**
 * Orchestrates crawling for a single exam source.
 *
 * Flow:
 * 1. Receive exam source metadata
 * 2. Fetch HTML from the source URL
 * 3. Obtain the parser for the exam slug
 * 4. Parse the HTML into normalized events
 */
export async function crawlExamSource(
  source: ExamSourceInput,
): Promise<ParsedEvent[]> {
  try {
    const response = await fetch(source.url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const parser = getParser(source.examSlug);

    return parser.parse(html);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[crawler] Failed to fetch ${source.url}: ${message}`);

    return [];
  }
}
