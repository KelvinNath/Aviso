import { ExamCyclePhase, ExamStatus } from "@prisma/client";
import { getExamCycleYear } from "@aviso/shared-utils";

import { prisma } from "@/lib/prisma";

export { getExamCycleYear };

export type MarketingExam = {
  name: string;
  slug: string;
  cycleYear: number;
  status: "live" | "cycle_ended";
};

export type TrackExamOption = {
  id: string;
  name: string;
  slug: string;
  cycleYear: number;
  cycleEnded: boolean;
};

/**
 * Returns active exams with a live admissions cycle for the configured year,
 * ordered alphabetically. Exams whose cycle is COMPLETE are excluded.
 */
export async function getActiveExams() {
  const cycleYear = getExamCycleYear();

  return prisma.exam.findMany({
    where: {
      status: ExamStatus.ACTIVE,
      NOT: {
        cycles: {
          some: {
            cycleYear,
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

/**
 * All ACTIVE exams with subscribability status for marketing surfaces.
 */
export async function getExamsForMarketing(): Promise<MarketingExam[]> {
  const cycleYear = getExamCycleYear();

  const exams = await prisma.exam.findMany({
    where: { status: ExamStatus.ACTIVE },
    orderBy: { name: "asc" },
    include: {
      cycles: {
        where: { cycleYear },
        take: 1,
      },
    },
  });

  return exams.map((exam) => ({
    name: exam.name,
    slug: exam.slug,
    cycleYear,
    status:
      exam.cycles[0]?.phase === ExamCyclePhase.COMPLETE
        ? "cycle_ended"
        : "live",
  }));
}

/**
 * All ACTIVE exams with cycle status for the track wizard.
 */
export async function getExamsForTrack(): Promise<TrackExamOption[]> {
  const cycleYear = getExamCycleYear();

  const exams = await prisma.exam.findMany({
    where: { status: ExamStatus.ACTIVE },
    orderBy: { name: "asc" },
    include: {
      cycles: {
        where: { cycleYear },
        take: 1,
      },
    },
  });

  return exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    slug: exam.slug,
    cycleYear,
    cycleEnded: exam.cycles[0]?.phase === ExamCyclePhase.COMPLETE,
  }));
}

export async function getCurrentCyclePhase(
  examId: string,
): Promise<ExamCyclePhase | null> {
  const cycleYear = getExamCycleYear();
  const cycle = await prisma.examCycle.findUnique({
    where: {
      examId_cycleYear: {
        examId,
        cycleYear,
      },
    },
    select: { phase: true },
  });

  return cycle?.phase ?? null;
}
