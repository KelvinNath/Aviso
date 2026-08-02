import { NotificationChannel } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type FindOrCreateUserInput = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

/**
 * Finds an existing user by email, or creates one if none exists.
 * On every call, syncs mutable profile fields (displayName, avatarUrl) from
 * the OAuth provider without overwriting user-configured fields.
 */
export async function findOrCreateUser(input: FindOrCreateUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { email: input.email },
      data: {
        displayName: input.displayName ?? null,
        avatarUrl: input.avatarUrl ?? null,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: input.email,
      displayName: input.displayName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      preferredChannel: NotificationChannel.TELEGRAM,
    },
  });
}

const userProfileSelect = {
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  telegramChatId: true,
  preferredChannel: true,
} as const;

/**
 * Returns a user's profile fields by database id.
 * Returns null if no user exists for the given id.
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });
}
