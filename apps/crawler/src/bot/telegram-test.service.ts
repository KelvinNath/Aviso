import { EventType, type Event } from "@prisma/client";

import { sendMessage } from "../adapters/telegram.adapter.js";
import { prisma } from "../lib/prisma.js";
import { formatTelegramNotification } from "./telegram-message-formatter.js";

const JEE_MAIN_SLUG = "jee-main";
const MOCK_SOURCE_URL = "https://jeemain.nta.nic.in/";

const TEST_TYPE_ALIASES: Record<string, EventType> = {
  result: EventType.RESULT,
  admit: EventType.ADMIT_CARD_RELEASED,
  answerkey: EventType.ANSWER_KEY,
  examdate: EventType.EXAM_DATE,
  applicationopen: EventType.APPLICATION_OPEN,
  applicationclose: EventType.APPLICATION_CLOSE,
  counsellingopen: EventType.COUNSELLING_OPEN,
  counsellingclose: EventType.COUNSELLING_CLOSE,
};

const MOCK_EVENT_CONTENT: Record<
  EventType,
  { title: string; summary: string }
> = {
  [EventType.RESULT]: {
    title: "JEE Main Session 2 Result Declared",
    summary:
      "NTA scores for JEE (Main) Session 2 are now available on the official portal.",
  },
  [EventType.ADMIT_CARD_RELEASED]: {
    title: "JEE Main Admit Card Released",
    summary:
      "Admit cards for the upcoming JEE Main session can be downloaded from the candidate login portal.",
  },
  [EventType.ANSWER_KEY]: {
    title: "JEE Main Final Answer Key Published",
    summary:
      "The final answer key for JEE (Main) has been released along with recorded responses.",
  },
  [EventType.EXAM_DATE]: {
    title: "JEE Main Exam Schedule Updated",
    summary:
      "Revised examination dates and session timings have been published on the official website.",
  },
  [EventType.APPLICATION_OPEN]: {
    title: "JEE Main Registration Started",
    summary:
      "Online applications for JEE (Main) are now open on the official NTA portal.",
  },
  [EventType.APPLICATION_CLOSE]: {
    title: "JEE Main Registration Closing Tomorrow",
    summary:
      "The last date to submit the online application form is approaching. Complete your registration soon.",
  },
  [EventType.COUNSELLING_OPEN]: {
    title: "JEE Main Counselling Started",
    summary:
      "JoSAA counselling registration and choice filling have commenced for qualified candidates.",
  },
  [EventType.COUNSELLING_CLOSE]: {
    title: "JEE Main Counselling Registration Ends Today",
    summary:
      "Today is the final day to complete counselling registration for the current round.",
  },
};

export const TEST_COMMAND_USAGE = `Usage:
/test result
/test admit
/test answerkey
/test examdate
/test applicationopen
/test applicationclose
/test counsellingopen
/test counsellingclose`;

export const TEST_COMMAND_ADMIN_ONLY_MESSAGE =
  "Sorry, this command is only available to the bot administrator.";

function normalizeChatId(chatId: string | number | undefined): string | null {
  if (chatId === undefined || chatId === null) {
    return null;
  }

  const normalized = String(chatId).trim();

  return normalized.length > 0 ? normalized : null;
}

/**
 * Returns true when the chat belongs to the configured bot administrator.
 */
export function isAdminChat(chatId: string | number): boolean {
  const incomingChatId = normalizeChatId(chatId);
  const adminChatId = normalizeChatId(process.env.TELEGRAM_ADMIN_CHAT_ID);

  if (!incomingChatId || !adminChatId) {
    return false;
  }

  return incomingChatId === adminChatId;
}

/**
 * Maps a /test command argument to an EventType, if supported.
 */
export function parseTestEventType(argument: string): EventType | null {
  return TEST_TYPE_ALIASES[argument.toLowerCase()] ?? null;
}

function buildMockEvent(examId: string, type: EventType): Event {
  const content = MOCK_EVENT_CONTENT[type];
  const now = new Date();

  return {
    id: "test-preview",
    examId,
    examSourceId: "test-preview",
    type,
    title: content.title,
    summary: content.summary,
    sourceUrl: MOCK_SOURCE_URL,
    fingerprint: `test-preview-${type.toLowerCase()}`,
    publishedAt: now,
    detectedAt: now,
    effectiveDate: null,
    createdAt: now,
  };
}

/**
 * Sends a formatted preview notification without touching the database or worker.
 */
export async function sendTestNotification(
  chatId: string,
  type: EventType,
): Promise<void> {
  const exam = await prisma.exam.findUnique({
    where: { slug: JEE_MAIN_SLUG },
  });

  if (!exam) {
    throw new Error(
      `Exam "${JEE_MAIN_SLUG}" not found. Run npm run db:seed first.`,
    );
  }

  const mockEvent = buildMockEvent(exam.id, type);
  const message = formatTelegramNotification(mockEvent, exam.name);

  await sendMessage(chatId, message, "MarkdownV2");
}
