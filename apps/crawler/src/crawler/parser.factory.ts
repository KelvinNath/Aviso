import type { Parser } from "./parsers/parser.js";
import { JeeAdvancedParser } from "./parsers/jee-advanced.parser.js";
import { JeeParser } from "./parsers/jee.parser.js";

/**
 * Returns the parser for a given exam slug.
 * Throws if no parser is registered for the slug.
 */
export function getParser(examSlug: string): Parser {
  switch (examSlug) {
    case "jee-main":
      return new JeeParser();
    case "jee-advanced":
      return new JeeAdvancedParser();
    default:
      throw new Error(`No parser available for exam slug: ${examSlug}`);
  }
}
