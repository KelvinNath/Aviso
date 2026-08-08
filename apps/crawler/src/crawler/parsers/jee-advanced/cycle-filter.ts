/**
 * Current JEE Advanced exam cycle year. Update at the start of each cycle.
 */
export const EXAM_CYCLE_YEAR = 2026;

const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Limits first-run ingest to the current cycle.
 * Include if title mentions the cycle year OR posted within the last 12 months.
 */
export function shouldIncludeJeeAdvancedAnnouncement(
  title: string,
  publishedAt: Date | undefined,
  now: Date = new Date(),
): boolean {
  if (!title.trim()) {
    return false;
  }

  if (title.includes(String(EXAM_CYCLE_YEAR))) {
    return true;
  }

  if (!publishedAt) {
    return false;
  }

  return now.getTime() - publishedAt.getTime() <= TWELVE_MONTHS_MS;
}
