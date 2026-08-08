import type { Parser } from "./parsers/parser.js";
import { BitsatParser } from "./parsers/bitsat.parser.js";
import { ComedkUgetParser } from "./parsers/comedk-uget.parser.js";
import { JeeAdvancedParser } from "./parsers/jee-advanced.parser.js";
import { JeeParser } from "./parsers/jee.parser.js";
import { MhtCetParser } from "./parsers/mht-cet.parser.js";
import { ViteeeParser } from "./parsers/viteee.parser.js";

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
    case "comedk-uget":
      return new ComedkUgetParser();
    case "viteee":
      return new ViteeeParser();
    case "bitsat":
      return new BitsatParser();
    case "mht-cet":
      return new MhtCetParser();
    default:
      throw new Error(`No parser available for exam slug: ${examSlug}`);
  }
}
