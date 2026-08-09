import { SubscriptionStatus, type EventType } from "@prisma/client";

import { CURRENT_CYCLE_YEAR } from "@/services/exam.service";
import { prisma } from "@/lib/prisma";

type CreateSubscriptionInput = {
  userId: string;
  examId: string;
  eventTypes: EventType[];
};

/**
 * Creates or reactivates a subscription linking a user to an exam.
 * Cancelled subscriptions are reactivated; active ones get updated event types.
 */
export async function createSubscription(input: CreateSubscriptionInput) {
  return prisma.subscription.upsert({
    where: {
      userId_examId: {
        userId: input.userId,
        examId: input.examId,
      },
    },
    create: {
      userId: input.userId,
      examId: input.examId,
      eventTypes: input.eventTypes,
    },
    update: {
      status: SubscriptionStatus.ACTIVE,
      eventTypes: input.eventTypes,
    },
  });
}

/**
 * Returns active subscriptions for a user, newest first, with selected exam fields.
 */
export async function findSubscriptionsByUserId(userId: string) {
  return prisma.subscription.findMany({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      status: true,
      eventTypes: true,
      createdAt: true,
      exam: {
        select: {
          id: true,
          name: true,
          slug: true,
          cycles: {
            where: { cycleYear: CURRENT_CYCLE_YEAR },
            select: {
              phase: true,
              cycleYear: true,
            },
            take: 1,
          },
        },
      },
    },
  });
}

/**
 * Soft-deletes a subscription by setting status to CANCELLED.
 * Returns null if the subscription does not exist or does not belong to the user.
 */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string,
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription || subscription.userId !== userId) {
    return null;
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: SubscriptionStatus.CANCELLED },
  });
}
