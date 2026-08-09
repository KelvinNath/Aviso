import { SubscriptionStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

const TELEGRAM_ONLY_EMAIL_PATTERN = /^telegram\+\d+@aviso\.local$/;

export type TelegramAccountState = "visitor" | "connected";

export type AvisoUserRecord = {
  id: string;
  email: string;
  telegramChatId: string | null;
  displayName: string | null;
};

/**
 * Bot-only accounts created via plain /start use a synthetic local email.
 */
export function isSyntheticTelegramEmail(email: string): boolean {
  return TELEGRAM_ONLY_EMAIL_PATTERN.test(email);
}

/**
 * A connected user has Telegram linked to a real AvisoMe website account.
 */
export function isConnectedAvisoUser(
  user: Pick<AvisoUserRecord, "email" | "telegramChatId">,
): boolean {
  return Boolean(user.telegramChatId) && !isSyntheticTelegramEmail(user.email);
}

export function getTelegramAccountState(
  user: AvisoUserRecord | null,
): TelegramAccountState {
  if (!user) {
    return "visitor";
  }

  return isConnectedAvisoUser(user) ? "connected" : "visitor";
}

export async function findUserByTelegramChatId(
  chatId: string,
): Promise<AvisoUserRecord | null> {
  return prisma.user.findFirst({
    where: { telegramChatId: chatId },
    select: {
      id: true,
      email: true,
      telegramChatId: true,
      displayName: true,
    },
  });
}

export async function countActiveSubscriptions(userId: string): Promise<number> {
  return prisma.subscription.count({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
  });
}
