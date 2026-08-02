import { NotificationChannel } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import type { TelegramUser } from "../adapters/telegram.types.js";

const LINK_INVALID_MESSAGE =
  "This link is invalid or has expired.\n\nPlease generate a new one from your Aviso dashboard.";

const LINK_SUCCESS_MESSAGE =
  "✅ Telegram connected!\n\nYou'll now receive notifications instantly.";

export type LinkTelegramResult =
  | { status: "success"; message: string }
  | { status: "invalid"; message: string };

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
    return { status: "invalid", message: LINK_INVALID_MESSAGE };
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
    return { status: "invalid", message: LINK_INVALID_MESSAGE };
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

  return { status: "success", message: LINK_SUCCESS_MESSAGE };
}

export function getTelegramLinkSuccessMessage(): string {
  return LINK_SUCCESS_MESSAGE;
}

export function getTelegramLinkInvalidMessage(): string {
  return LINK_INVALID_MESSAGE;
}
