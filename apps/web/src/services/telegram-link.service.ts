import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const LINK_CODE_LENGTH = 6;
const LINK_CODE_TTL_MS = 10 * 60 * 1000;
const LINK_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

let cachedBotUsername: string | undefined;

function getBotUsernameFromEnv(): string | null {
  const username =
    process.env.TELEGRAM_BOT_USERNAME ??
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  if (!username?.trim()) {
    return null;
  }

  return username.replace(/^@/, "");
}

async function resolveBotUsername(): Promise<string> {
  const fromEnv = getBotUsernameFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  if (cachedBotUsername) {
    return cachedBotUsername;
  }

  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not configured");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  if (!response.ok) {
    throw new Error("Failed to resolve Telegram bot username from BOT_TOKEN");
  }

  const data = (await response.json()) as {
    ok: boolean;
    result?: { username?: string };
  };

  const username = data.result?.username;
  if (!username) {
    throw new Error("NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not configured");
  }

  cachedBotUsername = username;
  return username;
}

async function buildDeepLink(code: string): Promise<string> {
  const username = await resolveBotUsername();
  return `https://t.me/${username}?start=${code}`;
}

export type TelegramLinkResult = {
  code: string;
  deepLink: string;
};

function generateLinkCode(): string {
  const bytes = randomBytes(LINK_CODE_LENGTH);
  return Array.from(
    bytes,
    (byte) => LINK_CODE_CHARSET[byte % LINK_CODE_CHARSET.length],
  ).join("");
}

async function createUniqueLinkCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateLinkCode();
    const existing = await prisma.user.findUnique({
      where: { linkCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Failed to generate a unique link code");
}

/**
 * Creates a one-time Telegram deep-link code for the authenticated user.
 * Codes expire after 10 minutes.
 */
export async function createTelegramLinkForUser(
  userId: string,
): Promise<TelegramLinkResult> {
  const code = await createUniqueLinkCode();
  const linkCodeExpiresAt = new Date(Date.now() + LINK_CODE_TTL_MS);

  await prisma.user.update({
    where: { id: userId },
    data: {
      linkCode: code,
      linkCodeExpiresAt,
    },
  });

  return {
    code,
    deepLink: await buildDeepLink(code),
  };
}
