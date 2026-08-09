import type { EventType } from "@prisma/client";

import type { TelegramInlineKeyboardMarkup } from "../adapters/telegram.types.js";
import {
  createAccountKeyboard,
  dashboardKeyboard,
  manageExamsKeyboard,
  openAvisoKeyboard,
  startTrackingKeyboard,
} from "./telegram-keyboard.js";
import { getSignUpUrl, getSiteUrl } from "./telegram-site-config.js";

export type BotMessagePayload = {
  text: string;
  parseMode?: "MarkdownV2";
  replyMarkup?: TelegramInlineKeyboardMarkup;
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  RESULT: "Results",
  ADMIT_CARD_RELEASED: "Admit Cards",
  ANSWER_KEY: "Answer Keys",
  EXAM_DATE: "Exam Dates",
  APPLICATION_OPEN: "Application Open",
  APPLICATION_CLOSE: "Application Deadlines",
  COUNSELLING_OPEN: "Counselling Open",
  COUNSELLING_CLOSE: "Counselling Close",
};

const EVENT_TYPE_DISPLAY_ORDER: EventType[] = [
  "RESULT",
  "ADMIT_CARD_RELEASED",
  "ANSWER_KEY",
  "EXAM_DATE",
  "APPLICATION_OPEN",
  "APPLICATION_CLOSE",
  "COUNSELLING_OPEN",
  "COUNSELLING_CLOSE",
];

function formatExamBulletList(exams: { name: string }[]): string {
  if (exams.length === 0) {
    return "No exams are available right now. Check back soon.";
  }

  return exams.map((exam) => `• ${exam.name}`).join("\n");
}

export function formatEventTypeLabels(eventTypes: readonly EventType[]): string {
  const enabledTypes = new Set(eventTypes);

  return EVENT_TYPE_DISPLAY_ORDER.filter((type) => enabledTypes.has(type))
    .map((type) => `• ${EVENT_TYPE_LABELS[type]}`)
    .join("\n");
}

export function getVisitorStartMessage(): BotMessagePayload {
  return {
    text: [
      "👋 Welcome to AvisoMe",
      "",
      "We keep an eye on official exam websites so you don't have to keep refreshing them like it's a full-time job.",
      "",
      "Get alerts for:",
      "📢 Results",
      "🎫 Admit Cards",
      "📝 Answer Keys",
      "📅 Exam Dates",
      "🟢 Applications",
      "🔴 Deadlines",
      "",
      "Create a free account, pick the exams you care about, and let AvisoMe do the watching.",
    ].join("\n"),
    replyMarkup: createAccountKeyboard(),
  };
}

export function getConnectedStartMessage(
  trackedExamCount: number,
): BotMessagePayload {
  const trackingLine =
    trackedExamCount > 0
      ? `\n\nYou're currently tracking ${trackedExamCount} exam${trackedExamCount === 1 ? "" : "s"}.`
      : "";

  return {
    text: [
      "👋 Welcome back to AvisoMe.",
      "",
      "Your exam alerts land right here. Manage what you track anytime from your dashboard.",
      trackingLine,
    ]
      .join("\n")
      .trim(),
    replyMarkup: dashboardKeyboard(),
  };
}

export function getLinkSuccessMessage(
  trackedExamCount: number,
): BotMessagePayload {
  const trackingLine =
    trackedExamCount > 0
      ? `\n\nYou're currently tracking ${trackedExamCount} exam${trackedExamCount === 1 ? "" : "s"}.`
      : "";

  return {
    text: [
      "✅ You're connected!",
      "",
      "AvisoMe will now send your exam alerts right here.",
      "",
      "No more refreshing exam websites every five minutes. We've got the watching part. 😄",
      trackingLine,
    ]
      .join("\n")
      .trim(),
    replyMarkup: dashboardKeyboard("📊 Open My Dashboard"),
  };
}

export function getLinkInvalidMessage(): BotMessagePayload {
  return {
    text: [
      "This link is invalid or has expired.",
      "",
      "Generate a fresh one from your AvisoMe dashboard and try again.",
    ].join("\n"),
    replyMarkup: dashboardKeyboard("🚀 Open AvisoMe"),
  };
}

export function getVisitorHelpMessage(): BotMessagePayload {
  return {
    text: [
      "ℹ️ AvisoMe watches official exam portals and lets you know when something important changes.",
      "",
      "The easiest way to get started:",
      "",
      "1. Create a free account",
      "2. Pick your exams",
      "3. Choose the updates you care about",
      "4. Connect Telegram",
      "5. Get notified here",
    ].join("\n"),
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🚀 Create Account", url: getSignUpUrl() }],
        [{ text: "🌐 Open AvisoMe", url: getSiteUrl() }],
      ],
    },
  };
}

export function getConnectedHelpMessage(): BotMessagePayload {
  return {
    text: [
      "ℹ️ AvisoMe keeps an eye on official exam portals and sends important updates here.",
      "",
      "You can:",
      "• Check what you're tracking with /status",
      "• Browse available exams with /exams",
      "• Manage your exams and notification preferences from the website",
    ].join("\n"),
    replyMarkup: openAvisoKeyboard(),
  };
}

export function getVisitorExamsMessage(
  exams: { name: string }[],
): BotMessagePayload {
  return {
    text: [
      "🎓 Exams AvisoMe currently watches",
      "",
      "Engineering",
      formatExamBulletList(exams),
      "",
      "Want personalized alerts?",
      "Create your free AvisoMe account and choose exactly what you want to track.",
    ].join("\n"),
    replyMarkup: startTrackingKeyboard(),
  };
}

export function getConnectedExamsMessage(
  exams: { name: string }[],
  trackedExamNames: string[],
): BotMessagePayload {
  const trackedSection =
    trackedExamNames.length > 0
      ? ["You're currently tracking:", ...trackedExamNames.map((name) => `✓ ${name}`)].join(
          "\n",
        )
      : "You're not tracking any exams yet.";

  return {
    text: [
      "🎓 Exams on AvisoMe",
      "",
      trackedSection,
      "",
      "Want to add another one?",
      "",
      "Head to your dashboard and choose your exams there.",
    ].join("\n"),
    replyMarkup: manageExamsKeyboard(),
  };
}

export function getVisitorStatusMessage(): BotMessagePayload {
  return {
    text: [
      "🔐 You're not connected to an AvisoMe account yet.",
      "",
      "Create a free account, choose your exams, and connect Telegram to start receiving personalized alerts.",
    ].join("\n"),
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🚀 Create Free Account", url: getSignUpUrl() }],
      ],
    },
  };
}

export function getSubscribeRedirectMessage(): BotMessagePayload {
  return {
    text: [
      "🔐 Let's do this the AvisoMe way.",
      "",
      "Create a free account on the website, choose the exams and updates you care about, and we'll send the alerts here.",
    ].join("\n"),
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🚀 Create Free Account", url: getSignUpUrl() }],
      ],
    },
  };
}

export function getConnectedSubscribeRedirectMessage(): BotMessagePayload {
  return {
    text: [
      "Your exams and notification preferences live on the AvisoMe website — that's where you pick what we watch for you.",
      "",
      "Head to your dashboard to add or change exams.",
    ].join("\n"),
    replyMarkup: manageExamsKeyboard(),
  };
}

export function getUnsubscribeRedirectMessage(): BotMessagePayload {
  return {
    text: [
      "There's nothing to unsubscribe from yet 😄",
      "",
      "Once you create an AvisoMe account and start tracking exams, you can manage everything from your dashboard.",
    ].join("\n"),
    replyMarkup: openAvisoKeyboard(),
  };
}

export function getConnectedUnsubscribeRedirectMessage(): BotMessagePayload {
  return {
    text: [
      "You can manage your exams and notification preferences from your AvisoMe dashboard.",
      "",
      "That's the best place to stop tracking an exam or fine-tune what you receive.",
    ].join("\n"),
    replyMarkup: manageExamsKeyboard(),
  };
}

export function getConnectedStatusMessage(
  subscriptions: { examName: string; eventTypes: EventType[] }[],
): BotMessagePayload {
  if (subscriptions.length === 0) {
    return {
      text: [
        "You're connected, but you're not tracking any exams yet.",
        "",
        "Pick your exams and notification preferences from your AvisoMe dashboard.",
      ].join("\n"),
      replyMarkup: startTrackingKeyboard(),
    };
  }

  const blocks = subscriptions.map((subscription) => {
    const typeLines = formatEventTypeLabels(subscription.eventTypes);
    return [`🎓 ${subscription.examName}`, typeLines].filter(Boolean).join("\n");
  });

  return {
    text: [
      "📋 Your AvisoMe tracking",
      "",
      blocks.join("\n\n"),
      "",
      "You're all set. We'll handle the watching.",
    ].join("\n"),
    replyMarkup: manageExamsKeyboard(),
  };
}

export function getEmptyExamsMessage(): BotMessagePayload {
  return {
    text: "No exams are available for tracking right now. Check back soon.",
    replyMarkup: openAvisoKeyboard(),
  };
}
