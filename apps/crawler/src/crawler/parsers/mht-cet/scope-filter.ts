import { normalizeTitleForClassification } from "../shared/normalize-title.js";

const INCLUDE_PATTERNS = [
  /\bmht[\s-]?cet\b/i,
  /\bpcm\b/i,
  /\bengineering\b/i,
  /technical education/i,
  /तंत्रशिक्षण/,
  /अभियांत्रिक/,
  /cap.*2026/i,
] as const;

const EXCLUDE_PATTERNS = [
  /\bmba\b/i,
  /\bmms\b/i,
  /\bllb\b/i,
  /\bl\.?l\.?b\b/i,
  /\bneet\b/i,
  /\bdcet\b/i,
  /\bmca\b/i,
  /\bpharmacy\b/i,
  /\blaw\b/i,
] as const;

/**
 * Limits MHT CET ingest to engineering-relevant homepage marquee items.
 */
export function shouldIncludeMhtCetAnnouncement(title: string): boolean {
  const normalized = normalizeTitleForClassification(title);

  if (!normalized) {
    return false;
  }

  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(title))) {
    return false;
  }

  return INCLUDE_PATTERNS.some(
    (pattern) => pattern.test(normalized) || pattern.test(title),
  );
}
