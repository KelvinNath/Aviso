import { EventType, SubscriptionStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

const JEE_MAIN_SLUG = "jee-main";

export const JEE_MAIN_SUBSCRIPTION_EVENT_TYPES = [
  EventType.RESULT,
  EventType.ADMIT_CARD_RELEASED,
  EventType.ANSWER_KEY,
  EventType.EXAM_DATE,
] as const;

export const JEE_MAIN_NOTIFICATION_TYPE_LABELS = [
  "Results",
  "Admit Cards",
  "Answer Keys",
  "Exam Dates",
] as const;

export type SubscribeResult =
  | "not_registered"
  | "already_subscribed"
  | "subscribed";

/**
 * Creates or reactivates a JEE Main subscription for a Telegram user.
 */
export async function subscribeToJeeMain(
  telegramChatId: string,
): Promise<SubscribeResult> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId },
  });

  if (!user) {
    return "not_registered";
  }

  const exam = await prisma.exam.findUnique({
    where: { slug: JEE_MAIN_SLUG },
  });

  if (!exam) {
    throw new Error(`Exam "${JEE_MAIN_SLUG}" not found. Run npm run db:seed first.`);
  }

  const existing = await prisma.subscription.findUnique({
    where: {
      userId_examId: {
        userId: user.id,
        examId: exam.id,
      },
    },
  });

  if (existing?.status === SubscriptionStatus.ACTIVE) {
    return "already_subscribed";
  }

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        eventTypes: [...JEE_MAIN_SUBSCRIPTION_EVENT_TYPES],
      },
    });

    return "subscribed";
  }

  await prisma.subscription.create({
    data: {
      userId: user.id,
      examId: exam.id,
      eventTypes: [...JEE_MAIN_SUBSCRIPTION_EVENT_TYPES],
      status: SubscriptionStatus.ACTIVE,
    },
  });

  return "subscribed";
}

export function buildSubscribeSuccessMessage(): string {
  const types = JEE_MAIN_NOTIFICATION_TYPE_LABELS.map((label) => `• ${label}`).join(
    "\n",
  );

  return `You're subscribed to JEE Main notifications for:\n${types}`;
}
