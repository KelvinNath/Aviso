import type { ParsedEvent } from "../types/parsed-event.js";
import type { Parser } from "./parser.js";

/**
 * Parser for JEE Main official sources.
 * Stub implementation — returns no events until scraping logic is added.
 */
export class JeeParser implements Parser {
  parse(_html: string): ParsedEvent[] {
    return [];
  }
}
