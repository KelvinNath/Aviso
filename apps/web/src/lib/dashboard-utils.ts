export function getTelegramBotUrl(): string | null {
  const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
  if (!username) {
    return null;
  }
  return `https://t.me/${username}`;
}

export function getGreetingName(displayName: string | null | undefined, email: string): string {
  if (displayName?.trim()) {
    return displayName.split(" ")[0] ?? displayName;
  }
  return email.split("@")[0] ?? "there";
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}
