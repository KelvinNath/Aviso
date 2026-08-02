import { NotificationChannel } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import type { TelegramUser } from "../adapters/telegram.types.js";

function buildDisplayName(user: TelegramUser): string {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  if (user.username) {
    return `@${user.username}`;
  }

  return `Telegram User ${user.id}`;
}

function buildTelegramEmail(telegramUserId: number): string {
  return `telegram+${telegramUserId}@aviso.local`;
}

/**
 * Links a Telegram user to a database User record.
 * Matches by telegramChatId first, then upserts by synthetic email.
 */
export async function upsertTelegramUser(
  telegramUser: TelegramUser,
  chatId: number,
) {
  const telegramChatId = String(chatId);
  const displayName = buildDisplayName(telegramUser);

  const existingByChatId = await prisma.user.findFirst({
    where: { telegramChatId },
  });

  if (existingByChatId) {
    return prisma.user.update({
      where: { id: existingByChatId.id },
      data: {
        displayName,
        preferredChannel: NotificationChannel.TELEGRAM,
        telegramChatId,
      },
    });
  }

  const email = buildTelegramEmail(telegramUser.id);

  return prisma.user.upsert({
    where: { email },
    update: {
      displayName,
      telegramChatId,
      preferredChannel: NotificationChannel.TELEGRAM,
    },
    create: {
      email,
      displayName,
      telegramChatId,
      preferredChannel: NotificationChannel.TELEGRAM,
    },
  });
}
