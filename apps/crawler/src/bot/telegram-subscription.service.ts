import {
  EventType,
  ExamStatus,
  SubscriptionStatus,
  type Exam,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";

export const DEFAULT_BOT_EVENT_TYPES = [
  EventType.RESULT,
  EventType.ADMIT_CARD_RELEASED,
  EventType.ANSWER_KEY,
  EventType.EXAM_DATE,
] as const;

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.RESULT]: "Results",
  [EventType.ADMIT_CARD_RELEASED]: "Admit Cards",
  [EventType.ANSWER_KEY]: "Answer Keys",
  [EventType.EXAM_DATE]: "Exam Dates",
  [EventType.APPLICATION_OPEN]: "Application Open",
  [EventType.APPLICATION_CLOSE]: "Application Deadlines",
  [EventType.COUNSELLING_OPEN]: "Counselling Open",
  [EventType.COUNSELLING_CLOSE]: "Counselling Close",
};

export type SubscribeResult =
  | { status: "not_registered" }
  | { status: "already_subscribed"; examName: string }
  | { status: "subscribed"; examName: string; eventTypes: EventType[] }
  | { status: "exam_not_found"; slug: string }
  | { status: "exam_not_active"; examName: string; slug: string };

export type UnsubscribeResult =
  | { status: "not_registered" }
  | { status: "not_subscribed"; examName: string; slug: string }
  | { status: "unsubscribed"; examName: string; slug: string }
  | { status: "exam_not_found"; slug: string };

function formatEventTypeLabels(eventTypes: readonly EventType[]): string {
  return eventTypes
    .map((type) => `• ${EVENT_TYPE_LABELS[type]}`)
    .join("\n");
}

export function buildSubscribeSuccessMessage(
  examName: string,
  eventTypes: readonly EventType[],
): string {
  const types = formatEventTypeLabels(eventTypes);

  return `You're subscribed to ${examName} notifications for:\n${types}`;
}

export function buildAlreadySubscribedMessage(examName: string): string {
  return `You're already subscribed to ${examName} notifications.`;
}

export function buildExamNotActiveMessage(examName: string, slug: string): string {
  return `${examName} (${slug}) is not available for subscriptions yet. Use /exams to see active exams.`;
}

export function buildExamNotFoundMessage(slug: string): string {
  return `Exam "${slug}" not found. Use /exams to see available exams.`;
}

export function buildUnsubscribeSuccessMessage(
  examName: string,
  slug: string,
): string {
  return `You've been unsubscribed from ${examName} notifications.

You can subscribe again anytime using /subscribe ${slug}.`;
}

async function findExamBySlug(slug: string): Promise<Exam | null> {
  return prisma.exam.findUnique({
    where: { slug },
  });
}

/**
 * Creates or reactivates a subscription for an active exam.
 */
export async function subscribeToExam(
  telegramChatId: string,
  examSlug: string,
): Promise<SubscribeResult> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId },
  });

  if (!user) {
    return { status: "not_registered" };
  }

  const exam = await findExamBySlug(examSlug.trim().toLowerCase());

  if (!exam) {
    return { status: "exam_not_found", slug: examSlug };
  }

  if (exam.status !== ExamStatus.ACTIVE) {
    return { status: "exam_not_active", examName: exam.name, slug: exam.slug };
  }

  const eventTypes = [...DEFAULT_BOT_EVENT_TYPES];

  const existing = await prisma.subscription.findUnique({
    where: {
      userId_examId: {
        userId: user.id,
        examId: exam.id,
      },
    },
  });

  if (existing?.status === SubscriptionStatus.ACTIVE) {
    return { status: "already_subscribed", examName: exam.name };
  }

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        eventTypes,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        examId: exam.id,
        eventTypes,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  return { status: "subscribed", examName: exam.name, eventTypes };
}

/**
 * Cancels an active subscription for the given exam slug.
 */
export async function unsubscribeFromExam(
  telegramChatId: string,
  examSlug: string,
): Promise<UnsubscribeResult> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId },
  });

  if (!user) {
    return { status: "not_registered" };
  }

  const exam = await findExamBySlug(examSlug.trim().toLowerCase());

  if (!exam) {
    return { status: "exam_not_found", slug: examSlug };
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      examId: exam.id,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  if (!subscription) {
    return { status: "not_subscribed", examName: exam.name, slug: exam.slug };
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELLED,
    },
  });

  return { status: "unsubscribed", examName: exam.name, slug: exam.slug };
}