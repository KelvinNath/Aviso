import { EventType, type Event } from "@prisma/client";

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

function formatLink(sourceUrl: string): string {
  const label = escapeMarkdownV2("🔗 Official notice");
  const url = escapeMarkdownV2Url(sourceUrl);

  return `[${label}](${url})`;
}

/**
 * Formats an exam event into a Telegram MarkdownV2 notification message.
 */
export function formatTelegramNotification(
  event: Event,
  examName: string,
): string {
  const typeHeading = getTypeHeading(event.type);
  const summary = event.summary.trim();

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
    escapeMarkdownV2("This notification was generated automatically."),
  );

  if (event.sourceUrl.trim()) {
    lines.push("", formatLink(event.sourceUrl.trim()));
  }

  lines.push(
    "",
    "━━━━━━━━━━━━━━",
    "",
    `${escapeMarkdownV2("You're receiving this because you're subscribed to")} ${bold(examName)}${escapeMarkdownV2(".")}`,
    "",
    escapeMarkdownV2("Use /unsubscribe <exam-slug> to stop notifications."),
  );

  return lines.join("\n");
}
