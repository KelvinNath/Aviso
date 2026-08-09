import { EventType } from "@prisma/client";

import { getUpdates, sendMessage } from "../adapters/telegram.adapter.js";
import {
  getHelpMessage,
  getNotRegisteredMessage,
  getWelcomeMessage,
} from "./bot-content.js";
import {
  linkTelegramAccountWithCode,
} from "./telegram-link.service.js";
import {
  buildExamsListMessage,
  buildSubscribeUsageMessage,
  buildUnsubscribeUsageMessage,
  listActiveExams,
} from "./telegram-exams.service.js";
import {
  buildAlreadySubscribedMessage,
  buildCycleEndedMessage,
  buildExamNotActiveMessage,
  buildExamNotFoundMessage,
  buildSubscribeSuccessMessage,
  buildUnsubscribeSuccessMessage,
  subscribeToExam,
  unsubscribeFromExam,
} from "./telegram-subscription.service.js";
import { getSubscriptionStatus } from "./telegram-status.service.js";
import {
  isAdminChat,
  sendTestNotification,
  TEST_COMMAND_ADMIN_ONLY_MESSAGE,
  TEST_COMMAND_USAGE,
} from "./telegram-test.service.js";
import { upsertTelegramUser } from "./telegram-user.service.js";
import type { TelegramUpdate } from "../adapters/telegram.types.js";

const POLL_TIMEOUT_SECONDS = 30;

const TEST_EVENT_MAP: Record<string, EventType> = {
  result: EventType.RESULT,
  admit: EventType.ADMIT_CARD_RELEASED,
  answerkey: EventType.ANSWER_KEY,
  examdate: EventType.EXAM_DATE,
  applicationopen: EventType.APPLICATION_OPEN,
  applicationclose: EventType.APPLICATION_CLOSE,
  counsellingopen: EventType.COUNSELLING_OPEN,
  counsellingclose: EventType.COUNSELLING_CLOSE,
};

function getCommand(text: string | undefined): string | null {
  if (!text) {
    return null;
  }

  return text.trim().split(/\s+/)[0]?.split("@")[0] ?? null;
}

function parseCommandArgs(text: string): string | null {
  const trimmed = text.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length < 2) {
    return null;
  }

  return parts.slice(1).join(" ").trim().toLowerCase() || null;
}

function parseStartPayload(text: string): string | null {
  const trimmed = text.trim();
  const [commandToken, ...rest] = trimmed.split(/\s+/);
  const command = commandToken?.split("@")[0];

  if (command !== "/start") {
    return null;
  }

  const payload = rest.join(" ").trim();
  return payload.length > 0 ? payload : null;
}

async function handleStartCommand(
  chatId: number,
  telegramUser: NonNullable<NonNullable<TelegramUpdate["message"]>["from"]>,
  linkCode: string | null,
): Promise<void> {
  if (linkCode) {
    const result = await linkTelegramAccountWithCode(
      linkCode,
      telegramUser,
      chatId,
    );

    await sendMessage(String(chatId), result.message);

    if (result.status === "success") {
      console.log(
        `[bot] Linked Telegram ${telegramUser.username ?? telegramUser.id} via deep link`,
      );
    }

    return;
  }

  await upsertTelegramUser(telegramUser, chatId);
  await sendMessage(String(chatId), getWelcomeMessage(), "MarkdownV2");

  console.log(
    `[bot] Registered ${telegramUser.username ?? telegramUser.id} (chat ${chatId})`,
  );
}

async function handleHelpCommand(chatId: number): Promise<void> {
  await sendMessage(String(chatId), getHelpMessage(), "MarkdownV2");
}

async function handleExamsCommand(chatId: number): Promise<void> {
  const exams = await listActiveExams();
  await sendMessage(String(chatId), buildExamsListMessage(exams));
}

async function handleSubscribeCommand(chatId: number, text: string): Promise<void> {
  const slug = parseCommandArgs(text);

  if (!slug) {
    const exams = await listActiveExams();
    await sendMessage(String(chatId), buildSubscribeUsageMessage(exams));
    return;
  }

  const result = await subscribeToExam(String(chatId), slug);

  switch (result.status) {
    case "not_registered":
      await sendMessage(String(chatId), getNotRegisteredMessage(), "MarkdownV2");
      return;
    case "exam_not_found":
      await sendMessage(String(chatId), buildExamNotFoundMessage(result.slug));
      return;
    case "exam_not_active":
      await sendMessage(
        String(chatId),
        buildExamNotActiveMessage(result.examName, result.slug),
      );
      return;
    case "cycle_ended":
      await sendMessage(
        String(chatId),
        buildCycleEndedMessage(
          result.examName,
          result.slug,
          result.cycleYear,
        ),
      );
      return;
    case "already_subscribed":
      await sendMessage(
        String(chatId),
        buildAlreadySubscribedMessage(result.examName),
      );
      return;
    case "subscribed":
      await sendMessage(
        String(chatId),
        buildSubscribeSuccessMessage(result.examName, result.eventTypes),
      );
      console.log(`[bot] Subscribed chat ${chatId} to ${result.examName}`);
      return;
  }
}

async function handleStatusCommand(chatId: number): Promise<void> {
  const message = await getSubscriptionStatus(String(chatId));
  await sendMessage(String(chatId), message);
}

async function handleUnsubscribeCommand(
  chatId: number,
  text: string,
): Promise<void> {
  const slug = parseCommandArgs(text);

  if (!slug) {
    const message = await buildUnsubscribeUsageMessage(String(chatId));
    await sendMessage(String(chatId), message);
    return;
  }

  const result = await unsubscribeFromExam(String(chatId), slug);

  switch (result.status) {
    case "not_registered":
      await sendMessage(String(chatId), "Please send /start first.");
      return;
    case "exam_not_found":
      await sendMessage(String(chatId), buildExamNotFoundMessage(result.slug));
      return;
    case "not_subscribed":
      await sendMessage(
        String(chatId),
        `You're not subscribed to ${result.examName}.`,
      );
      return;
    case "unsubscribed":
      await sendMessage(
        String(chatId),
        buildUnsubscribeSuccessMessage(result.examName, result.slug),
      );
      console.log(`[bot] Unsubscribed chat ${chatId} from ${result.examName}`);
      return;
  }
}

async function handleTestCommand(chatId: number, text: string): Promise<void> {
  if (!isAdminChat(chatId)) {
    await sendMessage(String(chatId), TEST_COMMAND_ADMIN_ONLY_MESSAGE);
    return;
  }

  const incoming = text.trim();
  const [, arg] = incoming.split(/\s+/);
  const key = arg?.toLowerCase();
  const eventType = key ? TEST_EVENT_MAP[key] : undefined;

  if (!eventType) {
    await sendMessage(String(chatId), TEST_COMMAND_USAGE);
    return;
  }

  await sendTestNotification(String(chatId), eventType);

  console.log(
    `[bot] Sent test notification preview (${eventType}) to admin chat ${chatId}`,
  );
}

async function handleUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;

  if (!message?.text) {
    return;
  }

  const text = message.text?.trim() ?? "";
  const [commandToken] = text.split(/\s+/);
  const testCommand = commandToken?.split("@")[0];
  const telegramUser = message.from;

  if (!telegramUser || telegramUser.is_bot) {
    return;
  }

  if (testCommand === "/test") {
    await handleTestCommand(message.chat.id, text);
    return;
  }

  const command = getCommand(message.text);
  const startPayload = parseStartPayload(text);

  if (command === "/start") {
    await handleStartCommand(message.chat.id, telegramUser, startPayload);
    return;
  }

  if (command === "/help") {
    await handleHelpCommand(message.chat.id);
    return;
  }

  if (command === "/exams") {
    await handleExamsCommand(message.chat.id);
    return;
  }

  if (command === "/subscribe") {
    await handleSubscribeCommand(message.chat.id, text);
    return;
  }

  if (command === "/status") {
    await handleStatusCommand(message.chat.id);
    return;
  }

  if (command === "/unsubscribe") {
    await handleUnsubscribeCommand(message.chat.id, text);
    return;
  }

  // Future commands: /latest, /settings, /feedback — add handlers above.
}

/**
 * Polls Telegram for updates until the process receives SIGINT or SIGTERM.
 */
export async function startTelegramBotPolling(): Promise<void> {
  let offset: number | undefined;
  let running = true;

  const stop = (): void => {
    running = false;
    console.log("[bot] Shutting down...");
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  console.log("[bot] Telegram polling started");

  while (running) {
    try {
      const updates = await getUpdates(offset, POLL_TIMEOUT_SECONDS);

      for (const update of updates) {
        offset = update.update_id + 1;

        try {
          await handleUpdate(update);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error(
            `[bot] Failed to handle update ${update.update_id}: ${message}`,
          );
        }
      }
    } catch (error) {
      if (!running) {
        break;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.error(`[bot] Polling error: ${message}`);
      await sleep(3000);
    }
  }

  console.log("[bot] Telegram polling stopped");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
