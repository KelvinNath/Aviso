import { ExamCyclePhase, ExamStatus, SubscriptionStatus } from "@prisma/client";
import { getExamCycleYear } from "@aviso/shared-utils";

import { prisma } from "../lib/prisma.js";

/**
 * Returns all exams available for subscription (ACTIVE status, live cycle only).
 */
export async function listActiveExams() {
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

export async function listTrackedExamNames(userId: string): Promise<string[]> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
    include: {
      exam: true,
    },
    orderBy: {
      exam: {
        name: "asc",
      },
    },
  });

  return subscriptions.map((subscription) => subscription.exam.name);
}
