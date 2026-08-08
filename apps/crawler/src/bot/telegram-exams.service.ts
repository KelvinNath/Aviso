import { ExamStatus, SubscriptionStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

/**
 * Returns all exams available for subscription (ACTIVE status only).
 */
export async function listActiveExams() {
  return prisma.exam.findMany({
    where: {
      status: ExamStatus.ACTIVE,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export function buildExamsListMessage(
  exams: { name: string; slug: string }[],
): string {
  if (exams.length === 0) {
    return "No exams are available for subscription yet. Check back soon.";
  }

  const examLines = exams
    .map((exam) => `• ${exam.name} — /subscribe ${exam.slug}`)
    .join("\n");

  return `Available exams:\n\n${examLines}\n\nSubscribe with /subscribe <slug>`;
}

export function buildSubscribeUsageMessage(
  exams: { name: string; slug: string }[],
): string {
  const list = buildExamsListMessage(exams);

  return `Usage: /subscribe <exam-slug>\n\n${list}`;
}

export async function buildUnsubscribeUsageMessage(
  chatId: string,
): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId: chatId },
  });

  if (!user) {
    return "Please send /start first.";
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

  if (subscriptions.length === 0) {
    return "You don't have any active subscriptions.\n\nUse /exams to see available exams.";
  }

  const lines = subscriptions
    .map((sub) => `• ${sub.exam.name} — /unsubscribe ${sub.exam.slug}`)
    .join("\n");

  return `Usage: /unsubscribe <exam-slug>\n\nYour active subscriptions:\n\n${lines}`;
}
