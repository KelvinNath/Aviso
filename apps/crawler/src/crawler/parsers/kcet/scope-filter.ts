import { normalizeTitleForClassification } from "../shared/normalize-title.js";

const INCLUDE_PATTERNS = [
  /\bugcet\b/i,
  /\bkcet\b/i,
  /undergraduate common entrance test/i,
  /hall ticket download/i,
  /college portal/i,
] as const;

const EXCLUDE_PATTERNS = [
  /\bdcet\b/i,
  /\bpgcet\b/i,
  /\bneet\b/i,
  /recruitment/i,
  /police/i,
  /omr view/i,
  /village administrative/i,
  /\bpg\b.*cet/i,
] as const;

/**
 * Limits KCET ingest to engineering UGCET-relevant KEA portal items.
 */
export function shouldIncludeKcetAnnouncement(title: string): boolean {
  const normalized = normalizeTitleForClassification(title);

  if (!normalized) {
    return false;
  }

  if (
    EXCLUDE_PATTERNS.some(
      (pattern) => pattern.test(normalized) || pattern.test(title),
    )
  ) {
    return false;
  }

  return INCLUDE_PATTERNS.some(
    (pattern) => pattern.test(normalized) || pattern.test(title),
  );
}
