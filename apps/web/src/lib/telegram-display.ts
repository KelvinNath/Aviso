/**
 * Returns a @username label for the dashboard when Telegram is connected.
 */
export function getTelegramHandle(
  telegramUsername: string | null | undefined,
  displayName: string | null | undefined,
): string | null {
  if (telegramUsername) {
    return telegramUsername.startsWith("@")
      ? telegramUsername
      : `@${telegramUsername}`;
  }

  if (displayName?.startsWith("@")) {
    return displayName;
  }

  return null;
}
