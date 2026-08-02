import "./load-env.js";
import { startTelegramBotPolling } from "./telegram-bot.service.js";

startTelegramBotPolling().catch((error) => {
  console.error("[bot] Fatal error:", error);
  process.exit(1);
});
