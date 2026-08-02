import { ExamStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Returns all active exams, ordered alphabetically by name.
 * Archived exams are excluded from the result.
 */
export async function getActiveExams() {
  return prisma.exam.findMany({
    where: {
      status: ExamStatus.ACTIVE,
    },
    orderBy: {
      name: "asc",
    },
  });
}
