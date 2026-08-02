import { SubscriptionStatus, type EventType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateSubscriptionInput = {
  userId: string;
  examId: string;
  eventTypes: EventType[];
};

/**
 * Creates a subscription linking a user to an exam with event type preferences.
 * Status defaults to ACTIVE via the database schema.
 */
export async function createSubscription(input: CreateSubscriptionInput) {
  return prisma.subscription.create({
    data: {
      userId: input.userId,
      examId: input.examId,
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
