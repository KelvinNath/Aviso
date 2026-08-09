import { ExamCyclePhase, type Event } from "@prisma/client";

import { isActionableEvent } from "@aviso/shared-utils";

import {
  EXAM_CYCLE_YEAR,
  getCurrentExamCycle,
} from "./exam-cycle.service.js";

/**
 * Returns true when a stored event should trigger user notifications.
 */
export function shouldNotifyForEventWithCycle(
  event: Event,
  cyclePhase: ExamCyclePhase | null | undefined,
  now: Date = new Date(),
): boolean {
  if (cyclePhase === ExamCyclePhase.COMPLETE) {
    return false;
  }

  return isActionableEvent(
    {
      notifyPolicy: event.notifyPolicy,
      publishedAt: event.publishedAt,
      detectedAt: event.detectedAt,
      effectiveDate: event.effectiveDate,
    },
    now,
  );
}

/**
 * Loads the current exam cycle and applies notify eligibility rules.
 */
export async function shouldNotifyForEvent(
  event: Event,
  now: Date = new Date(),
): Promise<boolean> {
  const cycle = await getCurrentExamCycle(event.examId, EXAM_CYCLE_YEAR);
  return shouldNotifyForEventWithCycle(event, cycle?.phase, now);
}
