import { prisma } from "@/lib/prisma";

/**
 * Returns all events, newest first, with each event's related exam name and slug.
 */
export async function getEvents() {
  return prisma.event.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      exam: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}
