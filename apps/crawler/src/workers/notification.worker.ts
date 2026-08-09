import { NotificationStatus } from "@prisma/client";

import { sendMessage } from "../adapters/telegram.adapter.js";
import { formatTelegramNotification } from "../bot/telegram-message-formatter.js";
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
      event: {
        include: {
          exam: true,
        },
      },
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

      const telegramPayload = formatTelegramNotification(event, event.exam.name);

      await sendMessage(user.telegramChatId, telegramPayload.text, {
        parseMode: "MarkdownV2",
        replyMarkup: telegramPayload.replyMarkup,
      });

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
