import { escapeMarkdownV2 } from "./telegram-message-formatter.js";

function bold(text: string): string {
  return `*${escapeMarkdownV2(text)}*`;
}

function commandLine(command: string, description: string): string {
  return `${escapeMarkdownV2(command)} — ${escapeMarkdownV2(description)}`;
}

/**
 * Onboarding message sent after /start.
 */
export function getWelcomeMessage(): string {
  return [
    "👋 " + bold("Welcome to Aviso"),
    "",
    escapeMarkdownV2(
      "Aviso automatically monitors official exam websites and instantly notifies you whenever important announcements are published.",
    ),
    "",
    escapeMarkdownV2("You'll receive alerts for:"),
    "",
    "📢 Results",
    "🎫 Admit Cards",
    "📝 Answer Keys",
    "📅 Exam Dates",
    "🟢 Application Openings",
    "🔴 Application Deadlines",
    "",
    bold("Getting Started"),
    "",
    escapeMarkdownV2("1. Use /exams to see available exams."),
    escapeMarkdownV2("2. Use /subscribe <slug> to subscribe."),
    escapeMarkdownV2("3. Use /status to check your subscriptions."),
    escapeMarkdownV2("4. Use /unsubscribe <slug> anytime."),
    "",
    bold("Available Commands"),
    "",
    commandLine("/start", "Register and see this welcome message"),
    commandLine("/help", "Show help and command reference"),
    commandLine("/exams", "List exams available for subscription"),
    commandLine("/subscribe", "Subscribe to an exam — /subscribe <slug>"),
    commandLine("/status", "View your active subscriptions"),
    commandLine("/unsubscribe", "Stop notifications — /unsubscribe <slug>"),
    "",
    // Future commands: /latest, /settings, /feedback — extend Available Commands here.
  ].join("\n");
}

/**
 * Full help page sent after /help.
 */
export function getHelpMessage(): string {
  return [
    bold("Aviso Help"),
    "",
    escapeMarkdownV2(
      "Aviso monitors official exam websites and sends Telegram alerts when important announcements are published — so you never miss results, admit cards, answer keys, or deadlines.",
    ),
    "",
    bold("Commands"),
    "",
    commandLine("/start", "Register with Aviso and view the onboarding guide"),
    commandLine(
      "/help",
      "Show this help page with all available commands",
    ),
    commandLine("/exams", "List all exams currently available for subscription"),
    commandLine(
      "/subscribe",
      "Subscribe to an exam — usage: /subscribe <exam-slug>",
    ),
    commandLine(
      "/status",
      "Check which exams you are subscribed to and which notification types are enabled",
    ),
    commandLine(
      "/unsubscribe",
      "Cancel a subscription — usage: /unsubscribe <exam-slug>",
    ),
    "",
    bold("Tips"),
    "",
    escapeMarkdownV2(
      "Use /exams to find exam slugs, then /subscribe <slug> to start receiving alerts. Check /status anytime or /unsubscribe <slug> when you no longer want notifications.",
    ),
    "",
    // Future commands:
    // /latest — show recent announcements for subscribed exams
    // /settings — manage notification preferences per exam
    // /feedback — send product feedback to the Aviso team
  ].join("\n");
}

/**
 * Shown when a command requires registration first.
 */
export function getNotRegisteredMessage(): string {
  return escapeMarkdownV2("Please send /start first to register with Aviso.");
}
