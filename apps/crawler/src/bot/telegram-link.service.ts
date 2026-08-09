import { NotificationChannel } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import type { TelegramUser } from "../adapters/telegram.types.js";

export type LinkTelegramResult =
  | { status: "success"; userId: string }
  | { status: "invalid" };

function buildTelegramDisplayName(user: TelegramUser): string {
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

function buildTelegramHandle(user: TelegramUser): string | null {
  return user.username ? `@${user.username}` : null;
}

/**
 * Links a Telegram account to an existing web user via a one-time deep-link code.
 * Does not create synthetic telegram+...@aviso.local users.
 */
export async function linkTelegramAccountWithCode(
  code: string,
  telegramUser: TelegramUser,
  chatId: number,
): Promise<LinkTelegramResult> {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { status: "invalid" };
  }

  const user = await prisma.user.findFirst({
    where: {
      linkCode: normalizedCode,
      linkCodeExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return { status: "invalid" };
  }

  const telegramChatId = String(chatId);
  const telegramUserId = String(telegramUser.id);
  const telegramHandle = buildTelegramHandle(telegramUser);

  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: {
        telegramChatId,
        id: { not: user.id },
      },
      data: {
        telegramChatId: null,
        telegramUserId: null,
        telegramUsername: null,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        telegramChatId,
        telegramUserId,
        telegramUsername: telegramHandle,
        displayName:
          user.displayName ??
          telegramHandle ??
          buildTelegramDisplayName(telegramUser),
        linkCode: null,
        linkCodeExpiresAt: null,
        preferredChannel: NotificationChannel.TELEGRAM,
      },
    });
  });

  return { status: "success", userId: user.id };
}

/**
 * Clears Telegram linkage for a user and restores visitor command scope on disconnect.
 */
export async function unlinkTelegramAccount(chatId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { telegramChatId: chatId },
    data: {
      telegramChatId: null,
      telegramUserId: null,
      telegramUsername: null,
    },
  });
}
