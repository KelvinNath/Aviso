import { EventType } from "@prisma/client";

/**
 * Normalizes a title for keyword matching: lowercase, strip punctuation,
 * collapse whitespace.
 */
export function normalizeTitleForClassification(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(normalized: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => normalized.includes(keyword));
}

const COUNSELLING_CLOSE_KEYWORDS = [
  "counselling close",
  "counseling close",
  "counselling closed",
  "counseling closed",
  "counselling closure",
  "counseling closure",
  "counselling conclude",
  "counselling last date",
  "counseling last date",
] as const;

const COUNSELLING_KEYWORDS = ["counselling", "counseling"] as const;

const ANSWER_KEY_KEYWORDS = [
  "answer key",
  "answer keys",
  "provisional answer",
  "final answer key",
  "final answer keys",
  "answer key challenge",
  "recorded response sheet",
] as const;

const RESULT_KEYWORDS = [
  "score card",
  "nta score",
  "nta scores",
  "declaration of final nta",
  "declaration of the result",
  "declaration of joint entrance",
  "declaration of final",
] as const;

const ADMIT_CARD_KEYWORDS = [
  "admit card",
  "admit cards",
  "hall ticket",
  "release of admit",
] as const;

const APPLICATION_CLOSE_KEYWORDS = [
  "application close",
  "application closed",
  "registration close",
  "registration closed",
  "closing of registration",
  "closing of online application",
  "last date to apply",
  "last date for application",
  "last date for registration",
  "last date of application",
] as const;

const APPLICATION_OPEN_KEYWORDS = [
  "online application",
  "inviting online application",
  "inviting online applications",
  "application form",
  "application portal",
  "online application form",
  "online application portal",
  "registration open",
  "registration starts",
  "correction window",
  "correction in particulars",
  "correction of particulars",
  "re opening",
  "reopening",
  "re open",
  "updation of aadhaar",
  "before filling of online application",
  "mismatch of photograph",
  "mismatch of photographs",
] as const;

const EXAM_DATE_KEYWORDS = [
  "exam schedule",
  "examination schedule",
  "date sheet",
  "datesheet",
  "successfully conducted",
  "advance intimation for allotment of examination city",
  "allotment of examination city",
  "examination city",
  "change of examination centre",
  "change of examination center",
  "rescheduling of jee",
  "rescheduling of joint entrance",
  "examination centre",
  "examination center",
  "press release for jee",
  "press release for joint entrance",
  "advisory and instructions",
  "advisory on city",
  "advisory for candidates",
  "advisory for jee",
  "clarification on",
  "intimation regarding",
  "session 1 and session 2",
  "session i and session ii",
  "scheduled to appear",
] as const;

/**
 * Classifies a JEE Main announcement title into an EventType using
 * case-insensitive, punctuation-normalized keyword rules.
 */
export function classifyJeeEventType(title: string): EventType {
  const normalized = normalizeTitleForClassification(title);

  if (
    includesAny(normalized, COUNSELLING_CLOSE_KEYWORDS) ||
    (includesAny(normalized, COUNSELLING_KEYWORDS) &&
      includesAny(normalized, ["close", "closed", "closure", "conclude"]))
  ) {
    return EventType.COUNSELLING_CLOSE;
  }

  if (includesAny(normalized, COUNSELLING_KEYWORDS)) {
    return EventType.COUNSELLING_OPEN;
  }

  if (includesAny(normalized, ANSWER_KEY_KEYWORDS)) {
    return EventType.ANSWER_KEY;
  }

  if (
    includesAny(normalized, RESULT_KEYWORDS) ||
    (normalized.includes("declaration") &&
      includesAny(normalized, ["result", "nta score", "nta scores", "score"])) ||
    (normalized.includes("result") && !normalized.includes("answer key"))
  ) {
    return EventType.RESULT;
  }

  if (includesAny(normalized, ADMIT_CARD_KEYWORDS)) {
    return EventType.ADMIT_CARD_RELEASED;
  }

  if (
    includesAny(normalized, APPLICATION_CLOSE_KEYWORDS) ||
    (normalized.includes("last date") &&
      includesAny(normalized, ["application", "registration", "apply"]))
  ) {
    return EventType.APPLICATION_CLOSE;
  }

  if (includesAny(normalized, APPLICATION_OPEN_KEYWORDS)) {
    return EventType.APPLICATION_OPEN;
  }

  if (includesAny(normalized, EXAM_DATE_KEYWORDS)) {
    return EventType.EXAM_DATE;
  }

  if (normalized.includes("registration")) {
    return EventType.APPLICATION_OPEN;
  }

  if (normalized.includes("declaration")) {
    return EventType.RESULT;
  }

  if (normalized.includes("advisory") || normalized.includes("press release")) {
    return EventType.EXAM_DATE;
  }

  return EventType.EXAM_DATE;
}
