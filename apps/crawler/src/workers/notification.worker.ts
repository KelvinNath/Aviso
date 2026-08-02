import { NotificationStatus } from "@prisma/client";

import { sendMessage } from "../adapters/telegram.adapter.js";
import { prisma } from "../lib/prisma.js";

/**
 * Processes pending notifications by sending them via Telegram
 * and updating delivery status per notification.
 */
export async function processPendingNotifications(): Promise<void> {
  const notifications = await prisma.notification.findMany({
    where: {
      status: NotificationStatus.PENDING,
    },
    include: {
      event: true,
      subscription: {
        include: {
          user: true,
        },
      },
    },
  });

  for (const notification of notifications) {
    try {
      const { user } = notification.subscription;
      const { event } = notification;

      if (!user.telegramChatId) {
        throw new Error("User has no telegramChatId");
      }

      const recipientName = user.displayName ?? user.email;
      const message = `Sending notification to ${recipientName}\nEvent: ${event.title}`;

      await sendMessage(user.telegramChatId, message);

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          attemptedAt: new Date(),
          failureReason: message,
        },
      });
    }
  }
}
