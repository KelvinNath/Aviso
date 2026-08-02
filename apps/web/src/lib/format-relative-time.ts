/**
 * Returns a human-readable relative time string (e.g. "2 hours ago").
 */
export function formatRelativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absSec = Math.abs(diffSec);

  if (absSec < 60) {
    return formatter.format(diffSec, "second");
  }

  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) {
    return formatter.format(diffMin, "minute");
  }

  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) {
    return formatter.format(diffHour, "hour");
  }

  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 7) {
    return formatter.format(diffDay, "day");
  }

  const diffWeek = Math.round(diffDay / 7);
  if (Math.abs(diffWeek) < 5) {
    return formatter.format(diffWeek, "week");
  }

  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) {
    return formatter.format(diffMonth, "month");
  }

  const diffYear = Math.round(diffDay / 365);
  return formatter.format(diffYear, "year");
}
