import { EventType } from "@prisma/client";

export type EventTypeOption = {
  value: EventType;
  label: string;
  emoji: string;
};

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  { value: EventType.RESULT, label: "Results", emoji: "📢" },
  { value: EventType.ADMIT_CARD_RELEASED, label: "Admit Cards", emoji: "🎫" },
  { value: EventType.ANSWER_KEY, label: "Answer Keys", emoji: "📝" },
  { value: EventType.EXAM_DATE, label: "Exam Dates", emoji: "📅" },
  { value: EventType.APPLICATION_OPEN, label: "Application Open", emoji: "🟢" },
  { value: EventType.APPLICATION_CLOSE, label: "Application Deadlines", emoji: "🔴" },
  { value: EventType.COUNSELLING_OPEN, label: "Counselling Open", emoji: "🏫" },
  { value: EventType.COUNSELLING_CLOSE, label: "Counselling Close", emoji: "⏰" },
];

const eventTypeLabelMap = new Map(
  EVENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

const VALID_EVENT_TYPES = new Set<string>(Object.values(EventType));

export function parseEventTypesInput(value: unknown): EventType[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const allValid = value.every(
    (type) => typeof type === "string" && VALID_EVENT_TYPES.has(type),
  );

  if (!allValid) {
    return null;
  }

  return value as EventType[];
}

export function formatEventTypes(eventTypes: EventType[]): string {
  return eventTypes
    .map((type) => eventTypeLabelMap.get(type) ?? type)
    .join(", ");
}

export const DEFAULT_EVENT_TYPES: EventType[] = [
  EventType.RESULT,
  EventType.ADMIT_CARD_RELEASED,
  EventType.ANSWER_KEY,
  EventType.EXAM_DATE,
  EventType.APPLICATION_CLOSE,
];
