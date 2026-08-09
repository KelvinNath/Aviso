import type {
  SendMessageOptions,
  TelegramApiResponse,
  TelegramBotCommand,
  TelegramBotCommandScope,
  TelegramGetUpdatesResponse,
  TelegramUpdate,
} from "./telegram.types.js";

function getBotToken(): string {
  const token = process.env.BOT_TOKEN;

  if (!token) {
    throw new Error("BOT_TOKEN environment variable is not set");
  }

  return token;
}

async function callTelegramApi<T>(
  method: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `https://api.telegram.org/bot${getBotToken()}/${method}`,
    init,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Long-polls Telegram for bot updates.
 */
export async function getUpdates(
  offset?: number,
  timeoutSeconds = 30,
): Promise<TelegramUpdate[]> {
  const params = new URLSearchParams({
    timeout: String(timeoutSeconds),
  });

  if (offset !== undefined) {
    params.set("offset", String(offset));
  }

  const data = await callTelegramApi<TelegramGetUpdatesResponse>(
    `getUpdates?${params.toString()}`,
  );

  if (!data.ok) {
    throw new Error("Telegram getUpdates returned ok: false");
  }

  return data.result;
}

export type { TelegramBotCommand, TelegramBotCommandScope };

/**
 * Sets the bot command menu for a scope (default or per-chat).
 */
export async function setMyCommands(
  commands: TelegramBotCommand[],
  scope?: TelegramBotCommandScope,
): Promise<void> {
  const body: Record<string, unknown> = { commands };

  if (scope) {
    body.scope = scope;
  }

  const data = await callTelegramApi<TelegramApiResponse>("setMyCommands", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!data.ok) {
    throw new Error("Telegram setMyCommands returned ok: false");
  }
}

/**
 * Sends a text message to a Telegram chat via the Bot API.
 */
export async function sendMessage(
  chatId: string,
  message: string,
  parseModeOrOptions?: "MarkdownV2" | SendMessageOptions,
): Promise<void> {
  let parseMode: "MarkdownV2" | undefined;
  let replyMarkup: SendMessageOptions["replyMarkup"];

  if (parseModeOrOptions === "MarkdownV2") {
    parseMode = "MarkdownV2";
  } else if (parseModeOrOptions) {
    parseMode = parseModeOrOptions.parseMode;
    replyMarkup = parseModeOrOptions.replyMarkup;
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: message,
  };

  if (parseMode) {
    body.parse_mode = parseMode;
  }

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  await callTelegramApi("sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
