import {
  EventType,
  ExamCyclePhase,
  type ExamCycle,
  type Event,
} from "@prisma/client";
import { getExamCycleYear } from "@aviso/shared-utils";

import { prisma } from "../lib/prisma.js";

const POST_EXAM_COMPLETE_DAYS = 90;

export type ExamCycleMilestones = {
  registrationClose: Date | null;
  examDate: Date | null;
  counsellingClose: Date | null;
};

function maxDate(current: Date | null, candidate: Date | null): Date | null {
  if (!candidate) {
    return current;
  }

  if (!current || candidate.getTime() > current.getTime()) {
    return candidate;
  }

  return current;
}

function isEventInCycle(
  event: Pick<Event, "title" | "publishedAt" | "effectiveDate" | "detectedAt">,
  cycleYear: number,
): boolean {
  const yearText = String(cycleYear);

  if (event.title.includes(yearText)) {
    return true;
  }

  const cycleStart = new Date(cycleYear, 0, 1);
  const cycleEnd = new Date(cycleYear + 1, 0, 1);

  for (const date of [event.effectiveDate, event.publishedAt, event.detectedAt]) {
    if (date && date >= cycleStart && date < cycleEnd) {
      return true;
    }
  }

  return false;
}

/**
 * Derives the admissions cycle phase from milestone dates and the current time.
 */
export function computeExamCyclePhase(
  cycle: ExamCycleMilestones,
  now: Date = new Date(),
): ExamCyclePhase {
  const { registrationClose, examDate, counsellingClose } = cycle;

  if (counsellingClose && now.getTime() > counsellingClose.getTime()) {
    return ExamCyclePhase.COMPLETE;
  }

  if (examDate && now.getTime() > examDate.getTime()) {
    if (!counsellingClose) {
      const completeAfter = new Date(examDate);
      completeAfter.setDate(completeAfter.getDate() + POST_EXAM_COMPLETE_DAYS);

      if (now.getTime() > completeAfter.getTime()) {
        return ExamCyclePhase.COMPLETE;
      }
    }

    return ExamCyclePhase.POST_EXAM;
  }

  if (registrationClose && now.getTime() > registrationClose.getTime()) {
    return ExamCyclePhase.PRE_EXAM;
  }

  return ExamCyclePhase.REGISTRATION;
}

function deriveMilestonesFromEvents(
  events: Pick<Event, "type" | "effectiveDate">[],
  existing: ExamCycleMilestones,
): ExamCycleMilestones {
  let registrationClose = existing.registrationClose;
  let examDate = existing.examDate;
  let counsellingClose = existing.counsellingClose;

  for (const event of events) {
    if (!event.effectiveDate) {
      continue;
    }

    switch (event.type) {
      case EventType.APPLICATION_CLOSE:
        registrationClose = maxDate(registrationClose, event.effectiveDate);
        break;
      case EventType.EXAM_DATE:
        examDate = maxDate(examDate, event.effectiveDate);
        break;
      case EventType.COUNSELLING_CLOSE:
        counsellingClose = maxDate(counsellingClose, event.effectiveDate);
        break;
      default:
        break;
    }
  }

  return {
    registrationClose,
    examDate,
    counsellingClose,
  };
}

export async function getCurrentExamCycle(
  examId: string,
  cycleYear?: number,
): Promise<ExamCycle | null> {
  const year = cycleYear ?? getExamCycleYear();

  return prisma.examCycle.findUnique({
    where: {
      examId_cycleYear: {
        examId,
        cycleYear: year,
      },
    },
  });
}

export async function syncExamCycleFromEvents(
  examId: string,
  cycleYear?: number,
): Promise<ExamCycleMilestones> {
  const year = cycleYear ?? getExamCycleYear();
  const existing = await getCurrentExamCycle(examId, year);

  const events = await prisma.event.findMany({
    where: { examId },
    select: {
      type: true,
      title: true,
      publishedAt: true,
      effectiveDate: true,
      detectedAt: true,
    },
  });

  const cycleEvents = events.filter((event) => isEventInCycle(event, year));

  return deriveMilestonesFromEvents(cycleEvents, {
    registrationClose: existing?.registrationClose ?? null,
    examDate: existing?.examDate ?? null,
    counsellingClose: existing?.counsellingClose ?? null,
  });
}

export async function refreshExamCycle(
  examId: string,
  cycleYear?: number,
  now: Date = new Date(),
): Promise<ExamCycle> {
  const year = cycleYear ?? getExamCycleYear();
  const milestones = await syncExamCycleFromEvents(examId, year);
  const nextPhase = computeExamCyclePhase(milestones, now);
  const existing = await getCurrentExamCycle(examId, year);

  const completedAt =
    nextPhase === ExamCyclePhase.COMPLETE
      ? existing?.completedAt ?? now
      : null;

  return prisma.examCycle.upsert({
    where: {
      examId_cycleYear: {
        examId,
        cycleYear: year,
      },
    },
    create: {
      examId,
      cycleYear: year,
      phase: nextPhase,
      registrationClose: milestones.registrationClose,
      examDate: milestones.examDate,
      counsellingClose: milestones.counsellingClose,
      completedAt,
    },
    update: {
      phase: nextPhase,
      registrationClose: milestones.registrationClose,
      examDate: milestones.examDate,
      counsellingClose: milestones.counsellingClose,
      completedAt,
    },
  });
}

export { getExamCycleYear };
