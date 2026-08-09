import { EventType } from "@prisma/client";

import type { ParsedEvent } from "../../types/parsed-event.js";

const MONTH_NAMES =
  "january|february|march|april|may|june|july|august|september|october|november|december";
const MONTH_ABBR =
  "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec";

const NUMERIC_DATE_PATTERN =
  /\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/g;

const NAMED_DAY_PATTERN = new RegExp(
  `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_NAMES}|${MONTH_ABBR})\\s*,?\\s*(\\d{4})\\b`,
  "gi",
);

const HYPHENATED_DATE_PATTERN = new RegExp(
  `\\b(\\d{1,2})[-/](${MONTH_ABBR})[-/](\\d{2,4})\\b`,
  "gi",
);

const POSTED_DATE_PATTERN = new RegExp(
  `Posted on\\s+(${MONTH_NAMES})\\s+(\\d{1,2}),\\s+(\\d{4})`,
  "i",
);

const DATE_RANGE_PATTERN = new RegExp(
  `(?:(${MONTH_NAMES})\\s+(\\d{1,2})\\s+to\\s+(${MONTH_NAMES})\\s+(\\d{1,2}),?\\s+(\\d{4}))|((\\d{1,2})[./-](\\d{1,2})[./-](\\d{2,4})\\s+to\\s+(\\d{1,2})[./-](\\d{1,2})[./-](\\d{2,4}))`,
  "gi",
);

function normalizeYear(year: number): number {
  if (year < 100) {
    return year >= 70 ? 1900 + year : 2000 + year;
  }

  return year;
}

function parseMonthToken(token: string): number | undefined {
  const normalized = token.toLowerCase().slice(0, 3);
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  const index = months.indexOf(normalized);
  return index === -1 ? undefined : index;
}

function buildDate(
  year: number,
  monthIndex: number,
  day: number,
): Date | undefined {
  const parsed = new Date(year, monthIndex, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }

  return parsed;
}

function endOfLocalDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

/**
 * Parses a date string and normalizes it to the end of that local day.
 */
export function resolveEffectiveDateFromText(text: string): Date | undefined {
  const parsed = parsePrimaryDate(text);
  return parsed ? endOfLocalDay(parsed) : undefined;
}

function addUniqueDate(dates: Date[], seen: Set<number>, candidate: Date | undefined) {
  if (!candidate) {
    return;
  }

  const key = candidate.getTime();

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  dates.push(candidate);
}

function parseNumericDate(day: string, month: string, year: string): Date | undefined {
  const dayNum = Number.parseInt(day, 10);
  const monthNum = Number.parseInt(month, 10);
  const yearNum = normalizeYear(Number.parseInt(year, 10));

  if (monthNum < 1 || monthNum > 12) {
    return undefined;
  }

  return buildDate(yearNum, monthNum - 1, dayNum);
}

function parseNamedDate(day: string, month: string, year: string): Date | undefined {
  const monthIndex = parseMonthToken(month);

  if (monthIndex === undefined) {
    return undefined;
  }

  return buildDate(normalizeYear(Number.parseInt(year, 10)), monthIndex, Number.parseInt(day, 10));
}

function parseDateRangeEnd(text: string): Date | undefined {
  for (const match of text.matchAll(DATE_RANGE_PATTERN)) {
    if (match[1] && match[3] && match[4] && match[5]) {
      const endMonthIndex = parseMonthToken(match[3]);

      if (endMonthIndex === undefined) {
        continue;
      }

      return buildDate(
        Number.parseInt(match[5], 10),
        endMonthIndex,
        Number.parseInt(match[4], 10),
      );
    }

    if (match[6] && match[10] && match[11] && match[12]) {
      return parseNumericDate(match[10], match[11], match[12]);
    }
  }

  return undefined;
}

/**
 * Parses the first reliable date from a short date string (e.g. calendar cells).
 */
export function parsePrimaryDate(text: string): Date | undefined {
  const trimmed = text.trim();

  if (!trimmed) {
    return undefined;
  }

  const rangeEnd = parseDateRangeEnd(trimmed);

  if (rangeEnd) {
    return rangeEnd;
  }

  const candidates = parseDateCandidates(trimmed);
  return candidates[0];
}

/**
 * Extracts all date candidates found in free text.
 */
export function parseDateCandidates(text: string): Date[] {
  const dates: Date[] = [];
  const seen = new Set<number>();

  const postedMatch = text.match(POSTED_DATE_PATTERN);

  if (postedMatch?.[1] && postedMatch[2] && postedMatch[3]) {
    addUniqueDate(
      dates,
      seen,
      parseNamedDate(postedMatch[2], postedMatch[1], postedMatch[3]),
    );
  }

  const rangeEnd = parseDateRangeEnd(text);

  if (rangeEnd) {
    addUniqueDate(dates, seen, rangeEnd);

    if (
      /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\s+to\s+\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/i.test(
        text.trim(),
      )
    ) {
      return dates;
    }
  }

  for (const match of text.matchAll(NAMED_DAY_PATTERN)) {
    if (match[1] && match[2] && match[3]) {
      addUniqueDate(dates, seen, parseNamedDate(match[1], match[2], match[3]));
    }
  }

  for (const match of text.matchAll(HYPHENATED_DATE_PATTERN)) {
    if (match[1] && match[2] && match[3]) {
      addUniqueDate(dates, seen, parseNamedDate(match[1], match[2], match[3]));
    }
  }

  for (const match of text.matchAll(NUMERIC_DATE_PATTERN)) {
    if (match[1] && match[2] && match[3]) {
      addUniqueDate(dates, seen, parseNumericDate(match[1], match[2], match[3]));
    }
  }

  return dates.sort((left, right) => left.getTime() - right.getTime());
}

function pickLatestDate(candidates: Date[]): Date | undefined {
  if (candidates.length === 0) {
    return undefined;
  }

  return candidates[candidates.length - 1];
}

function pickEarliestDate(candidates: Date[]): Date | undefined {
  return candidates[0];
}

/**
 * Infers the last actionable day for an event from its type and text.
 */
export function inferEffectiveDate(
  type: EventType,
  title: string,
  summary: string,
): Date | undefined {
  if (type === EventType.RESULT || type === EventType.ANSWER_KEY) {
    return undefined;
  }

  const combined = `${title} ${summary}`.trim();

  if (!combined) {
    return undefined;
  }

  const rangeEnd = parseDateRangeEnd(combined);

  if (rangeEnd) {
    return endOfLocalDay(rangeEnd);
  }

  const candidates = parseDateCandidates(combined);

  if (candidates.length === 0) {
    return undefined;
  }

  switch (type) {
    case EventType.APPLICATION_CLOSE:
    case EventType.COUNSELLING_CLOSE:
    case EventType.APPLICATION_OPEN:
    case EventType.COUNSELLING_OPEN:
      return endOfLocalDay(pickLatestDate(candidates)!);
    case EventType.EXAM_DATE:
    case EventType.ADMIT_CARD_RELEASED:
      return endOfLocalDay(pickEarliestDate(candidates)!);
    default:
      return undefined;
  }
}

/**
 * Fills effectiveDate on a parsed event when the parser did not set one explicitly.
 */
export function applyEffectiveDate(parsed: ParsedEvent): ParsedEvent {
  return {
    ...parsed,
    effectiveDate:
      parsed.effectiveDate ??
      inferEffectiveDate(parsed.type, parsed.title, parsed.summary),
  };
}
