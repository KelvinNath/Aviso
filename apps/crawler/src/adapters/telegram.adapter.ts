import type { TelegramGetUpdatesResponse, TelegramUpdate } from "./telegram.types.js";

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

/**
 * Sends a text message to a Telegram chat via the Bot API.
 */
export async function sendMessage(
  chatId: string,
  message: string,
  parseMode?: "MarkdownV2",
): Promise<void> {
  const body: Record<string, string> = {
    chat_id: chatId,
    text: message,
  };

  if (parseMode) {
    body.parse_mode = parseMode;
  }

  await callTelegramApi("sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
