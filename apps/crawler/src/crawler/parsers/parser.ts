import type { ParsedEvent } from "../types/parsed-event.js";

/**
 * Shared contract for all exam source parsers.
 * Each parser converts raw HTML into a normalized list of ParsedEvent objects.
 */
export interface Parser {
  parse(html: string): ParsedEvent[];
}
