import { normalizeTitleForClassification } from "../shared/normalize-title.js";

const INCLUDE_PATTERNS = [
  /\bmet\b/i,
  /manipal\.edu\/admission/i,
  /apply\.manipal\.edu/i,
  /online entrance/i,
  /entrance test/i,
  /otbs/i,
] as const;

const EXCLUDE_PATTERNS = [
  /tele manas/i,
  /ssp account/i,
  /postmatric/i,
  /helpline for students/i,
] as const;

/**
 * Limits MET ingest to Manipal entrance-test relevant announcements.
 */
export function shouldIncludeMetAnnouncement(title: string): boolean {
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
