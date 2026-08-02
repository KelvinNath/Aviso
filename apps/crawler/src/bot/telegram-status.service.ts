import { EventType, SubscriptionStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.RESULT]: "Results",
  [EventType.ANSWER_KEY]: "Answer Keys",
  [EventType.ADMIT_CARD_RELEASED]: "Admit Cards",
  [EventType.EXAM_DATE]: "Exam Dates",
  [EventType.APPLICATION_OPEN]: "Application Open",
  [EventType.APPLICATION_CLOSE]: "Application Closed",
  [EventType.COUNSELLING_OPEN]: "Counselling Open",
  [EventType.COUNSELLING_CLOSE]: "Counselling Closed",
};

const EVENT_TYPE_DISPLAY_ORDER: EventType[] = [
  EventType.RESULT,
  EventType.ADMIT_CARD_RELEASED,
  EventType.ANSWER_KEY,
  EventType.EXAM_DATE,
  EventType.APPLICATION_OPEN,
  EventType.APPLICATION_CLOSE,
  EventType.COUNSELLING_OPEN,
  EventType.COUNSELLING_CLOSE,
];

function formatEventTypes(eventTypes: EventType[]): string {
  const enabledTypes = new Set(eventTypes);

  return EVENT_TYPE_DISPLAY_ORDER.filter((type) => enabledTypes.has(type))
    .map((type) => `• ${EVENT_TYPE_LABELS[type]}`)
    .join("\n");
}

function formatSubscriptionBlock(examName: string, eventTypes: EventType[]): string {
  const typeLines = formatEventTypes(eventTypes);

  return typeLines ? `✅ ${examName}\n\n${typeLines}` : `✅ ${examName}`;
}

/**
 * Returns a human-readable summary of the user's active exam subscriptions.
 */
export async function getSubscriptionStatus(chatId: string): Promise<string> {
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
    return `You don't have any active subscriptions.

Use /subscribe to subscribe to JEE Main.`;
  }

  const subscriptionBlocks = subscriptions.map((subscription) =>
    formatSubscriptionBlock(subscription.exam.name, subscription.eventTypes),
  );

  return `📋 Your active subscriptions\n\n${subscriptionBlocks.join("\n\n")}`;
}
