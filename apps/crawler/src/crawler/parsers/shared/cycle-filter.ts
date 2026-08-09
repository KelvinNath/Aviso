import { getExamCycleYear } from "@aviso/shared-utils";

const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Limits first-run ingest to the current cycle.
 * Include if title mentions the cycle year OR posted within the last 12 months.
 */
export function shouldIncludeCycleAnnouncement(
  title: string,
  publishedAt?: Date,
  now: Date = new Date(),
  cycleYear?: number,
): boolean {
  const year = cycleYear ?? getExamCycleYear(now);

  if (!title.trim()) {
    return false;
  }

  if (title.includes(String(year))) {
    return true;
  }

  if (!publishedAt) {
    return false;
  }

  return now.getTime() - publishedAt.getTime() <= TWELVE_MONTHS_MS;
}

export { getExamCycleYear };
