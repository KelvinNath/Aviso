import { EventType, SubscriptionStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

/**
 * Returns active subscriptions with exam names and event types for a linked user.
 */
export async function getActiveSubscriptionSummaries(chatId: string): Promise<
  { examName: string; eventTypes: EventType[] }[]
> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId: chatId },
  });

  if (!user) {
    return [];
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
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

  return subscriptions.map((subscription) => ({
    examName: subscription.exam.name,
    eventTypes: subscription.eventTypes,
  }));
}
