import { EventType, type Event } from "@prisma/client";

import type { TelegramInlineKeyboardMarkup } from "../adapters/telegram.types.js";
import { notificationKeyboard } from "./telegram-keyboard.js";
import { getSiteUrl } from "./telegram-site-config.js";

const MARKDOWN_V2_ESCAPE_PATTERN = /[_*[\]()~`>#+\-=|{}.!\\]/g;

type TypeHeading = {
  emoji: string;
  label: string;
};

const EVENT_TYPE_HEADINGS: Partial<Record<EventType, TypeHeading>> = {
  [EventType.RESULT]: { emoji: "📢", label: "Result Released" },
  [EventType.ANSWER_KEY]: { emoji: "📝", label: "Answer Key Released" },
  [EventType.ADMIT_CARD_RELEASED]: { emoji: "🎫", label: "Admit Card Released" },
  [EventType.EXAM_DATE]: { emoji: "📅", label: "Exam Schedule Update" },
  [EventType.APPLICATION_OPEN]: { emoji: "🟢", label: "Applications Open" },
  [EventType.APPLICATION_CLOSE]: { emoji: "🔴", label: "Applications Closed" },
  [EventType.COUNSELLING_OPEN]: { emoji: "🎓", label: "Counselling Started" },
  [EventType.COUNSELLING_CLOSE]: { emoji: "⛔", label: "Counselling Closed" },
};

const DEFAULT_TYPE_HEADING: TypeHeading = {
  emoji: "📢",
  label: "New Update",
};

export type TelegramNotificationPayload = {
  text: string;
  replyMarkup: TelegramInlineKeyboardMarkup;
};

/**
 * Escapes user-provided text for Telegram MarkdownV2 parse mode.
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(MARKDOWN_V2_ESCAPE_PATTERN, "\\$&");
}

/**
 * Escapes URL characters required inside MarkdownV2 link targets.
 */
export function escapeMarkdownV2Url(url: string): string {
  return url.replace(/[\\)/]/g, "\\$&");
}

function getTypeHeading(type: EventType): TypeHeading {
  return EVENT_TYPE_HEADINGS[type] ?? DEFAULT_TYPE_HEADING;
}

function bold(text: string): string {
  return `*${escapeMarkdownV2(text)}*`;
}

/**
 * Formats an exam event into a Telegram MarkdownV2 notification message.
 */
export function formatTelegramNotification(
  event: Event,
  examName: string,
): TelegramNotificationPayload {
  const typeHeading = getTypeHeading(event.type);
  const summary = event.summary.trim();
  const sourceUrl = event.sourceUrl.trim();

  const lines = [
    `🎓 ${bold(`${examName} Update`)}`,
    "",
    `${typeHeading.emoji} ${bold(typeHeading.label)}`,
    "",
    bold(event.title),
  ];

  if (summary) {
    lines.push("", escapeMarkdownV2(summary));
  }

  lines.push(
    "",
    escapeMarkdownV2(
      "No need to keep refreshing the website — this one made it to AvisoMe. 😄",
    ),
  );

  lines.push(
    "",
    "──────────────",
    "",
    `${escapeMarkdownV2("You're receiving this because you're tracking")} ${bold(examName)} ${escapeMarkdownV2("on AvisoMe.")}`,
  );

  return {
    text: lines.join("\n"),
    replyMarkup: sourceUrl
      ? notificationKeyboard(sourceUrl)
      : notificationKeyboard(getSiteUrl()),
  };
}
