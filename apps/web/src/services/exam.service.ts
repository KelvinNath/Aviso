import { ExamCyclePhase, ExamStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Matches EXAM_CYCLE_YEAR in the crawler cycle filter. */
export const CURRENT_CYCLE_YEAR = 2026;

/**
 * Returns active exams with a live admissions cycle, ordered alphabetically.
 * Exams whose current cycle is COMPLETE are excluded from new subscriptions.
 */
export async function getActiveExams() {
  return prisma.exam.findMany({
    where: {
      status: ExamStatus.ACTIVE,
      NOT: {
        cycles: {
          some: {
            cycleYear: CURRENT_CYCLE_YEAR,
            phase: ExamCyclePhase.COMPLETE,
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCurrentCyclePhase(
  examId: string,
): Promise<ExamCyclePhase | null> {
  const cycle = await prisma.examCycle.findUnique({
    where: {
      examId_cycleYear: {
        examId,
        cycleYear: CURRENT_CYCLE_YEAR,
      },
    },
    select: { phase: true },
  });

  return cycle?.phase ?? null;
}
