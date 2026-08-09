import type { TelegramInlineKeyboardMarkup } from "../adapters/telegram.types.js";
import {
  getDashboardUrl,
  getSignUpUrl,
  getSiteUrl,
  getTrackExamsUrl,
} from "./telegram-site-config.js";

export function createAccountKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🚀 Create Free Account", url: getSignUpUrl() }],
      [{ text: "📚 View Exams", url: `${getSiteUrl()}/#exams` }],
      [{ text: "ℹ️ How It Works", url: `${getSiteUrl()}/#how-it-works` }],
    ],
  };
}

export function openAvisoKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: "🌐 Open AvisoMe", url: getSiteUrl() }]],
  };
}

export function startTrackingKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: "🚀 Start Tracking", url: getTrackExamsUrl() }]],
  };
}

export function dashboardKeyboard(
  label = "📊 Open My Dashboard",
): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: label, url: getDashboardUrl() }]],
  };
}

export function manageExamsKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: "⚙️ Manage My Exams", url: getTrackExamsUrl() }]],
  };
}

export function manageNotificationsKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "⚙️ Manage Notifications", url: getDashboardUrl() }],
    ],
  };
}

export function notificationKeyboard(
  sourceUrl: string,
): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🔗 Official Notice", url: sourceUrl }],
      [{ text: "⚙️ Manage Notifications", url: getDashboardUrl() }],
    ],
  };
}
