import { SubscriptionStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

const JEE_MAIN_SLUG = "jee-main";

/**
 * Cancels the user's active JEE Main subscription.
 */
export async function unsubscribe(chatId: string): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId: chatId },
  });

  if (!user) {
    return "Please send /start first.";
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: SubscriptionStatus.ACTIVE,
      exam: {
        slug: JEE_MAIN_SLUG,
      },
    },
  });

  if (!subscription) {
    return "You're not subscribed to JEE Main.";
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELLED,
    },
  });

  return `You've been unsubscribed from JEE Main notifications.

You can subscribe again anytime using /subscribe.`;
}
