export type TelegramUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type TelegramChat = {
  id: number;
  type: string;
};

export type TelegramMessage = {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

export type TelegramGetUpdatesResponse = {
  ok: boolean;
  result: TelegramUpdate[];
};

export type TelegramBotCommand = {
  command: string;
  description: string;
};

export type TelegramInlineKeyboardButton = {
  text: string;
  url?: string;
  callback_data?: string;
};

export type TelegramInlineKeyboardMarkup = {
  inline_keyboard: TelegramInlineKeyboardButton[][];
};

export type TelegramBotCommandScope =
  | { type: "default" }
  | { type: "chat"; chat_id: number | string };

export type SendMessageOptions = {
  parseMode?: "MarkdownV2";
  replyMarkup?: TelegramInlineKeyboardMarkup;
};

export type TelegramApiResponse = {
  ok: boolean;
};
