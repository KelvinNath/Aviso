import {
  NotificationStatus,
  SubscriptionStatus,
  type Event,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";

/**
 * Creates pending notification records for every subscription
 * interested in the given event.
 */
export async function createNotificationsForEvent(
  event: Event,
): Promise<{ createdCount: number }> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      examId: event.examId,
      status: SubscriptionStatus.ACTIVE,
      eventTypes: {
        has: event.type,
      },
    },
    select: {
      id: true,
    },
  });

  if (subscriptions.length === 0) {
    return { createdCount: 0 };
  }

  const notifications = subscriptions.map((subscription) => ({
    eventId: event.id,
    subscriptionId: subscription.id,
    status: NotificationStatus.PENDING,
  }));

  const result = await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true,
  });

  return { createdCount: result.count };
}
