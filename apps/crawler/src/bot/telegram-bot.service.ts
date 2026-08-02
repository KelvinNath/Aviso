import { EventType } from "@prisma/client";

import { getUpdates, sendMessage } from "../adapters/telegram.adapter.js";
import {
  getAlreadySubscribedMessage,
  getHelpMessage,
  getNotRegisteredMessage,
  getWelcomeMessage,
} from "./bot-content.js";
import {
  linkTelegramAccountWithCode,
} from "./telegram-link.service.js";
import {
  buildSubscribeSuccessMessage,
  subscribeToJeeMain,
} from "./telegram-subscribe.service.js";
import { getSubscriptionStatus } from "./telegram-status.service.js";
import { unsubscribe } from "./telegram-unsubscribe.service.js";
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

async function handleSubscribeCommand(chatId: number): Promise<void> {
  const result = await subscribeToJeeMain(String(chatId));

  if (result === "not_registered") {
    await sendMessage(String(chatId), getNotRegisteredMessage(), "MarkdownV2");
    return;
  }

  if (result === "already_subscribed") {
    await sendMessage(String(chatId), getAlreadySubscribedMessage());
    return;
  }

  await sendMessage(String(chatId), buildSubscribeSuccessMessage());

  console.log(`[bot] Subscribed chat ${chatId} to JEE Main`);
}

async function handleStatusCommand(chatId: number): Promise<void> {
  const message = await getSubscriptionStatus(String(chatId));
  await sendMessage(String(chatId), message);
}

async function handleUnsubscribeCommand(chatId: number): Promise<void> {
  const message = await unsubscribe(String(chatId));
  await sendMessage(String(chatId), message);

  console.log(`[bot] Unsubscribed chat ${chatId} from JEE Main`);
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

  if (command === "/subscribe") {
    await handleSubscribeCommand(message.chat.id);
    return;
  }

  if (command === "/status") {
    await handleStatusCommand(message.chat.id);
    return;
  }

  if (command === "/unsubscribe") {
    await handleUnsubscribeCommand(message.chat.id);
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
