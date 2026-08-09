import {
  setMyCommands,
  type TelegramBotCommand,
} from "../adapters/telegram.adapter.js";

export const VISITOR_BOT_COMMANDS: TelegramBotCommand[] = [
  { command: "start", description: "Get started with AvisoMe" },
  { command: "exams", description: "Browse exams we watch" },
  { command: "help", description: "How AvisoMe works" },
];

export const CONNECTED_BOT_COMMANDS: TelegramBotCommand[] = [
  { command: "start", description: "Welcome back" },
  { command: "status", description: "See what you're tracking" },
  { command: "exams", description: "Browse available exams" },
  { command: "help", description: "How this bot works" },
];

/**
 * Sets the default command menu for new / unlinked Telegram chats.
 */
export async function setDefaultVisitorCommands(): Promise<void> {
  await setMyCommands(VISITOR_BOT_COMMANDS, { type: "default" });
}

/**
 * Sets visitor commands for a specific chat (e.g. after plain /start).
 */
export async function setVisitorCommandScope(chatId: number | string): Promise<void> {
  await setMyCommands(VISITOR_BOT_COMMANDS, { type: "chat", chat_id: chatId });
}

/**
 * Sets connected-user commands after a successful website link.
 */
export async function setConnectedCommandScope(
  chatId: number | string,
): Promise<void> {
  await setMyCommands(CONNECTED_BOT_COMMANDS, { type: "chat", chat_id: chatId });
}
