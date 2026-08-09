const MIN_CYCLE_YEAR = 2000;
const MAX_CYCLE_YEAR = 2100;

/**
 * Admissions cycle year for crawlers, subscriptions, and ExamCycle rows.
 * Set EXAM_CYCLE_YEAR in the root .env when a new cycle begins (e.g. 2027).
 * Falls back to the current calendar year.
 */
export function getExamCycleYear(now: Date = new Date()): number {
  const raw = process.env.EXAM_CYCLE_YEAR?.trim();

  if (raw) {
    const parsed = Number.parseInt(raw, 10);

    if (
      Number.isFinite(parsed) &&
      parsed >= MIN_CYCLE_YEAR &&
      parsed <= MAX_CYCLE_YEAR
    ) {
      return parsed;
    }
  }

  return now.getFullYear();
}
