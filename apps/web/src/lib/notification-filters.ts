import { EventType } from "@prisma/client";

import type { NotificationFilterOption } from "@/types/dashboard-notification";

export const NOTIFICATION_FILTER_OPTIONS: NotificationFilterOption[] = [
  { id: "all", label: "All", eventTypes: [] },
  { id: "results", label: "Results", eventTypes: [EventType.RESULT] },
  {
    id: "admit-cards",
    label: "Admit Cards",
    eventTypes: [EventType.ADMIT_CARD_RELEASED],
  },
  {
    id: "answer-keys",
    label: "Answer Keys",
    eventTypes: [EventType.ANSWER_KEY],
  },
  {
    id: "exam-dates",
    label: "Exam Dates",
    eventTypes: [EventType.EXAM_DATE],
  },
  {
    id: "applications",
    label: "Applications",
    eventTypes: [EventType.APPLICATION_OPEN, EventType.APPLICATION_CLOSE],
  },
  {
    id: "counselling",
    label: "Counselling",
    eventTypes: [EventType.COUNSELLING_OPEN, EventType.COUNSELLING_CLOSE],
  },
];

export function getFilterEventTypes(
  filterId: NotificationFilterOption["id"],
): EventType[] {
  const option = NOTIFICATION_FILTER_OPTIONS.find((item) => item.id === filterId);
  return option?.eventTypes ?? [];
}
